import {ExtensionMessenger} from '@src/messaging/extension/extension-messenger';
import {Message} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {DummyMessage} from '@test/messaging/dummy-message';
import {DummyMessageResponse} from '@test/messaging/dummy-message-response';
import {configureChai, useRxTesting, useSinonChrome} from '@test/test-initializers';
import {match} from 'sinon';

const expect = configureChai();

describe('extension messenger', () => {
  const sinonChrome = useSinonChrome();
  const rx = useRxTesting();

  const fixture = ExtensionMessenger;
  const tabId = 123;
  const fakeMessage: Message = new DummyMessage('SomeMessageType');

  describe('sending message to content page', () => {
    context('when not expecting a response', () => {
      beforeEach(() => {
        rx.subscribeTo(fixture.sendToContentPage(tabId, fakeMessage));
      });

      it('should send message to given tab id', () => {
        expect(sinonChrome.tabs.sendMessage).to.have.been.calledOnce.calledWithExactly(tabId, fakeMessage);
      });

      it('should return an empty observable', () => {
        expect(rx.next).to.not.have.been.called;
        expect(rx.complete).to.have.been.called;
      });
    });

    context('when expecting a response', () => {
      beforeEach(() => {
        rx.subscribeTo(fixture.sendToContentPage(tabId, fakeMessage, true));
      });

      it('should send message to given tab id', () => {
        expect(sinonChrome.tabs.sendMessage).to.have.been.calledOnce
          .calledWithExactly(tabId, fakeMessage, match.func);
      });

      describe('the returned observable', () => {
        let sendResponse: (msgResp?: MessageResponse) => void;

        beforeEach(() => {
          sendResponse = sinonChrome.tabs.sendMessage.firstCall.args[2];
        });

        it('should emit the message response when received and complete', () => {
          const fakeResponse: MessageResponse = new DummyMessageResponse('some-content');
          sendResponse(fakeResponse);

          expect(rx.next).to.have.been.calledOnce.calledWithExactly(fakeResponse);
          expect(rx.error).to.not.have.been.called;
          expect(rx.complete).to.have.been.called;
        });

        it('should not emit anything when no message response is received', () => {
          expect(rx.next).to.not.have.been.called;
          expect(rx.error).to.not.have.been.called;
          expect(rx.complete).to.not.have.been.called;
        });

        it('should emit the last error message if cannot connect to tab', () => {
          const errorMsg = 'error message';
          sinonChrome.runtime.lastError = {message: errorMsg};
          sendResponse();

          expect(rx.next).to.not.have.been.called;
          expect(rx.error).to.have.been.calledWithExactly(errorMsg);
        });
      });
    });
  });
});
