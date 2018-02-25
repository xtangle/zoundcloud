import * as chai from 'chai';
import {expect} from 'chai';
import {Subject} from 'rxjs/Subject';
import * as sinonChai from 'sinon-chai';
import * as sinonChrome from 'sinon-chrome';
import {BackgroundScript} from './background-script';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

/* tslint:disable:no-unused-expression */
describe('background script', () => {
  chai.use(sinonChai);

  let fixture: BackgroundScript;

  before(() => {
    (global as any).chrome = sinonChrome;
  });

  after(() => {
    delete (global as any).chrome;
  });

  beforeEach(() => {
    fixture = new BackgroundScript();
  });

  afterEach(() => {
    fixture.cleanUp();
    sinonChrome.flush();
    sinonChrome.reset();
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
