const mysql = require('mysql');
require('dotenv').config();

const tables = ["Employees", "Roles", "Departments"];

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: "employeedb"
});

connection.connect(function (err) {
	if (err) {
		console.error('error connecting to db: ' + err.stack);
		return;
	}

	console.log('connected to db as id ' + connection.threadId);
});

module.exports = connection;