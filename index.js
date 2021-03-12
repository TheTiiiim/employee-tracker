const db = require("./lib/db");
const menu = require("./lib/menu");

async function main() {
	try {
		await db.init();
		// cli loop
		const { action, table } = await menu.getAction();

		switch (action) {
			// Add
			case menu.actions[0]:
				break;
			// View-All
			case menu.actions[1]:
				const data = await db.getData(table);
				console.table(data);
				break;
			// Update
			case menu.actions[2]:
				break;
			// Delete
			case menu.actions[3]:
				break;
		}
	}
	catch (err) {
		console.error(err);
	}
	db.close();
}

main();