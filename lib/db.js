const connection = require("./connection");
const Table = require("./Table");

class Database {
	#isInit = false;

	#data = {};

	init = async () => {
		try {
			// get table list
			const tables = await this.#queryTables();

			// get table data
			const promises = [];
			tables.forEach((table) => {
				this.#data[table] = new Table(table);
				promises.push(this.#data[table].init());
			});
			await Promise.all(promises);

			// id links functions, this setup is not ideal, but it works

			this.#data["employees"].getColumns()["role_id"].linkedName = "role";
			// get array of role names & ids for employee.role_id
			this.#data["employees"].getColumns()["role_id"].getChoices = () => {
				// return array of role names
				let choices = this.getTable("roles").getItems();
				choices = choices.map(({ name, id }) => { return { name: name, value: id } });
				return choices;
			}

			// get corrosponding role data for employee.role_id
			this.#data["employees"].getColumns()["role_id"].getValue = (role_id) => {
				// get role data that corrosponds to the role_id
				const role = this.getTable("roles").getItems().filter((role) => {
					return role_id === role.id;
				})[0];
				// place data in an object to be combined with displayed data
				const replacementColumns = {
					role: role.name
				}

				return replacementColumns;
			};

			this.#data["employees"].getColumns()["manager_id"].linkedName = "manager";
			// get array of manager names & ids for employee.manager_id
			this.#data["employees"].getColumns()["manager_id"].getChoices = () => {

				// return array of employee names (with role "manager")
				let choices = this.getTable("employees").getItems().filter(({ role_id }) => {
					// get role data that corrosponds to the role_id of referenced employee
					const role = this.getTable("roles").getItems().filter((role) => {
						return role_id === role.id;
					})[0];
					// return only employees that are managers
					return role.name.toLowerCase().includes("lead");
				});

				// make data presentable
				choices = choices.map(({ first_name, last_name, id }) => { return { name: `${first_name} ${last_name}`, value: id } });
				// add option for no manager
				choices.unshift({ name: "(No Manager)", value: null });

				return choices;
			}
			// get corrosponding manager data for employee.manager_id
			this.#data["employees"].getColumns()["manager_id"].getValue = (manager_id) => {
				// get employee data that corrosponds to the manager_id
				const employee = this.getTable("employees").getItems().filter((employee) => {
					return manager_id === employee.id;
				})[0];

				const replacementColumns = {}
				// check referenced employee exists (this is false is manager_id is null)
				if (employee) {
					// get role data that corrosponds to the role_id of referenced employee
					const role = this.getTable("roles").getItemByID(employee.role_id);

					// make sure referenced employee is a manager
					if (role.name.toLowerCase().includes("lead")) {
						// place data in an object to be combined with displayed data
						replacementColumns["manager"] = `${employee.first_name} ${employee.last_name}`
					}
				}

				return replacementColumns;
			};

			this.#data["roles"].getColumns()["department_id"].linkedName = "department";
			// get array of department names & ids for roles.department_id
			this.#data["roles"].getColumns()["department_id"].getChoices = () => {
				// return array of department names
				return this.getTable("departments").getItems().map(({ name, id }) => { return { name: name, value: id } })
			}

			// get corrosponding department data for roles.department_id
			this.#data["roles"].getColumns()["department_id"].getValue = (department_id) => {
				// get department data that corrosponds to the department_id
				const department = this.getTable("departments").getItems().filter((department) => {
					return department_id === department.id;
				})[0];
				// place data in an object to be combined with displayed data
				const replacementColumns = {
					department: department.name
				}

				return replacementColumns;
			};

			this.#isInit = true;
		} catch (err) { throw err }
	}

	close = () => {
		return connection.close();
	}

	getTableList = () => {
		if (!this.#isInit) throw Error("database has not been initialized");
		const tables = [];
		Object.keys(this.#data).forEach((key) => { tables.push(this.#data[key].getName()); });
		return tables;
	}

	getTable = (table) => {
		if (!this.#isInit) throw Error("database has not been initialized");
		return this.#data[table];
	}

	#queryTables = async () => {
		const { results, fields } = await connection.query("SHOW TABLES");
		const tables = [];
		results.forEach(({ [fields[0].name]: table }) => {
			tables.push(table);
		});
		return tables;
	}
}

module.exports = new Database();