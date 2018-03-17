export function useSinonChai(): Chai.ExpectStatic {
  const chai = require('chai');
  const sinonChai = require('sinon-chai');
  chai.use(sinonChai);
  return chai.expect;
}

export function useSinonChrome() {
  const sinonChrome = require('sinon-chrome');

  before('add stubbed chrome object to global scope', () => {
    (global as any).chrome = sinonChrome;
  });

  afterEach('reset stubbed chrome object', () => {
    sinonChrome.flush();
    sinonChrome.reset();
  });

  after('delete stubbed chrome object from global scope', () => {
    delete (global as any).chrome;
  });

  return sinonChrome;
}
