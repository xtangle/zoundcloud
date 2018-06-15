import {SC_URL_PATTERN} from '@src/constants';
import {ScPageObservables} from '@src/runnable/sc-page-observables';
import {useFakeTimer, useRxTesting, useSinonChai, useSinonChrome} from '@test/test-initializers';
import {doNothingIf} from '@test/test-utils';
import {match, SinonMatcher, SinonStub, stub} from 'sinon';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

const forEach = require('mocha-each');
const expect = useSinonChai();

describe('sc page visited observable factory', () => {
  const sinonChrome = useSinonChrome();
  const cw = useFakeTimer();
  const rx = useRxTesting();
  const fixture = ScPageObservables;

  describe('the sc page visited observable', () => {
    /**
     * Do not emit event (by doing a noop) if url does not match an SoundCloud url.
     * This has to be patched in manually because sinon-chrome's addListeners does NOT implement event filters.
     */
    const doesNotMatchScUrl: SinonMatcher =
      match((details: WebNavigationUrlCallbackDetails) => !details.url.match(SC_URL_PATTERN));
    let stubOnCompleted: SinonStub;
    let stubOnHistoryStateUpdated: SinonStub;

    beforeEach(() => {
      stubOnCompleted = stub(sinonChrome.webNavigation.onCompleted, 'trigger');
      stubOnHistoryStateUpdated = stub(sinonChrome.webNavigation.onHistoryStateUpdated, 'trigger');
      doNothingIf(stubOnCompleted, doesNotMatchScUrl);
      doNothingIf(stubOnHistoryStateUpdated, doesNotMatchScUrl);

      rx.subscribeTo(fixture.scPageVisited$());
    });

    afterEach(() => {
      stubOnCompleted.restore();
      stubOnHistoryStateUpdated.restore();
    });

    const validScUrls = [
      'https://soundcloud.com/',
      'https://soundcloud.com/some-user/some-track',
      'https://soundcloud.com/abcdefg/some-track?in=user/sets/playlist',
      'https://soundcloud.com/search?q=qwe%20rty',
    ];

    const invalidScUrls = [
      'https://not.soundcloud.com/',
      'https://soundcloud.org/',
      'https://soundcloud.com.abc/'
    ];

    const debounceWaitTime = 21; // set to actual debounce time + 1 (ms)

    context('triggering through the Web Navigation On Completed event', () => {
      forEach(validScUrls)
        .it('should emit when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onCompleted.trigger(details);
          cw.clock.tick(debounceWaitTime);
          expect(rx.next).to.have.been.calledOnce.calledWithExactly(details);
        });

      forEach(invalidScUrls)
        .it('should not emit when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onCompleted.trigger(details);
          cw.clock.tick(debounceWaitTime);
          expect(rx.next).to.not.have.been.called;
        });
    });

    context('triggering through the Web Navigation On History Updated event', () => {
      forEach(validScUrls)
        .it('should emit when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
          cw.clock.tick(debounceWaitTime);
          expect(rx.next).to.have.been.calledOnce.calledWithExactly(details);
        });

      forEach(invalidScUrls)
        .it('should not emit when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
          cw.clock.tick(debounceWaitTime);
          expect(rx.next).to.not.have.been.called;
        });
    });

    it('should de-bounce events when they are emitted within the debounce wait time', () => {
      validScUrls.forEach((url, index) => {
        const details = {tabId: index, timeStamp: 123, url};
        if (index % 2 === 0) {
          sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
        } else {
          sinonChrome.webNavigation.onCompleted.trigger(details);
        }
      });
      const lastDetail = {tabId: validScUrls.length - 1, timeStamp: 123, url: validScUrls[validScUrls.length - 1]};
      cw.clock.tick(debounceWaitTime - 1);
      expect(rx.next).to.have.been.calledOnce.calledWithExactly(lastDetail);
    });
  });
});
