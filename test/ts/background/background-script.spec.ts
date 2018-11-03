import {EMPTY, of, Subject} from 'rxjs';
import {restore, SinonStub, stub} from 'sinon';
import {BackgroundScript} from 'src/ts/background/background-script';
import {ScPageObservables} from 'src/ts/background/sc-page-observables';
import {DownloadService} from 'src/ts/download/download-service';
import {ExtensionMessenger} from 'src/ts/messaging/extension/extension-messenger';
import {ReloadContentPageMessage} from 'src/ts/messaging/extension/reload-content-page.message';
import {IMessageHandlerArgs} from 'src/ts/messaging/messenger';
import {LogToConsoleMessage} from 'src/ts/messaging/page/log-to-console.message';
import {RequestContentPageReloadMessage} from 'src/ts/messaging/page/request-content-page-reload.message';
import {RequestDownloadMessage} from 'src/ts/messaging/page/request-download.message';
import {logger} from 'src/ts/util/logger';
import {configureChai, useSinonChrome} from 'test/ts/test-initializers';

const expect = configureChai();

describe('background script', () => {
  const sinonChrome = useSinonChrome();

  let fixture: BackgroundScript;

  let stubScPageVisited$: SinonStub;
  let stubOnMessage$: SinonStub;
  let stubSendToContentPage: SinonStub;
  let stubDownload$: SinonStub;
  let stubLog: SinonStub;

  beforeEach(() => {
    fixture = new BackgroundScript();

    stubScPageVisited$ = stub(ScPageObservables, 'goToSoundCloudPage$');
    stubScPageVisited$.returns(EMPTY);
    stubOnMessage$ = stub(ExtensionMessenger, 'onMessage$');
    stubOnMessage$.returns(EMPTY);
    stubSendToContentPage = stub(ExtensionMessenger, 'sendToContentPage$');
    stubDownload$ = stub(DownloadService, 'download$');
    stubLog = stub(logger, 'log');
  });

  afterEach(() => {
    restore();
  });

  context('when to run the content script', () => {
    it('should run when visiting a SoundCloud page', () => {
      stubScPageVisited$.returns(of(123));
      fixture.run();

      expect(sinonChrome.tabs.insertCSS.withArgs(123, {file: 'styles.css'})).to.have.been.calledOnce;
      expect(sinonChrome.tabs.executeScript).to.have.been.calledTwice;
      expect(sinonChrome.tabs.executeScript.firstCall).to.have.been.calledWithExactly(123, {file: 'vendor.js'});
      expect(sinonChrome.tabs.executeScript.secondCall).to.have.been.calledWithExactly(123, {file: 'content.js'});
      expect(sinonChrome.pageAction.show).to.have.been.calledWithExactly(123);
    });

    it('should not run when not visiting a SoundCloud page', () => {
      fixture.run();
      expect(sinonChrome.tabs.insertCSS).to.not.have.been.called;
      expect(sinonChrome.tabs.executeScript).to.not.have.been.called;
      expect(sinonChrome.pageAction.show).to.not.have.been.called;
    });

    it('should not run after the onSuspend event has emitted', () => {
      const scPageVisited$ = new Subject();
      stubScPageVisited$.returns(scPageVisited$);
      fixture.run();
      sinonChrome.runtime.onSuspend.trigger();
      scPageVisited$.next(123);

      expect(sinonChrome.tabs.insertCSS).to.not.have.been.called;
      expect(sinonChrome.tabs.executeScript).to.not.have.been.called;
      expect(sinonChrome.pageAction.show).to.not.have.been.called;
    });
  });

  context('when to reload the content page', () => {
    it('should send a reload message when a request reload content page message is received', () => {
      const handlerArgs = {
        sender: {
          tab: {id: 123}
        }
      } as IMessageHandlerArgs<RequestContentPageReloadMessage>;
      stubOnMessage$.withArgs(RequestContentPageReloadMessage.TYPE).returns(of(handlerArgs));
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

  context('when to download', () => {
    it('should download when a request download message is received', () => {
      const handlerArgs = {
        message: {
          resourceInfoUrl: 'some-url'
        }
      } as IMessageHandlerArgs<RequestDownloadMessage>;
      stubOnMessage$.withArgs(RequestDownloadMessage.TYPE).returns(of(handlerArgs));
      fixture.run();

      expect(stubDownload$).to.have.been.calledOnceWithExactly('some-url');
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

  context('when to log to the console', () => {
    it('should log to console when a log to console message is received', () => {
      const handlerArgs = {
        message: {
          message: 'some-message',
          optionalParams: [1, 2]
        },
        sender: {
          tab: {id: 123}
        }
      } as IMessageHandlerArgs<LogToConsoleMessage>;
      stubOnMessage$.withArgs(LogToConsoleMessage.TYPE).returns(of(handlerArgs));
      fixture.run();

      expect(stubLog).to.have.been.calledWithExactly('some-message (tabId: 123)', 1, 2);
    });

    it('should log when the background script has been loaded', () => {
      fixture.run();
      expect(stubLog).to.have.been.calledWithExactly('Loaded background script');
    });
  });
});
