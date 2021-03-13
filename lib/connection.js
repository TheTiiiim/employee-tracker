const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: "employeedb"
});

const close = async () => {
	return new Promise((resolve, reject) => {
		pool.end((err) => {
			if (err) throw err;
			resolve();
		})
	});
}

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

module.exports = { query, close };