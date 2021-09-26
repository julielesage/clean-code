const { updateSpread } = require("typescript");

// use
const colors = {
	black: useBlack,
	red: useRed,
	...
};

//instead of 
if (color === "black")
	useBlack();
else if (color === "red")
	useRed();
//do :
colors[color]();

// avoiding if null
let imagePath = getImagePath() || 'default.jpg';
/* = let imagePath; 
let path = getImagePath(); 
if(path !== null && path !== undefined && path !== '') { 
  imagePath = path; 
} else { 
  imagePath = 'default.jpg'; 
} */

if ([1, 'one', 2, 'two'].includes(value)) {
	// Execute some code 
}
/* equivalent :
if (value === 1 || value === 'one' || value === 2 || value === 'two') { 
	// Execute some code 
}*/

let a = 1;
a &&= 3
// = if (a) { a = 3}
let b = 0;
b ||= 3
// = if (!b) { b = 3}
let a = undefined;
a ??= 7

// DON'T
if (fsm.state === "fetching" && isEmpty(listNode)) {
	// ...
}
// DO
function shouldShowSpinner(fsm, listNode) {
	return fsm.state === "fetching" && isEmpty(listNode);
}

if (shouldShowSpinner(fsmInstance, listNodeInstance)) {
	// ...
}

const something = 2;

// Longhand
switch (something) {
	case 1:
		doSomething();
		break;
	case 2:
		doSomethingElse();
		break;
	case 3:
		doSomethingElseAndOver();
		break;
}

// Shorthand
var cases = {
	1: doSomething,
	2: doSomethingElse,
	3: doSomethingElseAndOver,
};

cases[2]();

if (res === 25 || res === "twenty-five" || res === 25.0) {
	// some action here
}

// Shorthand
if ([25, "twenty-five", 25.0].includes(res)) {
	// some action here
}