import {Message, MessageType} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {DefaultMessenger, IMessenger} from '@src/messaging/messenger';
import {DummyMessage} from '@test/messaging/dummy-message';
import {DummyMessageResponse} from '@test/messaging/dummy-message-response';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {match, SinonSpy, spy} from 'sinon';
import MessageSender = chrome.runtime.MessageSender;

const expect = useSinonChai();

describe('default messenger', () => {
  const sinonChrome = useSinonChrome();

  let fixture: IMessenger;
  let subscription: Subscription;
  const callback: SinonSpy = spy();

  const msgType1: MessageType = 'MessageType-1';
  const msgType2: MessageType = 'MessageType-2';
  const fakeMsgOfType1: Message = new DummyMessage(msgType1);
  const fakeMsgOfType2: Message = new DummyMessage(msgType2);
  const fakeSender: MessageSender = {id: 'some-id'};

  beforeEach(() => {
    fixture = new DummyConcreteMessenger();
  });

  afterEach(() => {
    callback.resetHistory();
    subscription.unsubscribe();
  });

  describe('listening on a message', () => {
    context('when not sending a response', () => {
      beforeEach(() => {
        subscription = fixture.onMessage(msgType1).subscribe(callback);
      });

      it('should emit the message and sender when message of specified type is received', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender);
        expect(callback).to.have.been.calledOnce.calledWithExactly({message: fakeMsgOfType1, sender: fakeSender});
      });

      it('should emit multiple times when message of specified type is received multiple times', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender);
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender);
        expect(callback).to.have.been.calledTwice;
      });

      it('should not emit anything when no message is received', () => {
        expect(callback).to.not.have.been.called;
      });

      it('should not emit anything when message not of specified type is received', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType2, fakeSender);
        expect(callback).to.not.have.been.called;
      });
    });

    context('when sending a response', () => {
      const responseCallback: SinonSpy = spy();

      afterEach(() => {
        responseCallback.resetHistory();
      });

      beforeEach(() => {
        subscription = fixture.onMessage(msgType1, true).subscribe(callback);
      });

      it('should emit message, sender, and response subject when message of specified type is received', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender, responseCallback);
        expect(callback).to.have.been.calledOnce
          .calledWithExactly({message: fakeMsgOfType1, sender: fakeSender, response$: match.instanceOf(Subject)});
      });

      it('should emit multiple times when message of specified type is received multiple times', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender, responseCallback);
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender, responseCallback);
        expect(callback).to.have.been.calledTwice;
      });

      it('should not emit anything when no message is received', () => {
        expect(callback).to.not.have.been.called;
      });

      it('should not emit anything when message not of specified type is received', () => {
        sinonChrome.runtime.onMessage.trigger(fakeMsgOfType2, fakeSender, responseCallback);
        expect(callback).to.not.have.been.called;
      });

      describe('sending the response', () => {
        const fakeResponse: MessageResponse = new DummyMessageResponse('some-content');
        let response$: Subject<MessageResponse>;

        beforeEach(() => {
          sinonChrome.runtime.onMessage.trigger(fakeMsgOfType1, fakeSender, responseCallback);
          response$ = callback.firstCall.args[0].response$;
        });

        it('should send response when the response subject emits a response', () => {
          response$.next(fakeResponse);
          expect(responseCallback).to.have.been.calledOnce.calledWithExactly(fakeResponse);
        });

        it('should send only the first response when the response subject emits a multiple responses', () => {
          const anotherFakeResponse = new DummyMessageResponse('some-other-content');
          response$.next(fakeResponse);
          response$.next(anotherFakeResponse);
          expect(responseCallback).to.have.been.calledOnce.calledWithExactly(fakeResponse);
        });

        it('should not send response when not calling next on response subject', () => {
          expect(responseCallback).to.not.have.been.called;
        });
      });
    });
  });
});

class DummyConcreteMessenger extends DefaultMessenger {
}
