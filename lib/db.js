const mysql = require('mysql');
const cTable = require('console.table');

require('dotenv').config();

const pool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: "employeedb"
});

const query = (queryString, escapedValues = []) => {
	return new Promise((resolve, reject) => {
		pool.getConnection(function (err, connection) {
			if (err) throw err;
			connection.query(queryString, escapedValues, function (error, results, fields) {
				connection.release();
				if (error) throw error;
				resolve({ results, fields });
			});
		});
	});
}

class Database {
	// to keep track of properties
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
		return new Promise((resolve, reject) => {
			pool.end((err) => {
				if (err) throw err;
				resolve();
			})
		});
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
		const { results, fields } = await query("SHOW TABLES");
		const tables = [];
		results.forEach(({ [fields[0].name]: table }) => {
			tables.push(table);
		});
		return tables;
	}
}

class Table {
	#name;
	#data;
	#columns;
	#isInit = false;

	constructor(name) {
		this.#name = name;
	}

	init = async () => {
		await this.#queryColumns();
		await this.#queryData();
		this.#isInit = true;
	};

	getName = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return this.#name;
	}

	getData = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return this.#data;
	}

	#queryData = async () => {
		const { results, fields } = await query(`SELECT * FROM ${this.#name}`);
		const data = JSON.parse(JSON.stringify(results));
		this.#data = data;
		return data;
	}

	#queryColumns = async () => {
		// escaping table names doesnt work
		const { results, fields } = await query(`SHOW COLUMNS FROM ${this.#name}`);

		const columns = [];
		results.forEach(({ [fields[0].name]: column }) => {
			columns.push(column);
		});
		this.#columns = columns;

		return columns;
	}
}

module.exports = new Database();