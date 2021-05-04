// if function is fast and synchronous
const everySecond= () => console.log("Second:" +new Date().getSeconds());
setInterval(everySecond, 1000);

// if function is slow or asynchronous, better call setTimeout with recursive
const everySeconds = async() => await console.log("Second:" +new Date().getSeconds());
setTimeout( function namedFunction() {
  everySeconds();
  setTimeout(namedFunction, 1000);
}, 1000);