let p1 = { name: 'bytefish' }
let p2 = { tag: 'JavaScript' }
let p3 = { ...p1, ...p2 }
// p3 = {name:  'bytefish', tag: 'JavaScript' }


let httpOptions = {
	method: "POST",
	url: "https://api.github.com",
	returnType: "json",
	timeout: 2000,
	data: {
		name: "bytefish"
	}
}
let { method, url, ...config } = httpOptions;
// method = POST
// url = https://api.github.com
// config = {returnType: "json", timeout: 2000, data : {name: "bytefish"}}


function team(leader, viceLeader, ...members) {
	console.log('leader: ' + leader)
	console.log('vice leader: ' + viceLeader)
	members.forEach(member => console.log('member: ' + member))
}
team('Jon', 'Jack', 'Bob', 'Alice');
// for indeterminate arguments


// DOUBLE DESTRUCTURE
const { user: { given_name: username }, search: { errorMessage } } = store.getState();
// const { user, search } = store.getState();
// const username = user && user.given_name;
// const errorMessage = search.errorMessage;

// OPTIONAL CHAIN
const catName = animal.cat?.name;

// OBJECT.ASSIGN
// DON'T
function createMenu(configuration) {
	config.title = config.title || "Foo";
	config.body = config.body || "Bar";
	config.buttonText = config.buttonText || "Baz";
	config.cancellable =
		config.cancellable !== undefined ? config.cancellable : true;
}
// D0
function createMenuBetter(configur) {
	return Object.assign(
		{
			title: "Foo",
			body: "Bar",
			buttonText: "Baz",
			cancellable: true
		},
		config
	);
	// configur now equals: {title: "Order", body: "Bar", buttonText: "Send", cancellable: true}
	// ca remplit les nulls par des valeurs par défaut.
}

// Longhand
const name = person.name;
const age = person.age;
const address = { city: person.city, state: person.state };

// Shorthand
const { name, age, ...address } = person;


