import {DownloadService} from '@src/download/download-service';
import {ExtensionMessenger} from '@src/messaging/extension/extension-messenger';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {RequestDownloadMessage} from '@src/messaging/page/request-download.message';
import {BackgroundScript} from '@src/runnable/background-script';
import {ScPageObservables} from '@src/runnable/sc-page-observables';
import {configureChai, useSinonChrome} from '@test/test-initializers';
import {EMPTY, of, Subject} from 'rxjs';
import {restore, SinonStub, stub} from 'sinon';

const expect = configureChai();

describe('background script', () => {
  const sinonChrome = useSinonChrome();

  let fixture: BackgroundScript;

  let stubScPageVisited$: SinonStub;
  let stubOnMessage$: SinonStub;
  let stubSendToContentPage: SinonStub;
  let stubDownload$: SinonStub;

  beforeEach(() => {
    fixture = new BackgroundScript();

    stubScPageVisited$ = stub(ScPageObservables, 'scPageVisited$');
    stubScPageVisited$.returns(EMPTY);
    stubOnMessage$ = stub(ExtensionMessenger, 'onMessage$');
    stubOnMessage$.returns(EMPTY);
    stubSendToContentPage = stub(ExtensionMessenger, 'sendToContentPage$');
    stubDownload$ = stub(DownloadService, 'download$');
  });

  afterEach(() => {
    restore();
  });

  context('running the content script', () => {
    it('should run when visiting a SoundCloud page', () => {
      const tabId = 123;
      stubScPageVisited$.returns(of({tabId}));
      fixture.run();

      expect(sinonChrome.tabs.insertCSS.withArgs(tabId, {file: 'styles.css'})).to.have.been.calledOnce;
      expect(sinonChrome.tabs.executeScript).to.have.been.calledTwice;
      expect(sinonChrome.tabs.executeScript.firstCall).to.have.been.calledWithExactly(tabId, {file: 'vendor.js'});
      expect(sinonChrome.tabs.executeScript.secondCall).to.have.been.calledWithExactly(tabId, {file: 'content.js'});
    });

    it('should not run when not visiting a SoundCloud page', () => {
      fixture.run();
      expect(sinonChrome.tabs.insertCSS).to.not.have.been.called;
      expect(sinonChrome.tabs.executeScript).to.not.have.been.called;
    });

    it('should not run after the onSuspend event has emitted', () => {
      const scPageVisited$ = new Subject();
      stubScPageVisited$.returns(scPageVisited$);
      fixture.run();
      sinonChrome.runtime.onSuspend.trigger();
      scPageVisited$.next({tabId: 123});

      expect(sinonChrome.tabs.insertCSS).to.not.have.been.called;
      expect(sinonChrome.tabs.executeScript).to.not.have.been.called;
    });
  });

  context('reloading the content page', () => {
    it('should send a reload message when a request reload content page message is received', () => {
      const messageHandlerArgs = {
        sender: {
          tab: {id: 123}
        }
      } as IMessageHandlerArgs<RequestContentPageReloadMessage>;
      stubOnMessage$.withArgs(RequestContentPageReloadMessage.TYPE).returns(of(messageHandlerArgs));
      fixture.run();

      expect(stubSendToContentPage).to.have.been.calledOnce
        .calledWithExactly(123, new ReloadContentPageMessage());
    });

    it('should not send a reload message when no request reload content page message is received', () => {
      fixture.run();
      expect(stubSendToContentPage).to.not.have.been.called;
    });

    it('should not send a reload message after the onSuspend event has emitted', () => {
      const message$ = new Subject();
      stubOnMessage$.withArgs(RequestContentPageReloadMessage.TYPE).returns(message$);
      fixture.run();
      sinonChrome.runtime.onSuspend.trigger();
      message$.next({sender: {tab: {id: 123}}});

      expect(stubSendToContentPage).to.not.have.been.called;
    });
  });

  context('downloading', () => {
    it('should download when a request download message is received', () => {
      const messageHandlerArgs = {
        message: {
          resourceInfoUrl: 'some-url'
        }
      } as IMessageHandlerArgs<RequestDownloadMessage>;
      stubOnMessage$.withArgs(RequestDownloadMessage.TYPE).returns(of(messageHandlerArgs));
      fixture.run();

      expect(stubDownload$).to.have.been.calledOnce.calledWithExactly('some-url');
    });

    it('should not download when no request download message is received', () => {
      fixture.run();
      expect(stubDownload$).to.not.have.been.called;
    });

    it('should not download after the onSuspend event has emitted', () => {
      const message$ = new Subject();
      stubOnMessage$.withArgs(RequestDownloadMessage.TYPE).returns(message$);
      fixture.run();
      sinonChrome.runtime.onSuspend.trigger();
      message$.next({message: {resourceInfoUrl: 'some-url'}});

      expect(stubDownload$).to.not.have.been.called;
    });
  });
});
