import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {LogToConsoleMessage} from '@src/messaging/page/log-to-console.message';
import {ContentPage} from '@src/page/content-page';
import {InjectionService} from '@src/page/injection/injection-service';
import {configureChai, useRxTesting} from '@test/test-initializers';
import {noop} from '@test/test-utils';
import {restore, SinonSpy, SinonStub, spy, stub} from 'sinon';

const expect = configureChai();

describe('content page', () => {
  const rx = useRxTesting();

  let fixture: ContentPage;
  let spyUnload: SinonSpy;

  let stubInjectDownloadButtons: SinonStub;
  let stubSendToExtension$: SinonStub;
  let stubWindowOnBeforeUnload: SinonStub;

  beforeEach(() => {
    fixture = new ContentPage();
    spyUnload = spy(fixture, 'unload');

    stubInjectDownloadButtons = stub(InjectionService, 'injectDownloadButtons');
    stubSendToExtension$ = stub(ContentPageMessenger, 'sendToExtension$');
    stubWindowOnBeforeUnload = stub(window, 'onbeforeunload').callsFake(noop);
  });

  afterEach(() => {
    restore();
  });

  context('when loaded', () => {
    it('should keep track of all subscriptions', () => {
      rx.subscribeTo(fixture.onUnload$);
      fixture.load();
      expect(rx.next).to.not.have.been.called;
      expect(rx.complete).to.not.have.been.called;
    });

    it('should inject the download buttons', () => {
      fixture.load();
      expect(stubInjectDownloadButtons).to.have.been
        .calledOnceWithExactly(fixture.onUnload$);
    });

    it('should trigger unload before the window is unloaded', () => {
      fixture.load();
      window.onbeforeunload.call(fixture);
      expect(spyUnload).to.have.been.calledOnce;
    });

    it('should log a message to the console', () => {
      fixture.load();
      expect(stubSendToExtension$).to.have.been
        .calledWithExactly(new LogToConsoleMessage('Loaded content page'));
    });
  });

  context('when unloaded', () => {
    it('should unsubscribe from all subscriptions', () => {
      rx.subscribeTo(fixture.onUnload$);
      fixture.unload();
      expect(rx.next).to.have.been.called;
      expect(rx.complete).to.have.been.called;
    });

    it('should log a message to the console', () => {
      fixture.unload();
      expect(stubSendToExtension$).to.have.been
        .calledWithExactly(new LogToConsoleMessage('Unloaded content page'));
    });
  });
});
