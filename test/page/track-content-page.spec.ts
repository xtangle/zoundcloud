import {expect} from 'chai';
import * as $ from 'jquery';
import {stub} from 'sinon';
import {ZC_DL_BUTTON_CLASS} from '../../src/constants';
import {TrackContentPage} from '../../src/page/track-content-page';

describe('track content page', () => {

  let fixture: TrackContentPage;

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
      const stubGetURL = stub(fixture, 'getCurrentURL');
      trackPageUrls.forEach((url, index) => {
        stubGetURL.onCall(index).returns(url);
        expect(fixture.test()).to.be.true;
      });
    });

    it('should not load when URL does not match a track page', () => {
      const stubGetURL = stub(fixture, 'getCurrentURL');
      nonTrackPageUrls.forEach((url, index) => {
        stubGetURL.onCall(index).returns(url);
        expect(fixture.test()).to.be.false;
      });
    });

  });

  describe('loading of the content page', () => {

    const innerTestHTML = `
      <div class="listenEngagement sc-clearfix">
        <div class="soundActions sc-button-toolbar soundActions__medium">
          <div><button id="button-1"/><button id="button-2"/></div>
        </div>
      </div>
    `;

    const testHTML = `<body>${innerTestHTML}</body>`;

    it('should inject the download button when listen engagement toolbar already exists', () => {
      document.body.innerHTML = testHTML;
      fixture.load();
      verifyDlButtonIsInjected();
    });

    it('should inject the download button when listen engagement toolbar is added', (done) => {
      const innerNodes = $.parseHTML(innerTestHTML);
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

    function verifyDlButtonIsInjected() {
      expect($(`.${ZC_DL_BUTTON_CLASS}`).length).to.be.equal(1);
    }

    function verifyDlButtonIsNotInjected() {
      expect($(`.${ZC_DL_BUTTON_CLASS}`).length).to.be.equal(0);
    }

  });

});
