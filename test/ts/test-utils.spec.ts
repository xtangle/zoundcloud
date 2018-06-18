import {configureChai} from '@test/test-initializers';
import {doNothingIf, getLocationBaseUrl, tick} from '@test/test-utils';
import {match, SinonSpy, SinonStub, spy, stub} from 'sinon';

const expect = configureChai();

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

  describe('the getLocationBaseUrl function', () => {
    it('should return the base url', () => {
      const expected = `${location.protocol}//${location.hostname}:${location.port}`;
      expect(getLocationBaseUrl()).to.be.equal(expected);
    });
  });
});
