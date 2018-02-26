import {SinonMatcher, SinonStub} from 'sinon';

export function doNothingIfMatch(sinonStub: SinonStub, sinonMatcher: SinonMatcher) {
  sinonStub.withArgs(sinonMatcher).callsFake(() => undefined);
  sinonStub.callThrough();
}
