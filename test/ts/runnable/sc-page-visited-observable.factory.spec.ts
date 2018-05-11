import {SC_URL_PATTERN} from '@src/constants';
import {ScPageVisitedObservableFactory} from '@src/runnable/sc-page-visited-observable.factory';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {doNothingIf, tick} from '@test/test-utils';
import {Subscription} from 'rxjs';
import {match, SinonMatcher, SinonSpy, SinonStub, spy, stub} from 'sinon';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

const forEach = require('mocha-each');
const expect = useSinonChai();

describe('sc page visited observable factory', () => {
  const sinonChrome = useSinonChrome();
  const fixture = ScPageVisitedObservableFactory;

  const callback: SinonSpy = spy();
  let stubOnCompleted: SinonStub;
  let stubOnHistoryStateUpdated: SinonStub;
  let subscription: Subscription;

  before(() => {
    /**
     * Do not emit event (by doing a noop) if url does not match an SoundCloud url.
     * This has to be patched in manually because sinon-chrome's addListeners do not implement event filters.
     */
    const doesNotMatchScUrl: SinonMatcher = match((details: WebNavigationUrlCallbackDetails) =>
      !details.url.match(SC_URL_PATTERN));
    stubOnCompleted = stub(sinonChrome.webNavigation.onCompleted, 'trigger');
    stubOnHistoryStateUpdated = stub(sinonChrome.webNavigation.onHistoryStateUpdated, 'trigger');
    doNothingIf(stubOnCompleted, doesNotMatchScUrl);
    doNothingIf(stubOnHistoryStateUpdated, doesNotMatchScUrl);
  });

  beforeEach(() => {
    subscription = fixture.create$().subscribe(callback);
  });

  afterEach(() => {
    subscription.unsubscribe();
    callback.resetHistory();
  });

  after(() => {
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
        expect(callback).to.have.been.calledOnce.calledWithExactly(details);
      });

    forEach(invalidScUrls)
      .it('should not emit when the URL is %s', (url: string) => {
        const details = {tabId: 1, timeStamp: 123, url};
        sinonChrome.webNavigation.onCompleted.trigger(details);
        expect(callback).to.not.have.been.called;
      });
  });

  context('triggering through the Web Navigation On History Updated event', () => {
    const debounceWaitTime = 25; // ms

    forEach(validScUrls)
      .it('should emit when the URL is %s', async (url: string) => {
        const details = {tabId: 1, timeStamp: 123, url};
        sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
        await tick(debounceWaitTime);
        expect(callback).to.have.been.calledOnce.calledWithExactly(details);
      });

    forEach(invalidScUrls)
      .it('should not emit when the URL is %s', async (url: string) => {
        const details = {tabId: 1, timeStamp: 123, url};
        sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
        await tick(debounceWaitTime);
        expect(callback).to.not.have.been.called;
      });

    it('should de-bounce events when they are emitted close together', async () => {
      validScUrls.forEach((url) => {
        sinonChrome.webNavigation.onHistoryStateUpdated.trigger({tabId: 1, timeStamp: 123, url});
      });
      const expectedDetails = {tabId: 1, timeStamp: 123, url: validScUrls[validScUrls.length - 1]};
      await tick(debounceWaitTime);
      expect(callback).to.have.been.calledOnce.calledWithExactly(expectedDetails);
    });
  });
});
