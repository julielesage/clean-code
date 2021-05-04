// reverse string faster:
const str = "hello world !";
const reverseString = (s) => [...s].reverse().join('');
reverseString(str);

const letter = str[2];
// = str.charAt(2); = e 

const message = 'hello+this+is+a+message';
const messageWithSpace = message.replaceAll('+', ' ')

let arr = [...str]
//convert string to array