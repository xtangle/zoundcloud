import {SinonMatcher, SinonStub} from 'sinon';

/**
 * Noop.
 * @returns {undefined}
 */
export const noop: () => void = () => undefined;

/**
 * Helper function that does nothing if the given stub is called with arguments that match
 * the given matcher.
 * @param {Sinon.SinonStub} sinonStub
 * @param {Sinon.SinonMatcher} sinonMatcher
 */
export function doNothingIf(sinonStub: SinonStub, sinonMatcher: SinonMatcher) {
  sinonStub.withArgs(sinonMatcher).callsFake(noop);
  sinonStub.callThrough();
}

/**
 * Prefer using sinon's {@link useFakeTimers} instead of this function to fake passage of time if possible.
 * Note that both methods cannot be used in the same test.
 * @param {number} delay
 * @returns {Promise<any>}
 */
export async function tick(delay: number = 0): Promise<any> {
  return new Promise((resolve: () => void) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}
