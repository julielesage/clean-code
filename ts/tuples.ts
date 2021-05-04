/* Tuple types allow you to express an array with a fixed number of elements whose types are known, but need not be the same.*/

// declaration
const array: [string, number] = ['test', 12];
// =
const otherArray = ['test', 12] as const;
// "as const" will be read only