import * as chai from 'chai';
import {expect} from 'chai';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/take';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {match, SinonMatcher, SinonSpy, SinonStub, spy, stub} from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as sinonChrome from 'sinon-chrome';
import {SC_URL_PATTERN} from '../constants';
import {doNothingIfMatch} from '../util/test-utils';
import {BackgroundScript} from './background-script';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

/* tslint:disable:no-unused-expression */
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
    const expectedDebounceTime = 50;

    let stubOnCompleted: SinonStub;
    let stubOnHistoryStateUpdated: SinonStub;
    let subscription: Subscription;

    before(() => {
      /**
       * Do not emit event (by doing a noop) if url does not match an SoundCloud url.
       * This has to be patched in manually because sinon-chrome's addListener does not implement event filters.
       */
      const doesNotHaveScUrl: SinonMatcher = match((details: WebNavigationUrlCallbackDetails) =>
        !details.url.match(SC_URL_PATTERN));
      stubOnCompleted = stub(sinonChrome.webNavigation.onCompleted, 'trigger');
      stubOnHistoryStateUpdated = stub(sinonChrome.webNavigation.onHistoryStateUpdated, 'trigger');
      doNothingIfMatch(stubOnCompleted, doesNotHaveScUrl);
      doNothingIfMatch(stubOnHistoryStateUpdated, doesNotHaveScUrl);
    });

    beforeEach(() => {
      subscription = fixture.scPageVisited$.subscribe((val) => callback(val));
    });

    afterEach(() => {
      subscription.unsubscribe();
      callback.resetHistory();
    });

    after(() => {
      stubOnCompleted.restore();
      stubOnHistoryStateUpdated.restore();
    });

    const scUrls = [
      'https://soundcloud.com/',
      'https://soundcloud.com/some-user/some-track',
      'https://soundcloud.com/abcdefg/7-track?in=user/sets/playlist',
      'https://soundcloud.com/search?q=qwe%20rty'
    ];

    const nonScUrls = [
      'https://not-soundcloud.com/',
      'https://soundcloud.org/',
      'https://soundcloud.com.abc/',
    ];

    it('should trigger when Web Navigation On Completed emits with a SoundCloud URL', () => {
      fixture.run();
      scUrls.forEach((url, index) => {
        const details = {tabId: index, timeStamp: 123, url};
        sinonChrome.webNavigation.onCompleted.trigger(details);
        expect(callback.withArgs(details)).to.have.been.calledOnce;
      });
    });

    it('should not trigger when Web Navigation On Completed doesn\'t emit with a SoundCloud URL', () => {
      fixture.run();
      nonScUrls.forEach((url, index) => {
        sinonChrome.webNavigation.onCompleted.trigger({tabId: index, timeStamp: 123, url});
      });
      expect(callback).to.not.have.been.called;
    });

    it('should trigger when Web Navigation On History Updated emits a SoundCloud URL', (done) => {
      fixture.run();
      /**
       * Wait 'expectedDebounceTime' ms between each test so that no events are filtered by the de-bounce
       */
      Observable.interval(expectedDebounceTime)
        .take(scUrls.length)
        .forEach((index) => {
          const details = {tabId: index, timeStamp: 123, url: scUrls[index]};
          sinonChrome.webNavigation.onHistoryStateUpdated.trigger(details);
          expect(callback.withArgs(details)).to.have.been.calledOnce;
        })
        .then(() => done())
        .catch(() => done());
    });

    it('should not trigger when Web Navigation On History Updated doesn\'t emit with a SoundCloud URL', (done) => {
      fixture.run();
      Observable.interval(expectedDebounceTime)
        .take(nonScUrls.length)
        .forEach((index) => {
          sinonChrome.webNavigation.onHistoryStateUpdated
            .trigger({tabId: index, timeStamp: 123, url: nonScUrls[index]});
        })
        .then(() => {
          expect(callback).to.not.have.been.called;
          done();
        })
        .catch(() => done());
    });

    it('should de-bounce events emitted by Web Navigation On History Updated', () => {
      fixture.run();
      scUrls.forEach((url, index) => {
        sinonChrome.webNavigation.onCompleted.trigger({tabId: index, timeStamp: 123, url});
      });
      const expectedDetails = {tabId: scUrls.length - 1, timeStamp: 123, url: scUrls[scUrls.length - 1]};
      expect(callback).to.not.have.been.calledOnce;
      expect(callback).to.have.been.calledWithExactly(expectedDetails);
    });

  });

  context('running the content script', () => {

    it('should run the content script when visiting a SoundCloud page', () => {
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

    it('should not run the content script when not visiting a SoundCloud page', (done) => {
      fixture.run();

      setTimeout(() => {
        expect(sinonChrome.tabs.insertCSS).to.not.have.been.called;
        expect(sinonChrome.tabs.executeScript).to.not.have.been.called;
        expect(sinonChrome.tabs.executeScript).to.not.have.been.called;
        done();
      }, this.timeout);
    });

  });

});
