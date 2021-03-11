const cTable = require('console.table');

const { connection, tables } = require("../db");

const displayData = async (table) => {
	// make sure table matches predefined list
	if (tables.indexOf(table) === -1) throw Error("given table name does not exist");

	connection.query(`SELECT * FROM ${table}`, function (error, results, fields) {
		if (error) throw error;

		console.table(results)
	});
}

module.exports = displayData;