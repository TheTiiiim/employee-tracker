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

	addDatum = async (data) => {
		try {
			if (!this.#isInit) throw Error("table has not been initialized");
			// get array of columns that aren't auto-generated
			const cols = Object.values(this.getColumns()).filter((colData) => { return (colData.autoGenerate ? false : true) });

			const { results, fields } = await connection.query(`INSERT INTO ?? SET ?`, [this.getName(), data]);
			data.id = results.insertId;
			this.#data.push(data);
		} catch (err) { throw err }
	}

	getName = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return this.#name;
	}

	getColumns = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return this.#columns;
	}

	getData = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return this.#data;
	}

	displayData = () => {
		if (!this.#isInit) throw Error("table has not been initialized");

		// make copy of data so that it's not changed
		const displayData = JSON.parse(JSON.stringify(this.getData()));

		// store any links
		const links = {};

		// iterate over columns
		Object.entries(this.getColumns()).forEach(([key, value]) => {
			// check if columns are linked
			if (value.getValue) {
				// add function to links object
				links[key] = value.getValue;
			}
		});

		const numLinks = Object.keys(links).length;

		// if table has links
		if (numLinks > 0) {
			// iterate over data
			displayData.forEach((datum) => {
				// iterate over columns to link
				Object.keys(links).forEach((columnName) => {
					// get data linked to column
					const data = links[columnName](datum[columnName]);
					// remove linked column
					delete datum[columnName];
					// add fetched data
					Object.assign(datum, data);

				})
			})
		}

		console.table(this.getName(), displayData);
	}

	#queryData = async () => {
		const { results, fields } = await connection.query(`SELECT * FROM ??`, [this.#name]);
		const data = JSON.parse(JSON.stringify(results));
		this.#data = data;
		return data;
	}

	#queryColumns = async () => {
		// escaping table names doesnt work
		const { results, fields } = await connection.query(`SHOW COLUMNS FROM ??`, this.#name);

		const columns = {};
		results.forEach(({ [fields[0].name]: column }) => {
			columns[column] = { name: column };
			if (column === "id") columns[column].autoGenerate = true;
		});
		this.#columns = columns;

		return columns;
	}
}

module.exports = Table;