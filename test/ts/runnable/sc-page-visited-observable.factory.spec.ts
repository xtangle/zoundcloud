import {SC_URL_PATTERN} from '@src/constants';
import {ScPageVisitedObservableFactory} from '@src/runnable/sc-page-visited-observable.factory';
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
  const fixture = ScPageVisitedObservableFactory;

  /**
   * Do not emit event (by doing a noop) if url does not match an SoundCloud url.
   * This has to be patched in manually because sinon-chrome's addListeners do not implement event filters.
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

    rx.subscribeTo(fixture.create$());
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

  context('triggering through the Web Navigation On Completed event', () => {
    forEach(validScUrls)
      .it('should emit when the URL is %s', (url: string) => {
        const details = {tabId: 1, timeStamp: 123, url};
        sinonChrome.webNavigation.onCompleted.trigger(details);
        expect(rx.next).to.have.been.calledOnce.calledWithExactly(details);
      });

    forEach(invalidScUrls)
      .it('should not emit when the URL is %s', (url: string) => {
        const details = {tabId: 1, timeStamp: 123, url};
        sinonChrome.webNavigation.onCompleted.trigger(details);
        expect(rx.next).to.not.have.been.called;
      });
  });

  context('triggering through the Web Navigation On History Updated event', () => {
    const debounceWaitTime = 25; // ms

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

    it('should de-bounce events when they are emitted close together', () => {
      validScUrls.forEach((url) => {
        sinonChrome.webNavigation.onHistoryStateUpdated.trigger({tabId: 1, timeStamp: 123, url});
      });
      const expectedDetails = {tabId: 1, timeStamp: 123, url: validScUrls[validScUrls.length - 1]};
      cw.clock.tick(debounceWaitTime);
      expect(rx.next).to.have.been.calledOnce.calledWithExactly(expectedDetails);
    });
  });
});
