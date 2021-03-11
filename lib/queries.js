const cTable = require('console.table');

const { connection, tables } = require("./db");

const getData = async (table) => {
	// make sure table matches predefined list
	if (tables.indexOf(table) === -1) throw Error("given table name does not exist");

	return new Promise((resolve, reject) => {
		connection.query(`SELECT * FROM ${table}`, function (error, results, fields) {
			if (error) throw error;
			resolve({ results, fields });
		});
	})
}

module.exports = { getData };