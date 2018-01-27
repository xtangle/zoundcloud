import {expect} from 'chai';
import 'mocha';
import {greeter} from './app';

// See: https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2

describe('Greeter function', () => {

  it('should greet a person', () => {
    const result = greeter('Jacky');
    expect(result).to.equal('Hello, Jacky!');
  });

});
