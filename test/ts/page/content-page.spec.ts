import {UnloadContentPageMessage} from '@src/messaging/extension/unload-content-page.message';
import {Message} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {ContentPage} from '@src/page/content-page';
import {InjectionService} from '@src/page/injection/injection-service';
import {useSinonChai} from '@test/test-initializers';
import {Subject, Subscription} from 'rxjs';
import {SinonSpy, SinonStub, spy, stub} from 'sinon';

const expect = useSinonChai();

describe('content page', () => {
  let fixture: ContentPage;
  let subscriptions: Subscription;

  let spyUnload: SinonSpy;
  let stubInjectDownloadButtons: SinonStub;
  let stubOnMessage: SinonStub;
  let messages$: Subject<IMessageHandlerArgs<Message, MessageResponse>>;

  beforeEach(() => {
    fixture = new ContentPage();
    subscriptions = (fixture as any).subscriptions;

    spyUnload = spy(fixture, 'unload');
    stubInjectDownloadButtons = stub(InjectionService, 'injectDownloadButtons');
    stubOnMessage = stub(ContentPageMessenger, 'onMessage');
    messages$ = new Subject();
  });

  afterEach(() => {
    subscriptions.unsubscribe();
    spyUnload.restore();
    stubInjectDownloadButtons.restore();
    stubOnMessage.restore();
  });

  it('should keep track of all subscriptions', () => {
    expect(subscriptions.closed).to.be.false;
  });

  describe('loading', () => {
    beforeEach(() => {
      stubOnMessage.withArgs(UnloadContentPageMessage.TYPE).returns(messages$);
      fixture.load();
    });

    it('should inject the download buttons', () => {
      expect(stubInjectDownloadButtons).to.have.been.calledOnce.calledWithExactly(subscriptions);
    });

    it('should not unload when unload content page message is not received', () => {
      expect(spyUnload).to.not.have.been.called;
    });

    it('should unload when unload content page message is received', () => {
      messages$.next();
      expect(spyUnload).to.have.been.calledOnce;
    });
  });

  describe('unloading', () => {
    beforeEach(() => {
      fixture.unload();
    });

    it('should unsubscribe from all subscriptions', () => {
      expect(subscriptions.closed).to.be.true;
    });
  });
});
