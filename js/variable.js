// FAST SWAP
let x = "hello", y = 55;
[x, y] = [y, x];
// x = 55, y = "hello"

// FAST DECLARE
let a, b = 20;
// a = undefined, b = 20
let [c, d, e] = [5, 8, 7];

// always use string/variables between ``
console.log(`You got a missed call from ${a} at ${b}`);

// string to number
let total = +'453';
// = let total = parseInt('453'); 
let average = +'42.6';
// = let average = parseFloat('42.6');

//to add default values for null, si null valeur de droite, si non valeur de gauche
let foo = null;
let bar = 56;
let str = "nope";
foo = null ?? "jos";
bar = 57 ?? 78;
str = "tyu" ?? "fgh"
// foo = "jos", bar = 57, str = tyu

// && OPERATOR
let message;
// Longhand
if (message === null || message === undefined) {
	message = "Hello";
}
console.log(message + "there");
// Shorthand
console.log((message ?? "Hello") + "there");

functionOne = () => {
	// something here
	console.log("functionOne called!");
	return undefined;
};

functionTwo = () => {
	// something here
	console.log("functionTwo called!");
	return false;
};

functionThree = () => {
	// something here
	console.log("functionThree called!");
	return "hello!";
};

Longhand
if (functionOne() !== undefined) { // functionOne called!
	console.log(functionThree());
}

if (functionTwo() !== undefined) { // functionTwo called!
	console.log(functionThree()); // functionThree called!, hello!
}
// Shorthand
console.log(functionOne() ?? functionThree()); // functionOne called!

console.log(functionTwo() ?? functionThree());
// functionTwo called!, functionThree called!, hello!

// Longhand
console.log(person && person.address && person.address.country); // undefined

// Shorthand
console.log(person?.address?.country); // undefined
// Longhand
greetings = (partOne, partTwo) => {
	if (partTwo === null || partTwo === undefined) {
		partTwo = "!";
	}
	return partOne + partTwo;
};

console.log(greetings("Hello")); // Hello!

// Shorthand
greetings = (partOne, partTwo) => {
	partTwo ??= "!";
	return partOne + partTwo;
};

console.log(greetings("Hello")); // Hello!

// // Longhand
one = 1;
two = 2;

// // Shorthand
[one, two] = [1, 2];

// Longhand
function volume(length, width, height) {
	if (width === undefined) width = 2;
	if (height === undefined) height = 2;
	return length * width * height;
}
// Shorthand
volume = (length, width = 2, height = 2) => length * width * height;

// SWAP
[personOne, personTwo] = [personTwo, personOne];