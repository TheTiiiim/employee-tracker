const connection = require("./connection");
const Table = require("./Table");

class Database {
	#isInit = false;

	#data = {};

	init = async () => {
		try {
			// get tables
			const tables = await this.#queryTables();

			// get columns
			const promises = [];
			tables.forEach((table) => {
				this.#data[table] = new Table(table);
				promises.push(this.#data[table].init());
			});
			await Promise.all(promises);

			this.#isInit = true;
		} catch (err) { throw err }
	}

	close = () => {
		return connection.close();
	}

	getTableList = () => {
		if (!this.#isInit) throw Error("database has not been initialized");
		const tables = [];
		Object.entries(this.#data).forEach(([key, value]) => { tables.push(value.getName()); });
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