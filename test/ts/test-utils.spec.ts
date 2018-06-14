import {useSinonChai} from '@test/test-initializers';
import {doNothingIf, matchesCause, matchesError, tick} from '@test/test-utils';
import {match, spy, stub} from 'sinon';
import * as VError from 'verror';

const expect = useSinonChai();

describe('test utils', () => {

  describe('the doNothingIf function', () => {
    const obj = {hello: (arg: any) => `hello ${arg}`};
    const sinonStub = stub(obj, 'hello');

    afterEach(() => {
      sinonStub.resetHistory();
    });

    it('should not do anything if arguments match matcher', () => {
      doNothingIf(sinonStub, match(42));
      expect(obj.hello(42)).to.be.undefined;
    });

    it('should call through if arguments do not match matcher', () => {
      doNothingIf(sinonStub, match(42));
      expect(obj.hello(3)).to.be.equal('hello 3');
    });
  });

  describe('the tick function', () => {
    const sinonSpy = spy();

    afterEach(() => {
      sinonSpy.resetHistory();
    });

    it('should return a promise that resolves in 0 ms by default', async () => {
      setTimeout(sinonSpy, 0);
      expect(sinonSpy).to.not.have.been.called;
      await tick();
      expect(sinonSpy).to.have.been.called;
    });

    it('should return a promise that resolves after specified time in ms', async () => {
      const delay = 50;
      setTimeout(sinonSpy, delay);
      await tick(delay - 1);
      expect(sinonSpy).to.not.have.been.called;
      await tick(1);
      expect(sinonSpy).to.have.been.called;
    });
  });

  describe('the matchesError matcher', () => {
    const error = new Error('some error message');
    const callback = spy();

    beforeEach(() => {
      callback(error);
    });

    afterEach(() => {
      callback.resetHistory();
    });

    it('should match when the message of the Error is the same as the provided Error', () => {
      const test = new Error(error.message);
      expect(callback).to.have.been.calledWithMatch(matchesError(test));
    });

    it('should match when the message of the Error is the same as the provided message', () => {
      const test = error.message;
      expect(callback).to.have.been.calledWithMatch(matchesError(test));
    });

    it('should not match when the message of the Error is not the same as the provided Error', () => {
      const test = new Error('some different error message');
      expect(callback).to.not.have.been.calledWithMatch(matchesError(test));
    });

    it('should not match when the message of the Error is not the same as the provided message', () => {
      const test = 'some different error message';
      expect(callback).to.not.have.been.calledWithMatch(matchesError(test));
    });
  });

  describe('the matchesCause matcher', () => {
    const cause = new Error('some cause');
    const error = new VError(cause, 'some error message');
    const callback = spy();

    beforeEach(() => {
      callback(error);
    });

    afterEach(() => {
      callback.resetHistory();
    });

    it('should match when the message of the cause is the same as the provided Error', () => {
      const test = new Error(cause.message);
      expect(callback).to.have.been.calledWithMatch(matchesCause(test));
    });

    it('should match when the message of the cause is the same as the provided message', () => {
      const test = cause.message;
      expect(callback).to.have.been.calledWithMatch(matchesCause(test));
    });

    it('should not match when the message of the cause is not the same as the provided Error', () => {
      const test = new Error(error.message);
      expect(callback).to.not.have.been.calledWithMatch(matchesCause(test));
    });

    it('should not match when the message of the cause is not the same as the provided message', () => {
      const test = error.message;
      expect(callback).to.not.have.been.calledWithMatch(matchesCause(test));
    });

    it('should not match when the Error does not have a cause', () => {
      callback.resetHistory();
      const oldCauseMessage = cause.message;
      error.cause = () => undefined;
      callback(error);
      expect(callback).to.not.have.been.calledWithMatch(matchesCause(oldCauseMessage));
    });
  });
});
