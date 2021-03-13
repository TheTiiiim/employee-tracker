const inquirer = require("inquirer");

const db = require("./db");

const actions = ["Add", "View-All", "Update", "Delete"];

const getAction = async () => {
	try {
		const answers = await inquirer.prompt([{
			type: "list",
			name: "choice",
			choices: () => {
				let choices = [];
				actions.forEach((action) => {
					db.getTableList().forEach((table) => {
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
		console.error(err);
	}
}

module.exports = { getAction, actions };