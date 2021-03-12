const mysql = require('mysql');
const cTable = require('console.table');

require('dotenv').config();

class Database {
	// to keep track of properties
	#isInit = false;
	#poolOptions;
	#pool;
	#tables;

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
				promises.push(this.#queryColumns(table));
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
		if (!this.#isInit) throw Error("database has not been initialized")
		// TODO: get tables from `this.#data` instead of `this.#tables`
		return this.#tables;
	}

	getData = (table) => {
		// TODO: keep data stored and just serve that
		if (!this.#isInit) throw Error("database has not been initialized")
		// escaping table names doesnt work
		return this.#query(`SELECT * FROM ${table}`);
	}

	#queryTables = async () => {
		const { results, fields } = await this.#query("SHOW TABLES");
		const tables = [];
		results.forEach(({ [fields[0].name]: table }) => {
			tables.push(table);
			this.#data[table] = { name: table };
		});
		this.#tables = tables;
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