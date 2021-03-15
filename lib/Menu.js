const inquirer = require("inquirer");

const db = require("./db");
const commands = require("./menu/commands")

const actions = ["View", "Add", "Update", "Delete"];

const getCommand = async () => {
	try {
		const answers = await inquirer.prompt([{
			type: "list",
			name: "choice",
			choices: () => {
				let choices = ["exit"];
				db.getTableList().forEach((table) => {
					actions.forEach((action) => {
						choices.push(`${action} ${table}`);
					});
				});
				return choices;
			}
		}]);
		// get action and target from prompt choice
		const [action, table] = answers.choice.split(" ");
		return { action, table };
	} catch (err) {
		throw err;
	}
}

const doCommand = async ({ action, table }) => {
	try {
		switch (action) {
			case "exit":
			default:
				// an action was not done
				return false;
			// View
			case actions[0]:
				await commands.viewItems(table);
				break;
			// Add
			case actions[1]:
				await commands.addItem(table);
				break;
			// Update
			case actions[2]:
				await commands.updateItem(table);
				break;
			// Delete
			case actions[3]:
				await commands.deleteItem(table);
				break;
		}
		// an action was done
		return true;
	} catch (err) { throw err }
}

module.exports = { getCommand, doCommand };