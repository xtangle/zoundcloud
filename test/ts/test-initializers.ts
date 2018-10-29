import {Observable, Subscription} from 'rxjs';
import {createSandbox, SinonSpy} from 'sinon';

export function configureChai(): Chai.ExpectStatic & typeof chaiJq {
  const chai = require('chai');
  const sinonChai = require('sinon-chai');
  const chaiJq = require('chai-jq');

  chai.use(sinonChai);
  chai.use(chaiJq);
  return chai.expect;
}

export function useSinonChrome() {
  const sinonChrome = require('sinon-chrome');

  before('add stubbed chrome object to global scope', () => {
    (global as any).chrome = sinonChrome;
  });

  afterEach('reset stubbed chrome object', () => {
    sinonChrome.flush();
    sinonChrome.reset();
  });

  after('removes stubbed chrome object from global scope', () => {
    delete (global as any).chrome;
  });

  return sinonChrome;
}

export interface IRxTestingWrapper {
  readonly next: SinonSpy;
  readonly error: SinonSpy;
  readonly complete: SinonSpy;

  subscribeTo<T>(observable: Observable<T>): void;
}

export function useRxTesting(): IRxTestingWrapper {
  const sandbox = createSandbox();
  let subscription: Subscription;

  const rx: IRxTestingWrapper = {
    complete: sandbox.spy(),
    error: sandbox.spy(),
    next: sandbox.spy(),
    subscribeTo<T>(observable: Observable<T>) {
      subscription = observable.subscribe(this);
    }
  };

  afterEach('reset callbacks and unsubscribe', () => {
    sandbox.resetHistory();
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  after(() => {
    sandbox.restore();
  });

  return rx;
}
