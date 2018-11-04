import {match, restore} from 'sinon';
import {defaultOptions} from 'src/ts/options/option';
import {OptionsObservables} from 'src/ts/options/options-observables';
import {configureChai, useRxTesting, useSinonChrome} from 'test/ts/test-initializers';

const expect = configureChai();

describe('options observables', () => {
  const sinonChrome = useSinonChrome();
  const rx = useRxTesting();
  const fixture = OptionsObservables;

  afterEach(() => {
    restore();
  });

  it('should return the saved options in Chrome storage as an observable', () => {
    const storedOptions = {a: 'a'};
    sinonChrome.storage.sync.get.withArgs(defaultOptions, match.any).yields(storedOptions);
    rx.subscribeTo(fixture.getOptions$());

    expect(rx.next).to.have.been.calledOnceWithExactly(storedOptions);
    expect(rx.complete).to.have.been.called;
  });
});
