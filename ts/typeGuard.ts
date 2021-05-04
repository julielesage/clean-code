function isNumber(x: any): x is number {
	return typeof x === "number";
}
function add1(value: string | number) {
	if (isNumber(value)) {
		return value + 1;
	}
	return +value + 1;
}


interface Hunter {
	hunt: () => void;
}
// function type guard
function isHunter(x: unknown): x is Hunter {
	return (x as Hunter).hunt !== undefined;
}
const performAction = (x: unknown) => {
	if (isHunter(x)) {
		x.hunt();
	}
}
const animal = {
	hunt: () => console.log('hunt')
}
performAction(animal);