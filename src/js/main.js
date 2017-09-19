// Import a couple modules for testing.
import { sayHelloTo } from './modules/mod1';
import addArray from './modules/mod2';
import $ from 'jquery';

// Run some functions from our imported modules.
const result1 = sayHelloTo('Jason');
const result2 = addArray([1, 2, 3, 4]);

// Print the results on the page.
const printTarget = $('.debug__output');

printTarget.append(document.createTextNode(`sayHelloTo('Jason') => ${result1}\n\n`));
printTarget.append(document.createTextNode(`addArray([1, 2, 3, 4]) => ${result2}`));
