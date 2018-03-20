import {Message} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {DummyMessage} from '@test/messaging/dummy-message';
import {DummyMessageResponse} from '@test/messaging/dummy-message-response';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {Subscription} from 'rxjs/Subscription';
import {match, SinonSpy, spy} from 'sinon';

const expect = useSinonChai();

describe('content page messenger', () => {
  const sinonChrome = useSinonChrome();

  const fixture = ContentPageMessenger;
  let subscription: Subscription;
  const callback: SinonSpy = spy();
  const fakeMessage: Message = new DummyMessage('SomeMessageType');

  afterEach(() => {
    callback.resetHistory();
    subscription.unsubscribe();
  });

  describe('sending message to extension', () => {
    context('when not expecting a response', () => {
      beforeEach(() => {
        subscription = fixture.sendToExtension(fakeMessage).subscribe(callback);
      });

      it('should send message to the extension', () => {
        expect(sinonChrome.runtime.sendMessage).to.have.been.calledOnce.calledWithExactly(fakeMessage);
      });

      it('should return an empty observable', () => {
        expect(subscription.closed).to.be.true;
        expect(callback).to.not.have.been.called;
      });
    });

    context('when expecting a response', () => {
      const errorCallback: SinonSpy = spy();

      beforeEach(() => {
        subscription = fixture.sendToExtension(fakeMessage, true).subscribe(callback, errorCallback);
      });

      afterEach(() => {
        errorCallback.resetHistory();
      });

      it('should send message to the extension', () => {
        expect(sinonChrome.runtime.sendMessage).to.have.been.calledOnce.calledWithExactly(fakeMessage, match.func);
      });

      describe('the returned observable', () => {
        let sendResponse: (msgResp?: MessageResponse) => void;

        beforeEach(() => {
          sendResponse = sinonChrome.runtime.sendMessage.firstCall.args[1];
        });

        it('should emit the message response when received and complete', () => {
          const fakeResponse: MessageResponse = new DummyMessageResponse('some-content');
          sendResponse(fakeResponse);

          expect(callback).to.have.been.calledOnce.calledWithExactly(fakeResponse);
          expect(errorCallback).to.not.have.been.called;
          expect(subscription.closed).to.be.true;
        });

        it('should not emit anything when no message response is received', () => {
          expect(callback).to.not.have.been.called;
          expect(errorCallback).to.not.have.been.called;
          expect(subscription.closed).to.be.false;
        });

        it('should emit the last error message if cannot connect to extension', () => {
          const errorMsg = 'error message';
          sinonChrome.runtime.lastError = {message: errorMsg};
          sendResponse();

          expect(callback).to.not.have.been.called;
          expect(errorCallback).to.have.been.calledOnce.calledWithExactly(errorMsg);
          expect(subscription.closed).to.be.true;
        });
      });
    });
  });
});
