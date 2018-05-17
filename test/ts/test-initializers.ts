import {Observable, Subscription} from 'rxjs';
import {SinonFakeTimers, SinonSpy, spy, useFakeTimers} from 'sinon';

export function useSinonChai(): Chai.ExpectStatic {
  const chai = require('chai');
  const sinonChai = require('sinon-chai');

  chai.use(sinonChai);
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

  after('delete stubbed chrome object from global scope', () => {
    delete (global as any).chrome;
  });

  return sinonChrome;
}

export interface IRxTestingStatic {
  readonly next: SinonSpy;
  readonly error: SinonSpy;
  readonly complete: SinonSpy;
  subscribeTo<T>(observable: Observable<T>): void;
}

export function useRxTesting(): IRxTestingStatic {
  let subscription: Subscription;

  const rx: IRxTestingStatic = {
    complete: spy(),
    error: spy(),
    next: spy(),
    subscribeTo<T>(observable: Observable<T>) {
      subscription = observable.subscribe(this);
    }
  };

  afterEach('reset callbacks and unsubscribe', () => {
    rx.next.resetHistory();
    rx.error.resetHistory();
    rx.complete.resetHistory();
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  return rx;
}

export interface IClockWrapper {
  clock: SinonFakeTimers;
}

export function useFakeTimer(): IClockWrapper {
  const cw: IClockWrapper = {
    clock: undefined
  };

  beforeEach(() => {
    cw.clock = useFakeTimers();
  });

  afterEach(() => {
    cw.clock.restore();
  });

  return cw;
}
