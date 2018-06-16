import {useSinonChai} from '@test/test-initializers';
import {doNothingIf, matchesCause, matchesError, tick} from '@test/test-utils';
import {match, SinonSpy, SinonStub, spy, stub} from 'sinon';
import * as VError from 'verror';

const expect = useSinonChai();

describe('test utils', () => {

  describe('the doNothingIf function', () => {
    let sinonStub: SinonStub;

    beforeEach(() => {
      sinonStub = stub({foo: () => 'bar'}, 'foo');
    });

    it('should not do anything if arguments match matcher', () => {
      doNothingIf(sinonStub, match(42));
      expect(sinonStub(42)).to.be.undefined;
    });

    it('should call through if arguments do not match matcher', () => {
      doNothingIf(sinonStub, match(42));
      expect(sinonStub(3)).to.be.equal('bar');
    });
  });

  describe('the tick function', () => {
    let sinonSpy: SinonSpy;

    beforeEach(() => {
      sinonSpy = spy();
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
    let callback: SinonSpy;

    beforeEach(() => {
      callback = spy();
      callback(error);
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
    let callback: SinonSpy;

    beforeEach(() => {
      callback = spy();
      callback(error);
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
