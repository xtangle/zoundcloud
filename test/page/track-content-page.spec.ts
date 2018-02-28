import {expect} from 'chai';
import * as chai from 'chai';
import * as $ from 'jquery';
import {Subscription} from 'rxjs/Subscription';
import {spy, stub} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {ZC_DL_BUTTON_CLASS} from '../../src/constants';
import {TrackContentPage, ZC_TRACK_DL_BUTTON_ID} from '../../src/page/track-content-page';

describe('track content page', () => {
  chai.use(sinonChai);

  let fixture: TrackContentPage;

  const innerTestHtml = `
    <div class="listenEngagement sc-clearfix">
      <div class="soundActions sc-button-toolbar soundActions__medium">
        <div id="button-group"><button id="button-1"/><button id="button-2"/></div>
      </div>
    </div>
  `;
  const testHtml = `<body>${innerTestHtml}</body>`;

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
    fixture = new TrackContentPage();
  });

  afterEach(() => {
    fixture.unload();
  });

  describe('deciding when it should be loaded', () => {

    const trackPageUrls = [
      'https://soundcloud.com/some-user/some-track',
      'https://soundcloud.com/abcdefg/some-track?in=user/sets/playlist',
    ];

    const nonTrackPageUrls = [
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

    it('should load when URL matches a track page', () => {
      const stubGetURL = stub(fixture as any, 'getCurrentURL');
      trackPageUrls.forEach((url, index) => {
        stubGetURL.onCall(index).returns(url);
        expect(fixture.test()).to.be.true;
      });
    });

    it('should not load when URL does not match a track page', () => {
      const stubGetURL = stub(fixture as any, 'getCurrentURL');
      nonTrackPageUrls.forEach((url, index) => {
        stubGetURL.onCall(index).returns(url);
        expect(fixture.test()).to.be.false;
      });
    });

  });

  describe('loading of the content page', () => {

    it('should inject the download button when listen engagement toolbar already exists', () => {
      document.body.innerHTML = testHtml;
      fixture.load();
      verifyDlButtonIsInjected();
    });

    it('should inject the download button when listen engagement toolbar is added', (done) => {
      const innerNodes = $.parseHTML(innerTestHtml);
      fixture.load();
      setTimeout(() => {
        verifyDlButtonIsNotInjected();
        $('body').append(innerNodes);
        setTimeout(() => {
          console.log(document.body.innerHTML);
          verifyDlButtonIsInjected();
          done();
        }, 100);
      }, this.timeout - 100);
    });

    it('should not inject the download button when the button group cannot be found', () => {
      document.body.innerHTML = testHtml;
      $(`#button-group`).remove();
      fixture.load();
      verifyDlButtonIsNotInjected();
    });

    context('the download button', () => {
      beforeEach(() => {
        document.body.innerHTML = testHtml;
      });

      it('should have the correct classes', () => {
        fixture.load();
        expect(getDlButton().is(`.sc-button.sc-button-medium.sc-button-responsive.${ZC_DL_BUTTON_CLASS}`))
          .to.be.true;
      });

      it('should have the correct label', () => {
        fixture.load();
        expect(getDlButton().html()).to.be.equal('Download');
      });

      it('should have the correct title', () => {
        fixture.load();
        expect(getDlButton().prop('title')).to.be.equal('Download this track');
      });

      it('should be added as the last child of the button group ' +
        'if the last button is not the \'More\' button', () => {
        fixture.load();
        expect($('#button-group').find('button:last-child').is(getDlButton())).to.be.true;
      });

      it('should be added as the second-to-last child of the button group ' +
        'if the last button is the \'More\' button', () => {
        const btnGroup = $('#button-group');
        const moreBtn = $('<button/>').addClass('sc-button-more');
        btnGroup.append(moreBtn);
        fixture.load();
        expect(btnGroup.find('button:nth-last-child(2)').is(getDlButton())).to.be.true;
      });
    });

  });

  describe('unloading of the content page', () => {
    beforeEach(() => {
      document.body.innerHTML = testHtml;
      const dlButton = $('<button/>').attr('id', ZC_TRACK_DL_BUTTON_ID);
      $(`#button-group`).append(dlButton);
    });

    it('should remove the download button', () => {
      fixture.unload();
      verifyDlButtonIsNotInjected();
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

  function verifyDlButtonIsInjected() {
    expect(getDlButton().length).to.be.equal(1, 'download button is not injected when it should');
  }

  function verifyDlButtonIsNotInjected() {
    expect(getDlButton().length).to.be.equal(0, 'download button is injected when it should not be');
  }
});
