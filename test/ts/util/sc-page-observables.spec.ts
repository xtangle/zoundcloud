import {SC_URL_HOST} from '@src/constants';
import {ScPageObservables} from '@src/util/sc-page-observables';
import {configureChai, useRxTesting, useSinonChrome} from '@test/test-initializers';
import {noop} from '@test/test-utils';
import {clock, match, restore, SinonMatcher, SinonStub, spy, stub, useFakeTimers} from 'sinon';
import Tab = chrome.tabs.Tab;
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

const forEach = require('mocha-each');
const expect = configureChai();

describe('sc page visited observables', () => {
  const sinonChrome = useSinonChrome();
  const rx = useRxTesting();

  const fixture = ScPageObservables;

  /**
   * Do not emit event (by doing a noop) if url host does not equal the SoundCloud url host.
   * This has to be patched in manually because sinon-chrome's addListeners does NOT implement event filters.
   */
  const urlHostPattern = /^https:\/\/([^/]*).*$/;
  const doesNotEqualScUrlHost: SinonMatcher =
    match((details: WebNavigationUrlCallbackDetails) => urlHostPattern.exec(details.url)[1] !== SC_URL_HOST);

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

  let stubOnCompleted: SinonStub;
  let stubOnHistoryStateUpdated: SinonStub;

  beforeEach(() => {
    useFakeTimers();

    stubOnCompleted = stub(sinonChrome.webNavigation.onDOMContentLoaded, 'trigger');
    stubOnCompleted.withArgs(doesNotEqualScUrlHost).callsFake(noop);
    stubOnCompleted.callThrough();

    stubOnHistoryStateUpdated = stub(sinonChrome.webNavigation.onHistoryStateUpdated, 'trigger');
    stubOnHistoryStateUpdated.withArgs(doesNotEqualScUrlHost).callsFake(noop);
    stubOnHistoryStateUpdated.callThrough();

    ensureTabExists();

    rx.subscribeTo(fixture.goToSoundCloudPage$());
  });

  afterEach(() => {
    restore();
  });

  describe('the go to sc page observable', () => {
    context('triggering through the Web Navigation On DOM Content Loaded event', () => {
      forEach(validScUrls)
        .it('should emit when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onDOMContentLoaded.trigger(details);
          expect(rx.next).to.have.been.calledOnceWithExactly(details.tabId);
        });

      forEach(invalidScUrls)
        .it('should not emit when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onDOMContentLoaded.trigger(details);
          expect(rx.next).to.not.have.been.called;
        });
    });

    context('triggering through the Web Navigation On History Updated event', () => {
      const debounceWaitTime = 21; // set to actual debounce time + 1 (ms)

      forEach(validScUrls)
        .it('should emit when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
          clock.tick(debounceWaitTime);
          expect(rx.next).to.have.been.calledOnceWithExactly(details.tabId);
        });

      forEach(invalidScUrls)
        .it('should not emit when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
          clock.tick(debounceWaitTime);
          expect(rx.next).to.not.have.been.called;
        });

      it('should de-bounce events when they are emitted within the debounce wait time', () => {
        validScUrls.forEach((url, index) => {
          const details = {tabId: index, timeStamp: 123, url};
          sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
        });
        const lastTabId = validScUrls.length - 1;
        clock.tick(debounceWaitTime - 1);
        expect(rx.next).to.have.been.calledOnceWithExactly(lastTabId);
      });
    });

    context('checking the tab existence', () => {
      const details = {tabId: 1, timeStamp: 123, url: validScUrls[0]};

      context('when tab exists', () => {
        it('should emit', () => {
          sinonChrome.webNavigation.onDOMContentLoaded.trigger(details);
          expect(rx.next).to.have.been.called;
        });

        it('should not emit when there was an error', () => {
          sinonChrome.runtime.lastError = Error('some error!');
          sinonChrome.webNavigation.onDOMContentLoaded.trigger(details);
          expect(rx.next).to.not.have.been.called;
        });
      });

      context('when tab does not exist', () => {
        beforeEach(() => {
          ensureTabNotExist();
        });

        it('should not emit', () => {
          sinonChrome.webNavigation.onDOMContentLoaded.trigger(details);
          expect(rx.next).to.not.have.been.called;
        });

        it('should not raise an error by checking chrome.runtime.lastError', () => {
          const callback = spy();
          stub(sinonChrome.runtime, 'lastError').get(callback);
          sinonChrome.webNavigation.onDOMContentLoaded.trigger(details);
          expect(callback).to.have.been.called;
        });

        it('should not emit when there was an error', () => {
          sinonChrome.runtime.lastError = Error('some error!');
          sinonChrome.webNavigation.onDOMContentLoaded.trigger(details);
          expect(rx.next).to.not.have.been.called;
        });
      });
    });
  });

  function ensureTabExists() {
    sinonChrome.tabs.get.callsArgWith(1, {} as Tab);
  }

  function ensureTabNotExist() {
    sinonChrome.tabs.get.callsArgWith(1, undefined as Tab);
  }
});
