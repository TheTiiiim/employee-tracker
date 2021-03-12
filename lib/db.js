const mysql = require('mysql');
const cTable = require('console.table');

require('dotenv').config();

class Database {
	// to keep track of properties
	#isInit = false;
	#poolOptions;
	#pool;

	#data = {};

	constructor(poolOptions) {
		this.#poolOptions = poolOptions;
	};

	init = async () => {
		try {
			this.#pool = mysql.createPool(this.#poolOptions);

			// get tables
			const tables = await this.#queryTables();

			// get columns
			const promises = [];
			tables.forEach((table) => {
				promises.push(new Promise(async (resolve, reject) => {
					await this.#queryColumns(table);
					await this.#queryTableData(table);
					resolve();
				}));
			});
			await Promise.all(promises);

			this.#isInit = true;
		} catch (err) { throw err }
	}

	close = () => {
		return new Promise((resolve, reject) => {
			this.#pool.end((err) => {
				if (err) throw err;
				resolve();
			})
		});
	}

	getTables = () => {
		if (!this.#isInit) throw Error("database has not been initialized");
		const tables = [];
		Object.entries(this.#data).forEach(([key, value]) => { tables.push(value.name); });
		return tables;
	}

	getData = (table) => {
		if (!this.#isInit) throw Error("database has not been initialized");
		return this.#data[table].data;
	}

	#queryTableData = async (table) => {
		const { results, fields } = await this.#query(`SELECT * FROM ${table}`);
		const data = JSON.parse(JSON.stringify(results));
		this.#data[table].data = data;
		return data;
	}

	#queryTables = async () => {
		const { results, fields } = await this.#query("SHOW TABLES");
		const tables = [];
		results.forEach(({ [fields[0].name]: table }) => {
			tables.push(table);
			this.#data[table] = { name: table };
		});
		return tables;
	}

	#queryColumns = async (table) => {
		// escaping table names doesnt work
		const { results, fields } = await this.#query(`SHOW COLUMNS FROM ${table}`);

		const columns = [];
		results.forEach(({ [fields[0].name]: table }) => {
			columns.push(table);
		});
		this.#data[table].columns = columns;

		return columns;
	}

	#query = (queryString, escapedValues = []) => {
		return new Promise((resolve, reject) => {
			this.#pool.getConnection(function (err, connection) {
				if (err) throw err;
				connection.query(queryString, escapedValues, function (error, results, fields) {
					connection.release();
					if (error) throw error;
					resolve({ results, fields });
				});
			});
		});
	}
}

module.exports = new Database({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: "employeedb"
});