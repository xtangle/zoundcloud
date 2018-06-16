import {match, SinonMatcher, SinonStub} from 'sinon';
import * as VError from 'verror';

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

/**
 * Helper Sinon matcher for matching against an Error thrown. It matches if the actual Error
 * contains the same message as the provided Error (or message) to test against.
 * @param {Error | string} error
 * @returns {Sinon.SinonMatcher}
 */
export function matchesError(error: Error | string): SinonMatcher {
  const errorMessage = getErrorMessage(error);
  return match((actual: Error) => actual.message === errorMessage, errorMessage);
}

/**
 * Helper Sinon matcher for matching against an VError thrown. It matches if the actual VError
 * contains an Error cause that has the same message as the provided Error (or message) to test against.
 * @param {Error | string} cause
 * @returns {Sinon.SinonMatcher}
 */
export function matchesCause(cause: Error | string): SinonMatcher {
  const errorMessage = getErrorMessage(cause);
  return match((actual: VError) => actual.cause() && actual.cause().message === errorMessage, errorMessage);
}

function getErrorMessage(error: Error | string): string {
  return (typeof error === 'string') ? error : error.message;
}
