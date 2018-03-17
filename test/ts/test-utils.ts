import {SinonMatcher, SinonStub} from 'sinon';

export const noop: () => void = () => undefined;

export function doNothingIf(sinonStub: SinonStub, sinonMatcher: SinonMatcher) {
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
