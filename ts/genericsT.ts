function addItem<T extends boolean | string>(item: T, array: T[]) {
	array = [...array, item];
	return array;
}

addItem('hello', []);

addItem(true, [true, true]);
