const { connection, tables } = require("./lib/db");
const mainMenu = require("./lib/menus/main");
const displayData = require("./lib/displayData");

// connection
connection.connect(async (err) => {
	if (err) {
		console.error('error connecting to db: ' + err.stack);
		return;
	}

	console.log('connected to db as id ' + connection.threadId);

	try {
		// cli loop
		const { action, table } = await mainMenu.getAction();

		switch (action) {
			// Add
			case mainMenu.actions[0]:
				break;
			// View-All
			case mainMenu.actions[1]:
				break;
			// Update
			case mainMenu.actions[2]:
				break;
			// Delete
			case mainMenu.actions[3]:
				break;
		}
	}
	catch (err) { console.error(err) }

	connection.end();
});