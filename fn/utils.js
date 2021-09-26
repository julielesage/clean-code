// Capitalize the first letter of a string
export const capitalize = str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
capitalize("hello, you are a cool person!"); // Result: "Hello, you are a cool person!"

// Calculate the number of days between two dates
export const diffDays = (date, otherDate) => Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));
diffDays(new Date('2014-12-19'), new Date('2020-01-01')); // Result: 1839

// Convert a string to a number implicitly
export const toNumber = str => +str;
toNumber("2"); // Result: 2

// Check if an array contains any items
export const isNotEmpty = arr => Array.isArray(arr) && arr.length > 0;
isNotEmpty([1, 2, 3]); // Result: true
isNotEmpty([]); // Result: false

// Merge but don't remove the duplications
const merge = (a, b) => a.concat(b);
// Or
const merge = (a, b) => [...a, ...b];
// Merge and remove the duplications
const merge = [...new Set(a.concat(b))];
// Or
const merge = [...new Set([...a, ...b])];

// Sort an array containing numbers
export const sort = arr => arr.sort((a, b) => a - b);
sort([1, 5, 2, 4, 3]); // Result: [1, 2, 3, 4, 5]

// Generate a random HEX color
export const randomColor = () => `#${Math.random().toString(16).slice(2, 8).padStart(6, '0')}`;
// Or
const randomColor = () => `#${(~~(Math.random() * (1 << 24))).toString(16)}`;

// Get the value of a specified cookie
export const cookie = name => `; ${document.cookie}`.split(`; ${name}=`).pop().split(';').shift();
cookie('_ga'); // Result: "GA1.2.1929736587.1601974046"

// Get the text that the user has selected
export const getSelectedText = () => window.getSelection().toString();
getSelectedText();
