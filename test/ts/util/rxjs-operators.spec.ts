import {concatFilter} from '@src/util/rxjs-operators';
import {configureChai, useRxTesting} from '@test/test-initializers';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';
import {clock, useFakeTimers} from 'sinon';

const expect = configureChai();

describe('rxjs operators', () => {
  const rx = useRxTesting();

  describe('the concatFilter operator', () => {
    beforeEach(() => {
      useFakeTimers();
    });

    it('should filter values which passes predicate', () => {
      const input$ = of(1, 2, 3, 4, 5);
      const predicate = (n: number) => of(n % 2 === 0);
      rx.subscribeTo(input$.pipe(concatFilter(predicate)));

      expect(rx.next).to.have.been.calledTwice;
      expect(rx.next.firstCall).to.have.been.calledWith(2);
      expect(rx.next.secondCall).to.have.been.calledWith(4);
    });

    it('should concatenate the values in the order passed in', () => {
      const input$ = of(1, 2, 3);
      const predicate = (n: number) => of(true).pipe(delay(3 - n));
      rx.subscribeTo(input$.pipe(concatFilter(predicate)));
      clock.runAll();

      expect(rx.next).to.have.been.calledThrice;
      expect(rx.next.firstCall).to.have.been.calledWith(1);
      expect(rx.next.secondCall).to.have.been.calledWith(2);
      expect(rx.next.thirdCall).to.have.been.calledWith(3);
    });
  });
});
