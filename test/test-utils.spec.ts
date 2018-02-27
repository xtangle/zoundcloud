import * as chai from 'chai';
import {expect} from 'chai';
import {match, stub} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {doNothingIfMatch} from './test-utils';

describe('test utils', () => {
  chai.use(sinonChai);

  describe('the doNothingIfMatch function', () => {
    const obj = {hello: (arg: any) => `hello ${arg}`};
    const sinonStub = stub(obj, 'hello');

    afterEach(() => {
      sinonStub.reset();
    });

    it('should not do anything if arguments match matcher', () => {
      doNothingIfMatch(sinonStub, match(42));
      expect(obj.hello(42)).to.be.undefined;
    });

    it('should call through if arguments do not match matcher', () => {
      doNothingIfMatch(sinonStub, match(42));
      expect(obj.hello(3)).to.be.equal('hello 3');
    });
  });

});
