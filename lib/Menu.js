const inquirer = require("inquirer");

const db = require("./db");

const actions = ["Add", "View-All", "Update", "Delete"];

const getAction = async () => {
	try {
		const answers = await inquirer.prompt([{
			type: "list",
			name: "choice",
			choices: () => {
				let choices = ["exit"];
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
		throw err;
	}
}

const createDatum = async (tableName) => {
	try {
		const table = db.getTable(tableName);
		const columns = table.getColumns();

		// generate questions for table
		const questions = [];
		for (const name in columns) {
			const column = columns[name];
			const question = { name: name };

			question.message = `enter ${table.getName()} ${name}`;

			// add columns that have one property (name)
			if (Object.keys(column).length === 1) {
				question.type = "input";
			};
			// add columns with property "getChoices"
			if (Object.keys(column).includes("getChoices")) {
				question.type = "list";
				question.choices = column.getChoices;
				question.filter = (name) => {
					// replace name of choice with id of choice
					return column.getChoices().filter((choice) => { return choice.name === name })[0].id;
				}
			};

			if (!column.autoGenerate) questions.push(question);
		};

		const answers = await inquirer.prompt(questions);

		table.addDatum(answers);
	} catch (err) {
		throw err;
	}
};

module.exports = { getAction, actions, createDatum };