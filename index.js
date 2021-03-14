const db = require("./lib/db");
const menu = require("./lib/menu");

async function main() {
	try {
		await db.init();

		let exit = false;

		// cli loop
		do {
			const { action, table } = await menu.getAction();

			switch (action) {
				// View-All
				case menu.actions[0]:
					// TODO: create menu options to view-all or veiw grouped by linked columns
					await db.getTable(table).displayItems();
					break;
				// Add
				case menu.actions[1]:
					await menu.createItem(table);
					break;
				// Update
				case menu.actions[2]:
					await menu.updateItem(table);
					break;
				// Delete
				case menu.actions[3]:
					await menu.deleteItem(table);
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