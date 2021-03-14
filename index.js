const db = require("./lib/db");
const menu = require("./lib/menu");

async function main() {
	try {
		await db.init();

		let willContinue = false;
		// cli loop
		do {
			const command = await menu.getCommand();
			// returns false if action === 'exit' or no command is executed
			willContinue = await menu.doCommand(command);
		} while (willContinue);
	}
	catch (err) {
		console.error(err);
	}
	db.close().catch(console.error);
}

main();