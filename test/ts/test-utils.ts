/**
 * Noop.
 * @returns {undefined}
 */
export const noop: () => void = () => undefined;

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
