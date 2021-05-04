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