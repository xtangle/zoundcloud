import {match, SinonMatcher, SinonStub} from 'sinon';

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
 * Helper Sinon matcher for matching against an Error thrown. If an Error is passed, it also
 * asserts that the Error thrown has a cause() property that evaluates to an Error with the
 * same message as the passed Error.
 * @param {string} message
 * @param {Error} cause
 * @returns {Sinon.SinonMatcher}
 */
export function matchesError(message: string, cause?: Error): SinonMatcher {
  return match((error: Error) => {
    const matchesMessage = error.message === message;
    if (cause === undefined) {
      return matchesMessage;
    } else {
      const actualCause = ((error as any).cause as () => Error)();
      return actualCause.message === cause.message;
    }
  }, 'matchesError');
}

/**
 * Prefer using {@link useFakeTimer} instead of this function to fake passage of time if possible.
 * Note that both methods cannot be used in the same test.
 * @param {number} delay
 * @returns {Promise<any>}
 */
export async function tick(delay: number = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}
