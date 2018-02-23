import * as chai from 'chai';
import {expect} from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinonChrome from 'sinon-chrome';
import {BackgroundScript} from './background-script';
import WebNavigationTransitionCallbackDetails = chrome.webNavigation.WebNavigationTransitionCallbackDetails;

/* tslint:disable:no-unused-expression */
describe('background script', () => {
  chai.use(sinonChai);

  let fixture: BackgroundScript;

  before(() => {
    (global as any).chrome = sinonChrome;
  });

  after(() => {
    sinonChrome.flush();
    delete (global as any).chrome;
  });

  beforeEach(() => {
    sinonChrome.reset();
    fixture = new BackgroundScript();
  });

  afterEach(() => {
    fixture.cleanUp();
  });

  describe('running the content script', () => {
    const defaultTabId = 123;
    const cssFile = 'styles.css';
    const vendorFile = 'vendor.js';
    const contentFile = 'content.js';

    it('should run the content script when navigating to a SoundCloud web page', () => {
      const urls: string[] = [
        'https://soundcloud.com/some-user/some-track',
        'https://soundcloud.com/some-user/some-track?in=another-user-123/sets/Playlist123'
      ];

      fixture.run();

      urls.forEach((url: string) => {
        resetStubHistories();
        sinonChrome.webNavigation.onHistoryStateUpdated.dispatch(createCallbackDetails(url));
        verifyContentScriptIsRun();
      });
    });

    function resetStubHistories(): void {
      sinonChrome.tabs.insertCSS.resetHistory();
      sinonChrome.tabs.executeScript.resetHistory();
    }

    function verifyContentScriptIsRun(tabId: number = defaultTabId): void {
      expect(sinonChrome.tabs.insertCSS.withArgs(defaultTabId, {file: cssFile})).to.have.been.calledOnce;
      expect(sinonChrome.tabs.executeScript).to.have.been.calledTwice;
      expect(sinonChrome.tabs.executeScript.firstCall)
        .to.have.been.calledWithExactly(defaultTabId, {file: vendorFile});
      expect(sinonChrome.tabs.executeScript.secondCall)
        .to.have.been.calledWithExactly(defaultTabId, {file: contentFile});
    }

    function createCallbackDetails(url: string, tabId: number = defaultTabId): WebNavigationTransitionCallbackDetails {
      return {
        frameId: 0,
        processId: 270,
        tabId,
        timeStamp: 1519349308387.4,
        transitionQualifiers: [],
        transitionType: 'link',
        url
      };
    }
  });

});
