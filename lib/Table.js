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

	addItem = async (data) => {
		try {
			if (!this.#isInit) throw Error("table has not been initialized");
			// get array of columns that aren't auto-generated
			const cols = Object.values(this.getColumns()).filter((colData) => { return (colData.autoGenerate ? false : true) });

			const { results, fields } = await connection.query(`INSERT INTO ?? SET ?`, [this.getName(), data]);
			data.id = results.insertId;
			this.#data.push(data);
		} catch (err) { throw err }
	}

	updateItem = async (itemID, columnName, newValue) => {
		const { results, fields } = await connection.query(`UPDATE ?? SET ?? = ? WHERE id = ?`, [this.getName(), columnName, newValue, itemID]);
		this.getItemByID(itemID)[columnName] = newValue;
	}

	deleteItem = async (itemID) => {
		try {
			const { results, fields } = await connection.query(`DELETE FROM ?? WHERE id = ?`, [this.getName(), itemID]);
			for (const key in this.#data) {
				if (this.#data[key].id === itemID) {
					delete this.#data[key];
					break;
				}
			}
		} catch (err) {
			throw err
		}
	}

	getName = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return this.#name;
	}

	getColumns = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return this.#columns;
	}

	getColumnsArray = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return Object.values(this.#columns);
	}

	getItemByID = (id) => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return this.getItemsArray().filter(({ id: filterID }) => {
			return filterID === id
		})[0];
	}

	getItems = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return this.#data;
	}

	getItemsArray = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		return Object.values(this.getItems());
	}

	getLinkedArray = (itemsArray = this.getItemsArray()) => {
		if (!this.#isInit) throw Error("table has not been initialized");
		if (!Array.isArray(itemsArray)) throw Error("itemsArray is not array")

		// store any links
		const links = {};

		// iterate over columns
		this.getColumnsArray().forEach((column) => {
			// check if columns are linked
			if (column.getValue) {
				// add function to links object
				links[column.name] = column.getValue;
			}
		});

		// if table has no links, return original data
		if (Object.keys(links).length === 0) return itemsArray;

		// iterate over data
		return itemsArray.map((item) => {
			const returnItem = JSON.parse(JSON.stringify(item));
			// iterate over columns to link
			Object.keys(links).forEach((columnName) => {
				// get data linked to column
				const data = links[columnName](returnItem[columnName]);
				// remove linked column
				delete returnItem[columnName];
				// add fetched data
				Object.assign(returnItem, data);
			});

			return returnItem;
		})
	}

	displayItems = () => {
		if (!this.#isInit) throw Error("table has not been initialized");
		const displayItems = this.getLinkedArray();
		console.table(this.getName(), displayItems);
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