const connection = require("./connection");
const cTable = require('console.table');

class Table {
	#isInit = false;

	#name;
	#data;
	#columns;

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
		const { results, fields } = await connection.query(`SELECT * FROM ${this.#name}`);
		const data = JSON.parse(JSON.stringify(results));
		this.#data = data;
		return data;
	}

	#queryColumns = async () => {
		// escaping table names doesnt work
		const { results, fields } = await connection.query(`SHOW COLUMNS FROM ${this.#name}`);

		const columns = [];
		results.forEach(({ [fields[0].name]: column }) => {
			columns.push(column);
		});
		this.#columns = columns;

		return columns;
	}
}

module.exports = Table;