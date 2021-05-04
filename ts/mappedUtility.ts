// READONLY
interface Teacher {
	name: string;
	email: string;
}
type ReadonlyTeacher = Readonly<Teacher>;
const t: ReadonlyTeacher = { name: 'jose', email: 'jose@test.com' };
//t.name = 'max'; 
// Error: Cannot assign to 'name' because it is a read-only property

// OMIT
// PARTIAL
// EXCLUDE
// EXTRACT
// NONNULLABLE
// RETURNTYPE

// CUSTOM UTILITY TO REMOVE READONLY
interface Teacheri {
	readonly nami: string;
	readonly emaili: string;
}
type Writeable<T> = { -readonly [P in keyof T]: T[P] };
let ti: Writeable<Teacheri> = { nami: 'jose', emaili: 'jose@test.com' };
ti.nami = 'max'; // works fine