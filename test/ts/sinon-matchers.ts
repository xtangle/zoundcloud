import * as $ from 'jquery';
import {match, SinonMatcher} from 'sinon';
import * as VError from 'verror';

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

/**
 * Helper Sinon matcher for matching a selector against a JQuery<Node>. It matches only if the selector, when
 * applied to the current page, selects the exact same set of elements as the provided JQuery wrapped elements.
 * @param {JQuery<HTMLElement>} elements
 * @returns {Sinon.SinonMatcher}
 */
export function matchesElements(elements: JQuery<HTMLElement>): SinonMatcher {
  const message = 'should only select elements: ' +
    `\n${$.map(elements, (element: HTMLElement) => element.outerHTML).join(',\n')}\n`;
  return match((selector: string) => {
    const selected = $(selector);
    return (selected.length === elements.length) &&
      $.map(elements, (e: HTMLElement) => selected.is(e)).every(Boolean);
  }, message);
}

function getErrorMessage(error: Error | string): string {
  return (typeof error === 'string') ? error : error.message;
}
