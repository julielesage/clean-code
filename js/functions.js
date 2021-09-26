// DON'T
function createMenu(title, body, buttonText, cancellable) {
	// ...
}
createMenu("Foo", "Bar", "Baz", true);


// DO
function createMenu({ title, body, buttonText, cancellable }) {
	// ...
}
createMenu({
	title: "Foo",
	body: "Bar",
	buttonText: "Baz",
	cancellable: true
});

// DON'T
function emailClients(clients) {
	clients.forEach(client => {
		const clientRecord = database.lookup(client);
		if (clientRecord.isActive()) {
			email(client);
		}
	});
}

// DO
function emailActiveClients(clients) {
	clients.filter(isActiveClient).forEach(email);
}

function isActiveClient(client) {
	const clientRecord = database.lookup(client);
	return clientRecord.isActive();
}

// DON'T MODIFY ORIGINAL
const addItemToCart = (cart, item) => {
	cart.push({ item, date: Date.now() });
};
// DO
const addItemToCartBetter = (cart, item) => {
	return [...cart, { item, date: Date.now() }];
};
/*----------------------------------------------*/
const programmerOutput = [
	{
		name: "Uncle Bobby",
		linesOfCode: 500
	},
	{
		name: "Suzie Q",
		linesOfCode: 1500
	},
	{
		name: "Jimmy Gosling",
		linesOfCode: 150
	},
	{
		name: "Gracie Hopper",
		linesOfCode: 1000
	}
];
// DON'T 
let totalOutput = 0;
for (let i = 0; i < programmerOutput.length; i++) {
	totalOutput += programmerOutput[i].linesOfCode;
}

// DO  
const totalOutputBetter = programmerOutput.reduce(
	(totalLines, output) => totalLines + output.linesOfCode,
	0
);

// MANDATORY PARAMETER
function Greet(message) {
	if (message === undefined) {
		throw new Error("Missing parameter!");
	}
	// do some operations here
	return message;
}
mandatory = () => {
	throw new Error("Missing parameter!");
};
Greet = (message = mandatory()) => {
	// do some operations here
	return message;
};




