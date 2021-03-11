const { connection, tables } = require("./lib/db");
const queries = require("./lib/queries");
const menu = require("./lib/menu");

// connection
connection.connect(async (err) => {
	if (err) {
		console.error('error connecting to db: ' + err.stack);
		return;
	}

	console.log('connected to db as id ' + connection.threadId);

	try {
		// cli loop
		const { action, table } = await menu.getAction();

		switch (action) {
			// Add
			case menu.actions[0]:
				break;
			// View-All
			case menu.actions[1]:
				const { results, fields } = await queries.getData(table);
				console.table(results);
				break;
			// Update
			case menu.actions[2]:
				break;
			// Delete
			case menu.actions[3]:
				break;
		}
	}
	catch (err) { console.error(err) }

	connection.end();
});