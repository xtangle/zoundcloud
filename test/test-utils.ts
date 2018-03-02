import {SinonMatcher, SinonStub} from 'sinon';

export const noop: () => void = () => undefined;

export function doNothingIfMatch(sinonStub: SinonStub, sinonMatcher: SinonMatcher) {
  sinonStub.withArgs(sinonMatcher).callsFake(noop);
  sinonStub.callThrough();
}
