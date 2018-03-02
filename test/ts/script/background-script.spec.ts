import {SC_URL_PATTERN} from '@src/constants';
import {BackgroundScript} from '@src/script/background-script';
import {doNothingIfMatch, tick} from '@test/test-utils';
import * as chai from 'chai';
import {expect} from 'chai';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/take';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {match, SinonMatcher, SinonSpy, SinonStub, spy, stub} from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as sinonChrome from 'sinon-chrome';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

const forEach = require('mocha-each');

describe('background script', () => {
  chai.use(sinonChai);

  let fixture: BackgroundScript;

  before(() => {
    (global as any).chrome = sinonChrome;
  });

  beforeEach(() => {
    fixture = new BackgroundScript();
  });

  afterEach(() => {
    fixture.cleanUp();
    sinonChrome.flush();
    sinonChrome.reset();
  });

  after(() => {
    delete (global as any).chrome;
  });

  context('triggering the SoundCloud page visited observable', () => {

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
      doNothingIfMatch(stubOnCompleted, doesNotMatchScUrl);
      doNothingIfMatch(stubOnHistoryStateUpdated, doesNotMatchScUrl);
    });

    beforeEach(() => {
      subscription = fixture.scPageVisited$.subscribe(callback);
      fixture.run();
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

    context('through the Web Navigation On Completed event', () => {
      forEach(validScUrls)
        .it('should trigger when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onCompleted.trigger(details);
          expect(callback).to.have.been.calledOnce.calledWithExactly(details);
        });

      forEach(invalidScUrls)
        .it('should not trigger when the URL is %s', (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onCompleted.trigger(details);
          expect(callback).to.not.have.been.called;
        });
    });

    context('through the Web Navigation On History Updated event', () => {
      const debounceWaitTime = 25; // ms

      forEach(validScUrls)
        .it('should trigger when the URL is %s', async (url: string) => {
          const details = {tabId: 1, timeStamp: 123, url};
          sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
          await tick(debounceWaitTime);
          expect(callback).to.have.been.calledOnce.calledWithExactly(details);
        });

      forEach(invalidScUrls)
        .it('should not trigger when the URL is %s', async (url: string) => {
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

  context('running the content script', () => {

    it('should run the content script when visiting a SoundCloud page', async () => {
      const tabId = 123;
      const scPageVisited$: Subject<WebNavigationUrlCallbackDetails> = new Subject<WebNavigationUrlCallbackDetails>();
      fixture.scPageVisited$ = scPageVisited$;

      fixture.run();
      scPageVisited$.next({tabId, timeStamp: 432.1, url: 'some-url'});

      expect(sinonChrome.tabs.insertCSS.withArgs(tabId, {file: 'styles.css'})).to.have.been.calledOnce;
      expect(sinonChrome.tabs.executeScript).to.have.been.calledTwice;
      expect(sinonChrome.tabs.executeScript.firstCall).to.have.been.calledWithExactly(tabId, {file: 'vendor.js'});
      expect(sinonChrome.tabs.executeScript.secondCall).to.have.been.calledWithExactly(tabId, {file: 'content.js'});
    });

    it('should not run the content script when not visiting a SoundCloud page', async () => {
      fixture.run();
      await tick();

      expect(sinonChrome.tabs.insertCSS).to.not.have.been.called;
      expect(sinonChrome.tabs.executeScript).to.not.have.been.called;
      expect(sinonChrome.tabs.executeScript).to.not.have.been.called;
    });

  });

  context('unloading the background script', () => {

    it('should trigger when the onSuspend event is emitted', async () => {
      const spyCleanUp = spy(fixture, 'cleanUp');
      fixture.run();
      await tick();

      expect(spyCleanUp).to.not.have.been.called;
      sinonChrome.runtime.onSuspend.trigger();
      await tick();

      expect(spyCleanUp).to.have.been.called;
    });

    it('should unsubscribe from all subscriptions', () => {
      const SUBS_PROP = 'subscriptions';
      const spyUnsubscribe = spy(fixture[SUBS_PROP], 'unsubscribe');

      fixture.run();
      fixture.cleanUp();

      expect(spyUnsubscribe).to.have.been.called;
    });
  });

});
