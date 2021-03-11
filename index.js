const mainMenu = require("./lib/menus/main");

mainMenu.getAction().then((action, table) => {
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
})