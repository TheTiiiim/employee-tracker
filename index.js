const db = require("./lib/db");
const menu = require("./lib/menu");

async function main() {
	try {
		await db.init();

		let exit = false;

		do {
			// cli loop
			const { action, table } = await menu.getAction();

			switch (action) {
				// Add
				case menu.actions[0]:
					await menu.createDatum(table);
					break;
				// View-All
				case menu.actions[1]:
					await db.getTable(table).displayData();
					break;
				// Update
				case menu.actions[2]:
					break;
				// Delete
				case menu.actions[3]:
					break;
				case "exit":
					exit = true;
					break;
			}
		} while (!exit);
	}
	catch (err) {
		console.error(err);
	}
	db.close();
}

main();