import {SinonSpy, spy} from 'sinon';
import {configureChai} from 'test/ts/test-initializers';
import {tick} from 'test/ts/test-utils';

const expect = configureChai();

describe('test utils', () => {

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
});
