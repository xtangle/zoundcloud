import {ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_ICON_CLASS} from '@src/constants';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestDownloadMessage} from '@src/messaging/page/request-download.message';
import {DownloadButtonFactory} from '@src/page/injection/download-button-factory';
import {configureChai} from '@test/test-initializers';
import {Subject} from 'rxjs';
import {clock, restore, SinonStub, stub, useFakeTimers} from 'sinon';

const expect = configureChai();

describe('download button factory', () => {
  const fixture = DownloadButtonFactory;
  const resourceInfoUrl = 'resource-info-url';
  let onUnload$: Subject<any>;
  let button: JQuery<HTMLElement>;

  let stubSendToExtension: SinonStub;

  beforeEach(() => {
    useFakeTimers();

    onUnload$ = new Subject();
    button = fixture.create(onUnload$, resourceInfoUrl);
    stubSendToExtension = stub(ContentPageMessenger, 'sendToExtension$');
  });

  afterEach(() => {
    onUnload$.complete();
    restore();
  });

  context('button properties', () => {
    it('should be a button', () => {
      expect(button[0].tagName.toLowerCase()).to.be.equal('button');
    });

    it('should have the SoundCloud button classes', () => {
      expect(button).to.have.$class('sc-button');
      expect(button).to.have.$class('sc-button-responsive');
    });

    it('should have the ZoundCloud button classes', () => {
      expect(button).to.have.$class(ZC_DL_BUTTON_CLASS);
      expect(button).to.have.$class(ZC_DL_BUTTON_ICON_CLASS);
    });

    it('should have a title of Download', () => {
      expect(button.attr('title')).to.be.equal('Download');
    });

    it('should have a text of Download', () => {
      expect(button.html()).to.be.equal('Download');
    });
  });

  context('button behavior', () => {
    it('should send a request download message with the resource info url when clicked', () => {
      button.trigger('click');
      expect(stubSendToExtension).to.have.been.calledOnce
        .calledWithExactly(new RequestDownloadMessage(resourceInfoUrl));
    });

    it('should throttle clicks that are within 3 seconds of each other', () => {
      button.trigger('click');
      clock.tick(2999);
      button.trigger('click');
      expect(stubSendToExtension).to.have.been.calledOnce;

      clock.tick(1);
      button.trigger('click');
      expect(stubSendToExtension).to.have.been.calledTwice;
    });

    it('should not send request download message when unloaded', () => {
      onUnload$.next();
      button.trigger('click');
      expect(stubSendToExtension).to.not.have.been.called;
    });
  });
});
