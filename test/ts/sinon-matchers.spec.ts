import {matchesCause, matchesElements, matchesError} from '@test/sinon-matchers';
import {configureChai} from '@test/test-initializers';
import * as $ from 'jquery';
import {SinonSpy, spy} from 'sinon';
import * as VError from 'verror';

const expect = configureChai();

describe('sinon matchers', () => {

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

  describe('the matchesElements matcher', () => {
    let callback: SinonSpy;

    let ab: JQuery<HTMLElement>;
    let ac: JQuery<HTMLElement>;

    beforeEach(() => {
      document.body.innerHTML = `
        <body>
          <div class="a b"></div>
          <div class="a c"></div>
          <div class="b c"></div>
        </body>
      `;
      callback = spy();
      ab = $('.a.b');
      ac = $('.a.c');
    });

    context('when the number of elements is different', () => {
      it('should not match', () => {
        const elements = ab.add(ac); // {ab, ac}
        const selector = 'div'; // {ab, ac, bc}
        callback(selector);
        expect(callback).to.not.have.been.calledWithMatch(matchesElements(elements));
      });
    });

    context('when the number of elements is the same', () => {
      it('should match when the elements are the same', () => {
        const elements = ab.add(ac); // {ab, ac}
        const selector = '.a'; // {ab, ac}
        callback(selector);
        expect(callback).to.have.been.calledWithMatch(matchesElements(elements));
      });

      it('should not match when the elements share no common element', () => {
        const elements = ab; // {ab}
        const selector = '.a.c'; // {ac}
        callback(selector);
        expect(callback).to.not.have.been.calledWithMatch(matchesElements(elements));
      });

      it('should not match when the elements share a common element but the rest is not the same', () => {
        const elements = ab.add(ac); // {ab, ac}
        const selector = '.b'; // {ab, bc}
        callback(selector);
        expect(callback).to.not.have.been.calledWithMatch(matchesElements(elements));
      });
    });
  });
});
