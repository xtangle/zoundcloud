import {Message, MessageType} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {BaseMessenger, IMessenger} from '@src/messaging/messenger';
import {DummyMessage} from '@test/messaging/dummy-message';
import {DummyMessageResponse} from '@test/messaging/dummy-message-response';
import {configureChai, useRxTesting, useSinonChrome} from '@test/test-initializers';
import {Subject} from 'rxjs';
import {match, SinonSpy, spy} from 'sinon';
import MessageSender = chrome.runtime.MessageSender;

const expect = configureChai();

describe('base messenger', () => {
  const sinonChrome = useSinonChrome();
  const rx = useRxTesting();

  let fixture: IMessenger;
  const msgType1: MessageType = 'MessageType-1';
  const msgType2: MessageType = 'MessageType-2';
  const fakeMsgOfType1: Message = new DummyMessage(msgType1);
  const fakeMsgOfType2: Message = new DummyMessage(msgType2);
  const fakeSender: MessageSender = {id: 'some-id'};

  beforeEach(() => {
    fixture = new DummyConcreteMessenger();
  });

  describe('listening on a message', () => {
    context('when not sending a response', () => {
      beforeEach(() => {
        rx.subscribeTo(fixture.onMessage$(msgType1));
      });

      it('should emit the message and sender when message of specified type is received', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender);
        expect(rx.next).to.have.been.calledOnceWithExactly({message: fakeMsgOfType1, sender: fakeSender});
      });

      it('should emit multiple times when message of specified type is received multiple times', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender);
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender);
        expect(rx.next).to.have.been.calledTwice;
      });

      it('should not emit anything when no message is received', () => {
        expect(rx.next).to.not.have.been.called;
      });

      it('should not emit anything when message not of specified type is received', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType2, fakeSender);
        expect(rx.next).to.not.have.been.called;
      });
    });

    context('when sending a response', () => {
      let responseCallback: SinonSpy;

      beforeEach(() => {
        responseCallback = spy();
        rx.subscribeTo(fixture.onMessage$(msgType1, true));
      });

      it('should emit message, sender, and response subject when message of specified type is received', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender, responseCallback);
        expect(rx.next).to.have.been.calledOnce
          .calledWithExactly({message: fakeMsgOfType1, sender: fakeSender, response$: match.instanceOf(Subject)});
      });

      it('should emit multiple times when message of specified type is received multiple times', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender, responseCallback);
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender, responseCallback);
        expect(rx.next).to.have.been.calledTwice;
      });

      it('should not emit anything when no message is received', () => {
        expect(rx.next).to.not.have.been.called;
      });

      it('should not emit anything when message not of specified type is received', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType2, fakeSender, responseCallback);
        expect(rx.next).to.not.have.been.called;
      });

      describe('sending the response', () => {
        const fakeResponse: MessageResponse = new DummyMessageResponse('some-content');
        let response$: Subject<MessageResponse>;

        beforeEach(() => {
          sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender, responseCallback);
          response$ = rx.next.firstCall.args[0].response$;
        });

        it('should send response when the response subject emits a response', () => {
          response$.next(fakeResponse);
          expect(responseCallback).to.have.been.calledOnceWithExactly(fakeResponse);
        });

        it('should send only the first response when the response subject emits a multiple responses', () => {
          const anotherFakeResponse = new DummyMessageResponse('some-other-content');
          response$.next(fakeResponse);
          response$.next(anotherFakeResponse);
          expect(responseCallback).to.have.been.calledOnceWithExactly(fakeResponse);
        });

        it('should not send response when not calling next on response subject', () => {
          expect(responseCallback).to.not.have.been.called;
        });
      });
    });
  });
});

class DummyConcreteMessenger extends BaseMessenger {
}
