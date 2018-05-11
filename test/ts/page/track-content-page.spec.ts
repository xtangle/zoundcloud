import {ZC_DL_BUTTON_CLASS} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {Message} from '@src/messaging/message';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestTrackDownloadMessage} from '@src/messaging/page/request-track-download.message';
import {TrackContentPage, ZC_TRACK_DL_BUTTON_ID} from '@src/page/track-content-page';
import {UrlService} from '@src/util/url-service';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import * as $ from 'jquery';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {SinonFakeTimers, SinonStub, spy, stub, useFakeTimers} from 'sinon';

const forEach = require('mocha-each');
const expect = useSinonChai();

describe('track content page', () => {
  let fixture: TrackContentPage;
  useSinonChrome();

  const testHtml = `
    <body>
      <div class="listenEngagement sc-clearfix">
        <div class="soundActions sc-button-toolbar soundActions__medium">
          <div id="button-group"><button id="button-1"/><button id="button-2"/></div>
        </div>
      </div>
    </body>
  `;

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
    fixture = new TrackContentPage();
  });

  afterEach(() => {
    fixture.unload();
  });

  context('deciding when it should be loaded', () => {
    let stubGetUrl: SinonStub;

    before(() => {
      stubGetUrl = stub(UrlService, 'getCurrentUrl');
    });

    afterEach(() => {
      stubGetUrl.resetHistory();
      stubGetUrl.resetBehavior();
    });

    after(() => {
      stubGetUrl.restore();
    });

    const validTrackPageUrls = [
      'https://soundcloud.com/some-user/some-track',
      'https://soundcloud.com/abcdefg/some-track?in=user/sets/playlist',
    ];

    const invalidTrackPageUrls = [
      'https://soundcloud.com/you/sets',
      'https://soundcloud.com/charts/top',
      'https://soundcloud.com/jobs/2017-12-18-ux-prototyper-berlin',
      'https://soundcloud.com/messages/140983555:5429995',
      'https://soundcloud.com/mobile/pulse',
      'https://soundcloud.com/pages/contact',
      'https://soundcloud.com/pro/gifts',
      'https://soundcloud.com/search/sets?q=asdf',
      'https://soundcloud.com/stations/artists/some-user',
      'https://soundcloud.com/settings/content',
      'https://soundcloud.com/tags/pop',

      'https://soundcloud.com/some-user',
      'https://soundcloud.com/some-user/albums',
      'https://soundcloud.com/some-user/comments',
      'https://soundcloud.com/some-user/followers',
      'https://soundcloud.com/some-user/following',
      'https://soundcloud.com/some-user/likes',
      'https://soundcloud.com/some-user/playlists',
      'https://soundcloud.com/some-user/reposts',
      'https://soundcloud.com/some-user/stats',
      'https://soundcloud.com/some-user/tracks',

      'https://soundcloud.com/some-user/sets/some-playlist',
      'https://soundcloud.com/terms-of-use#acceptance-of-terms-of-use',
      'https://soundcloud.com/discover/sets/new-for-you:140983555'
    ];

    forEach(validTrackPageUrls)
      .it('should test true when the URL is %s', (url: string) => {
        stubGetUrl.onFirstCall().returns(url);
        expect(fixture.test()).to.be.true;
      });

    forEach(invalidTrackPageUrls)
      .it('should test false when the URL is %s', (url: string) => {
        stubGetUrl.onFirstCall().returns(url);
        expect(fixture.test()).to.be.false;
      });

  });

  context('when the content page is loaded', () => {
    const fakeTrackInfo: ITrackInfo = {
      downloadable: false,
      id: 123,
      original_format: 'mp3',
      title: 'title',
      user: {username: 'foo'}
    };
    let fakeTrackInfo$: Subject<ITrackInfo>;
    let stubGetTrackInfo: SinonStub;

    beforeEach(() => {
      fakeTrackInfo$ = new Subject<ITrackInfo>();
      stubGetTrackInfo = stub(DownloadInfoService, 'getTrackInfo');
      stubGetTrackInfo.withArgs(UrlService.getCurrentUrl()).returns(fakeTrackInfo$);
      stubGetTrackInfo.callThrough();
    });

    afterEach(() => {
      stubGetTrackInfo.restore();
    });

    describe('fetching of the track info', () => {
      it('should have null track info initially', () => {
        fixture.load();
        verifyTrackInfoIs(null);
      });

      it('should fetch the track info', () => {
        fixture.load();
        fakeTrackInfo$.next(fakeTrackInfo);
        verifyTrackInfoIs(fakeTrackInfo);
      });
    });

    describe('reloading the content page', () => {
      let fakeMessageHandlerArgs$: Subject<IMessageHandlerArgs<Message>>;
      let stubOnMessage: SinonStub;

      beforeEach(() => {
        fakeMessageHandlerArgs$ = new Subject<IMessageHandlerArgs<Message>>();
        stubOnMessage = stub(ContentPageMessenger, 'onMessage');
        stubOnMessage.withArgs(ReloadContentPageMessage.TYPE).returns(fakeMessageHandlerArgs$);
        stubOnMessage.callThrough();
      });

      beforeEach('load fixture and populate initial track info', () => {
        fixture.load();
        fakeTrackInfo$.next(fakeTrackInfo);
      });

      afterEach(() => {
        stubOnMessage.restore();
      });

      it('should reload when a reload message is received and id matches', () => {
        fakeMessageHandlerArgs$.next({message: new ReloadContentPageMessage(fixture.id), sender: null});
        verifyContentPageIsReloaded();
      });

      it('should not reload when reload message is received and id does not match', () => {
        const differentId = fixture.id + 'X';
        fakeMessageHandlerArgs$.next({message: new ReloadContentPageMessage(differentId), sender: null});
        verifyContentPageIsNotReloaded();
      });

      it('should not reload when no reload message is received', () => {
        verifyContentPageIsNotReloaded();
      });

      function verifyContentPageIsReloaded() {
        verifyTrackInfoIs(null);
        fakeTrackInfo$.next(fakeTrackInfo);
        verifyTrackInfoIs(fakeTrackInfo);
      }

      function verifyContentPageIsNotReloaded() {
        verifyTrackInfoIs(fakeTrackInfo);
      }
    });

    describe('the download button injection', () => {
      it('should be injected when the listen engagement toolbar already exists', () => {
        document.body.innerHTML = testHtml;
        fixture.load();
        verifyDlButtonIsInDOM();
      });

      it('should be injected when the listen engagement toolbar is added', async () => {
        fixture.load();
        await tick();

        verifyDlButtonIsNotInDOM();
        const listenEngagement = $(testHtml).filter('.listenEngagement');
        $('body').append(listenEngagement);
        await tick();

        verifyDlButtonIsInDOM();
      });

      it('should not be injected when the button group cannot be found', () => {
        document.body.innerHTML = testHtml;
        $(`#button-group`).remove();
        fixture.load();
        verifyDlButtonIsNotInDOM();
      });
    });

    describe('the download button behavior', () => {
      let fakeTimer: SinonFakeTimers;

      beforeEach('ensure download button is injected', () => {
        fakeTimer = useFakeTimers();
        document.body.innerHTML = testHtml;
        fixture.load();
      });

      afterEach(() => {
        fakeTimer.restore();
      });

      it('should have the correct classes', () => {
        expect(getDlButton().is(`.sc-button.sc-button-medium.sc-button-responsive.${ZC_DL_BUTTON_CLASS}`)).to.be.true;
      });

      it('should have the correct label', () => {
        expect(getDlButton().html()).to.be.equal('Download');
      });

      it('should have the correct title', () => {
        expect(getDlButton().prop('title')).to.be.equal('Download this track');
      });

      it('should be added as the last child of the button group if the last button is not the More button', () => {
        expect($('#button-group').find('button:last-child').is(getDlButton())).to.be.true;
      });

      it('should be added as the second-to-last child of the button group ' +
        'if the last button is the More button', () => {
        fixture.unload();
        const btnGroup = $('#button-group');
        const moreBtn = $('<button/>').addClass('sc-button-more');
        btnGroup.append(moreBtn);
        fixture.load();
        expect(btnGroup.find('button:nth-last-child(2)').is(getDlButton())).to.be.true;
      });

      describe('the behavior when clicked', () => {
        let stubSendToExtension: SinonStub;

        before(() => {
          stubSendToExtension = stub(ContentPageMessenger, 'sendToExtension');
        });

        afterEach(() => {
          stubSendToExtension.resetHistory();
        });

        after(() => {
          stubSendToExtension.restore();
        });

        it('should send a request download message if track info is not null', () => {
          fakeTrackInfo$.next(fakeTrackInfo);
          getDlButton().trigger('click');
          expect(stubSendToExtension).to.have.been.calledOnce
            .calledWithExactly(new RequestTrackDownloadMessage(fakeTrackInfo));
        });

        it('should not send a request download message if there is no track info', () => {
          getDlButton().trigger('click');
          expect(stubSendToExtension).to.not.have.been.called;
        });

        it('should not send a request download message when not clicked', () => {
          fakeTrackInfo$.next(fakeTrackInfo);
          expect(stubSendToExtension).to.not.have.been.called;
        });

        it('should throttle clicks that are within 3s of each other', () => {
          fakeTrackInfo$.next(fakeTrackInfo);
          getDlButton().trigger('click');
          fakeTimer.tick(2900);
          getDlButton().trigger('click');
          expect(stubSendToExtension).to.have.been.calledOnce;

          fakeTimer.tick(101);
          getDlButton().trigger('click');
          expect(stubSendToExtension).to.have.been.calledTwice;
        });
      });
    });

    function verifyTrackInfoIs(trackInfo: ITrackInfo) {
      const TRACK_INFO_PROP = 'trackInfo$';
      expect((fixture[TRACK_INFO_PROP] as BehaviorSubject<ITrackInfo>).getValue()).to.be.equal(trackInfo);
    }
  });

  context('when the content page is unloaded', () => {
    beforeEach('add download button to DOM', () => {
      document.body.innerHTML = testHtml;
      const dlButton = $('<button/>').attr('id', ZC_TRACK_DL_BUTTON_ID);
      $(`#button-group`).append(dlButton);
    });

    it('should remove the download button', () => {
      fixture.unload();
      verifyDlButtonIsNotInDOM();
    });

    it('should unsubscribe from all subscriptions', () => {
      const SUBS_PROP = 'subscriptions';
      const spyUnsubscribe = spy((fixture as any)[SUBS_PROP] as Subscription, 'unsubscribe');
      fixture.unload();
      expect(spyUnsubscribe).to.be.called;
    });
  });

  function getDlButton(): JQuery<HTMLElement> {
    return $(`#${ZC_TRACK_DL_BUTTON_ID}`);
  }

  function verifyDlButtonIsInDOM() {
    expect(getDlButton().length).to.be.equal(1, 'download button is not in DOM when it should be');
  }

  function verifyDlButtonIsNotInDOM() {
    expect(getDlButton().length).to.be.equal(0, 'download button is in DOM when it should not be');
  }
});
