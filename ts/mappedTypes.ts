// KEYOF
type Person = {
	name: string;
	surname: string;
	email: string;
}

type PersonKeys = keyof Person;
// extract keys form Person => PersonKeys = 'name' | 'surname' | 'email'

interface Demo {
	a: string;
	b: string;
}
type a = Demo['a'];
// get one variable from an inteface

// [P in keyof T]: T[P]; ?

type ConditionalType = string extends boolean ? string : boolean;
// T extends U ? X : Y

// INFER
const array: number[] = [1, 2, 3, 4];
type X = typeof array extends (infer U)[] ? U : never;
// as array extends infer U[], the X variable will be equal to a Number.

function addItem<T extends boolean | string>(item: T, array: T[]) {
	array = [...array, item];
	return array;
}
addItem('hello', []);
addItem(true, [true, true]);