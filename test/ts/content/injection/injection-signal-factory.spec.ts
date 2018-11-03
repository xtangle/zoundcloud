import * as $ from 'jquery';
import {Subject} from 'rxjs';
import {clock, restore, SinonStub, stub, useFakeTimers} from 'sinon';
import {ZC_DL_BUTTON_CLASS} from 'src/ts/constants';
import {InjectionSignalFactory} from 'src/ts/content/injection/injection-signal-factory';
import {ReloadContentPageMessage} from 'src/ts/messaging/extension/reload-content-page.message';
import {Message} from 'src/ts/messaging/message';
import {MessageResponse} from 'src/ts/messaging/message-response';
import {IMessageHandlerArgs} from 'src/ts/messaging/messenger';
import {ContentPageMessenger} from 'src/ts/messaging/page/content-page-messenger';
import {configureChai, useRxTesting} from 'test/ts/test-initializers';

const expect = configureChai();

describe('injection signal factory', () => {
  const rx = useRxTesting();

  const fixture = InjectionSignalFactory;
  const selector = '.a';
  let diva: JQuery<HTMLElement>;

  let message$: Subject<IMessageHandlerArgs<Message, MessageResponse>>;
  let stubOnMessage$: SinonStub;

  beforeEach(() => {
    useFakeTimers();

    diva = $('<div class="a"></div>');
    message$ = new Subject();
    stubOnMessage$ = stub(ContentPageMessenger, 'onMessage$');
    stubOnMessage$.withArgs(ReloadContentPageMessage.TYPE).returns(message$);
  });

  afterEach(() => {
    restore();
  });

  it('should not stop the injection signal', () => {
    rx.subscribeTo(fixture.create$(selector));
    expect(rx.complete).to.not.have.been.called;
  });

  /**
   * This section of the test uses async/await to simulate time passage instead of sinon's fake clock.
   * Why? Because rxjs's delay operator does not work with the fake clock (while the timeout operator does).
   * Awesome, isn't it?
   */
  context('triggering by the element existing or added to DOM', () => {
    beforeEach(() => {
      document.body.innerHTML = `<body><div></div></body>`;
    });

    it('should not emit if element does not exist', () => {
      rx.subscribeTo(fixture.create$(selector));
      expect(rx.next).to.not.have.been.called;
    });

    it('should emit if element already exists in DOM', () => {
      $('body').append(diva);
      rx.subscribeTo(fixture.create$(selector));
      expect(rx.next).to.have.been.calledOnceWithExactly(diva);
    });

    it('should not emit if element exists but already has download button', () => {
      diva.append(`<button class="${ZC_DL_BUTTON_CLASS}"></button>`);
      $('body').append(diva);
      rx.subscribeTo(fixture.create$(selector));
      expect(rx.next).to.not.have.been.called;
    });

    it('should emit if element is added to DOM', () => {
      rx.subscribeTo(fixture.create$(selector));
      $('body').append(diva);
      clock.next();
      expect(rx.next).to.have.been.calledOnceWithExactly(diva);
    });

    it('should not emit if element not matching selector is added to DOM', () => {
      const divb = $('<div class="b"></div>');
      rx.subscribeTo(fixture.create$(selector));
      $('body').append(divb);
      clock.next();
      expect(rx.next).to.not.have.been.called;
    });
  });

  context('triggering by forceful injection', () => {
    beforeEach(() => {
      document.body.innerHTML = `<body><div></div></body>`;
      $('body').append(diva);

      rx.subscribeTo(fixture.create$(selector));
      discardPreviousEmissions();
    });

    it('should forcefully emit every 1 second', () => {
      clock.tick(999);
      expect(rx.next).to.not.have.been.called;
      clock.tick(1);
      expect(rx.next).to.have.been.calledOnceWithExactly(diva);
      clock.tick(999);
      expect(rx.next).to.have.been.calledOnce;
      clock.tick(1);
      expect(rx.next).to.have.been.calledTwice;
    });

    it('should forcefully emit every 200 ms for 20 times upon receiving a reload content page message', () => {
      message$.next();
      clock.tick(200);
      expect(rx.next).to.have.been.calledOnceWithExactly(diva);
      clock.tick(1800);
      expect(rx.next.callCount).to.be.equal(12);
      clock.tick(2000);
      expect(rx.next.callCount).to.be.equal(24);
      clock.tick(2000);
      expect(rx.next.callCount).to.be.equal(26);
    });

    it('should not emit if existing element already has download button', () => {
      diva.append(`<button class="${ZC_DL_BUTTON_CLASS}"></button>`);
      message$.next();
      clock.tick(10000);
      expect(rx.next).to.not.have.been.called;
    });

    it('should not emit if element does not exist in the DOM', () => {
      diva.remove();
      message$.next();
      clock.tick(10000);
      expect(rx.next).to.not.have.been.called;
    });

    function discardPreviousEmissions() {
      rx.next.resetHistory();
    }
  });
});
