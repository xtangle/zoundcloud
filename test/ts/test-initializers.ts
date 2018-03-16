import ISuiteCallbackContext = Mocha.ISuiteCallbackContext;

export function useSinonChai(): Chai.ExpectStatic {
  const chai = require('chai');
  const sinonChai = require('sinon-chai');
  chai.use(sinonChai);
  return chai.expect;
}

export function useSinonChrome(this: ISuiteCallbackContext) {
  const sinonChrome = require('sinon-chrome');

  before(() => {
    (global as any).chrome = sinonChrome;
  });

  afterEach(() => {
    sinonChrome.flush();
    sinonChrome.reset();
  });

  after(() => {
    delete (global as any).chrome;
  });

  return sinonChrome;
}
