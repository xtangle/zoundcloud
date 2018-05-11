import {ExtensionMessenger} from '@src/messaging/extension/extension-messenger';
import {Message} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {DummyMessage} from '@test/messaging/dummy-message';
import {DummyMessageResponse} from '@test/messaging/dummy-message-response';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {Subscription} from 'rxjs';
import {match, SinonSpy, spy} from 'sinon';

const expect = useSinonChai();

describe('extension messenger', () => {
  const sinonChrome = useSinonChrome();

  const fixture = ExtensionMessenger;
  let subscription: Subscription;
  const callback: SinonSpy = spy();
  const tabId = 123;
  const fakeMessage: Message = new DummyMessage('SomeMessageType');

  afterEach(() => {
    callback.resetHistory();
    subscription.unsubscribe();
  });

  describe('sending message to content page', () => {
    context('when not expecting a response', () => {
      beforeEach(() => {
        subscription = fixture.sendToContentPage(tabId, fakeMessage).subscribe(callback);
      });

      it('should send message to given tab id', () => {
        expect(sinonChrome.tabs.sendMessage).to.have.been.calledOnce.calledWithExactly(tabId, fakeMessage);
      });

      it('should return an empty observable', () => {
        expect(subscription.closed).to.be.true;
        expect(callback).to.not.have.been.called;
      });
    });

    context('when expecting a response', () => {
      const errorCallback: SinonSpy = spy();

      beforeEach(() => {
        subscription = fixture.sendToContentPage(tabId, fakeMessage, true)
          .subscribe(callback, errorCallback);
      });

      afterEach(() => {
        errorCallback.resetHistory();
      });

      it('should send message to given tab id', () => {
        expect(sinonChrome.tabs.sendMessage).to.have.been.calledOnce.calledWithExactly(tabId, fakeMessage, match.func);
      });

      describe('the returned observable', () => {
        let sendResponse: (msgResp?: MessageResponse) => void;

        beforeEach(() => {
          sendResponse = sinonChrome.tabs.sendMessage.firstCall.args[2];
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

        it('should emit the last error message if cannot connect to tab', () => {
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
