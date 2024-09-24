/* introduit avec ES6, yield retourne un état intermédiaire avant le "return" de la function */

function* foo(index) {
    while (index < 2) {
      yield index;
      index++;
    }
  }
  
  const iterator = foo(0);
  
  console.log(iterator.next().value);
  // Expected output: 0
  
  console.log(iterator.next().value);
  // Expected output: 1