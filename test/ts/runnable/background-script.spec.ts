/*
import {ITrackInfo} from '@src/download/download-info';
import {DownloadService} from '@src/download/track-download-service';
import {ExtensionMessenger} from '@src/messaging/extension/extension-messenger';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {Message} from '@src/messaging/message';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {RequestTrackDownloadMessage} from '@src/messaging/page/request-track-download.message';
import {BackgroundScript} from '@src/runnable/background-script';
import {ScPageVisitedObservableFactory} from '@src/runnable/sc-page-visited-observable.factory';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {Subject} from 'rxjs';
import {SinonSpy, SinonStub, spy, stub} from 'sinon';
import Tab = chrome.tabs.Tab;
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

const expect = useSinonChai();

describe('background script', () => {
  const sinonChrome = useSinonChrome();
  let fixture: BackgroundScript;

  beforeEach(() => {
    fixture = new BackgroundScript();
  });

  afterEach(() => {
    fixture.cleanUp();
  });

  context('when background script has run', () => {
    describe('running the content script', () => {
      let scPageVisited$: Subject<WebNavigationUrlCallbackDetails>;
      let stubScPageVisitedCreate: SinonStub;

      beforeEach(() => {
        scPageVisited$ = new Subject<WebNavigationUrlCallbackDetails>();
        stubScPageVisitedCreate = stub(ScPageVisitedObservableFactory, 'create$');
        stubScPageVisitedCreate.returns(scPageVisited$);
        fixture.run();
      });

      afterEach(() => {
        stubScPageVisitedCreate.restore();
      });

      it('should run when visiting a SoundCloud page', () => {
        const tabId = 123;
        scPageVisited$.next({tabId, timeStamp: 432.1, url: 'some-url'});

        expect(sinonChrome.tabs.insertCSS.withArgs(tabId, {file: 'styles.css'})).to.have.been.calledOnce;
        expect(sinonChrome.tabs.executeScript).to.have.been.calledTwice;
        expect(sinonChrome.tabs.executeScript.firstCall).to.have.been.calledWithExactly(tabId, {file: 'vendor.js'});
        expect(sinonChrome.tabs.executeScript.secondCall).to.have.been.calledWithExactly(tabId, {file: 'content.js'});
      });

      it('should not run when not visiting a SoundCloud page', () => {
        expect(sinonChrome.tabs.insertCSS).to.not.have.been.called;
        expect(sinonChrome.tabs.executeScript).to.not.have.been.called;
      });
    });

    describe('downloading a track', () => {
      let fakeMessageHandlerArgs$: Subject<IMessageHandlerArgs<Message>>;
      let stubOnMessage: SinonStub;
      let stubDownloadTrack: SinonStub;

      beforeEach(() => {
        fakeMessageHandlerArgs$ = new Subject<IMessageHandlerArgs<Message>>();
        stubOnMessage = stub(ExtensionMessenger, 'onMessage');
        stubOnMessage.withArgs(RequestTrackDownloadMessage.TYPE).returns(fakeMessageHandlerArgs$);
        stubOnMessage.callThrough();
        stubDownloadTrack = stub(DownloadService, 'downloadTrack');
        fixture.run();
      });

      afterEach(() => {
        stubOnMessage.restore();
        stubDownloadTrack.restore();
      });

      it('should download a track when a request track download message is received', () => {
        const fakeTrackInfo: ITrackInfo = {
          downloadable: false,
          id: 123,
          original_format: 'mp3',
          title: 'title',
          user: {username: 'foo'}
        };
        fakeMessageHandlerArgs$.next({message: new RequestTrackDownloadMessage(fakeTrackInfo), sender: null});
        expect(stubDownloadTrack).to.have.been.calledOnce.calledWithExactly(fakeTrackInfo);
      });

      it('should not download a track when a request track download message is not received', () => {
        expect(stubDownloadTrack).to.not.have.been.called;
      });
    });

    describe('sending the reload content page message', () => {
      let fakeMessageHandlerArgs$: Subject<IMessageHandlerArgs<Message>>;
      let stubOnMessage: SinonStub;
      let spySendToContentPage: SinonSpy;

      beforeEach(() => {
        fakeMessageHandlerArgs$ = new Subject<IMessageHandlerArgs<Message>>();
        stubOnMessage = stub(ExtensionMessenger, 'onMessage');
        stubOnMessage.withArgs(RequestContentPageReloadMessage.TYPE).returns(fakeMessageHandlerArgs$);
        stubOnMessage.callThrough();
        spySendToContentPage = spy(ExtensionMessenger, 'sendToContentPage');
        fixture.run();
      });

      afterEach(() => {
        stubOnMessage.restore();
        spySendToContentPage.restore();
      });

      it('should send a message when a request content page reload message is received', () => {
        const contentPageId = 'content-page-id';
        const fakeTab = {id: 123} as Tab;
        fakeMessageHandlerArgs$.next({
          message: new RequestContentPageReloadMessage(contentPageId),
          sender: {tab: fakeTab}
        });
        expect(spySendToContentPage).to.have.been.calledOnce
          .calledWithExactly(fakeTab.id, new ReloadContentPageMessage(contentPageId));
      });

      it('should not send a message when a request content page reload message is not received', () => {
        expect(spySendToContentPage).to.not.have.been.called;
      });
    });

    describe('cleaning up', () => {
      it('should clean up when the onSuspend event is emitted', () => {
        const spyCleanUp = spy(fixture, 'cleanUp');
        fixture.run();
        expect(spyCleanUp).to.not.have.been.called;
        sinonChrome.runtime.onSuspend.trigger();
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
});
*/
