import {SinonMatcher, SinonStub, stub} from 'sinon';

export const noop: () => void = () => undefined;

export function doNothingIfMatch(sinonStub: SinonStub, sinonMatcher: SinonMatcher) {
  sinonStub.withArgs(sinonMatcher).callsFake(noop);
  sinonStub.callThrough();
}

export async function tick(delay: number = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}
