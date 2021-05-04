// FAST SWAP
let x = "hello", y = 55;
[x, y] = [y, x];
// x = 55, y = "hello"

// FAST DECLARE
let a, b = 20;
// a = undefined, b = 20
let [c, d, e] = [5, 8, 7];

console.log(`You got a missed call from ${a} at ${b}`);

// string to number
let total = +'453'; 
// = let total = parseInt('453'); 
let average = +'42.6';
// = let average = parseFloat('42.6'); 