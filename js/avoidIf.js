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
//bklablablabl :

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

// avoiding
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