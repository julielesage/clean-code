// FLATMAP = .filter((n) => n >=5).map((n) => n  * 2)

let anArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let by2 = anArrray.flatMap((n) => n >= 5 ? [n * 2] : []);
// b2 = [10, 12, 14, 16, 18, 20]

// get array fields in variable
let anotherArray = ["a", "b", "c", "d", "e", "f", "g", "h"];
let { 2: v1 } = anotherArray;
// v1 = "c"

// get array length in a variable
let { lenth } = anotherArray;
// length = 8

// clear an array
anArray = [];
// or
anArray.length = 0;
// anArray[0] = undefined

// trim or extend an array
anotherArray.length = 4;
// anotherArray= [ "a", "b", "c", "d"]
anotherArray.length = 5;
// anotherArray= [ "a", "b", "c", "d", undefined]

// MAX/MIN
let arr = [2, 8, 15, 4];
Math.max(...arr); // 15 
Math.min(...arr); // 2

// CONCAT
let arrconcat = [...arr, 60, 80];
// = = arr.concat([60, 80]); 

// .every()
const cars = [
	{ brand: "Porsche", price: 100000, builtIn: 2018 },
	{ brand: "Audi", price: 80000, builtIn: 2019 },
	{ brand: "Toyota", price: 30000, builtIn: 2019 }
];
let carsYoungerThanFiveYears = cars.every(car => car.builtIn >= 2016);
// = true

// .some()
carsYoungerThanFiveYears = cars.some(car => car.builtIn < 2016);
// = false