import * as path from 'path';
import {of} from 'rxjs';
import {match, restore, SinonStub, stub} from 'sinon';
import {ITrackInfo} from 'src/ts/download/resource/resource-info';
import {ITrackDownloadInfo} from 'src/ts/download/track-download-info';
import {TrackDownloadInfoFactory} from 'src/ts/download/track-download-info-factory';
import {ITrackDownloadMethodInfo, TrackDownloadMethod} from 'src/ts/download/track-download-method';
import {TrackDownloadMethodService} from 'src/ts/download/track-download-method-service';
import {defaultOptions} from 'src/ts/options/default-options';
import {IOptions} from 'src/ts/options/option';
import {OptionsObservables} from 'src/ts/options/options-observables';
import {configureChai, useRxTesting} from 'test/ts/test-initializers';

const forEach = require('mocha-each');
const expect = configureChai();

describe('track download info factory', () => {
  const rx = useRxTesting();

  const fixture = TrackDownloadInfoFactory;
  const trackInfo = Object.freeze({title: 'track?title/with\\special>characters'}) as ITrackInfo;
  const downloadLocation = 'download?location/with\\special<characters';
  const downloadMethodInfo: ITrackDownloadMethodInfo = {
    downloadMethod: TrackDownloadMethod.DownloadUrlMethod,
    format: 'wav',
    url: 'download-url',
  };

  let options: IOptions;
  let stubGetOptions$: SinonStub;
  let stubGetDownloadMethodInfo$: SinonStub;

  beforeEach(() => {
    options = {
      cleanTrackTitle: {...defaultOptions.cleanTrackTitle},
      overwriteExistingFiles: false,
    } as IOptions;

    stubGetOptions$ = stub(OptionsObservables, 'getOptions$');
    stubGetOptions$.returns(of(options));

    stubGetDownloadMethodInfo$ = stub(TrackDownloadMethodService, 'getDownloadMethodInfo$');
    stubGetDownloadMethodInfo$.withArgs(trackInfo).returns(of(downloadMethodInfo));
  });

  afterEach(() => {
    restore();
  });

  it('should return a track download info and complete', () => {
    rx.subscribeTo(fixture.create$(trackInfo, downloadLocation));
    expect(rx.next).to.have.been.calledOnce;
    expect(rx.complete).to.have.been.called;
  });

  it('should set the download method', () => {
    rx.subscribeTo(fixture.create$(trackInfo, downloadLocation));
    expect(rx.next).to.have.been
      .calledWithMatch(match.has('downloadMethod', downloadMethodInfo.downloadMethod));
  });

  it('should set the original url', () => {
    rx.subscribeTo(fixture.create$(trackInfo, downloadLocation));
    expect(rx.next).to.have.been
      .calledWithMatch(match.has('originalUrl', downloadMethodInfo.url));
  });

  it('should set the track info', () => {
    rx.subscribeTo(fixture.create$(trackInfo, downloadLocation));
    expect(rx.next).to.have.been
      .calledWithMatch(match.has('trackInfo', trackInfo));
  });

  context('cleaning the track info with the default pattern', () => {
    const trackTitles = [
      'Alok & Sevenn - BYOB [ FREE DOWNLOAD ]',
      'Calvin Harris - Live At EDC Las Vegas 2014 FREE DOWNLOAD',
      'Analog Trip @ EDM Underground Sessions Vol021 Protonradio 10-1-2017 | Free Download: goo.gl/pgD3gr',
      'Strip That Down - Liam Payne ("Deep House" Lucas Levi Remix)*BUY = FREE DOWNLOAD*',
      'Alan Walker - Faded (Osias Trap Remix) [BUY = FREE DOWNLOAD]',
      'Bob Marley - Is This Love (Soke Remix) **FREE DOWNLOAD**',
      'Hip Hop Beats Instrumental - Hard Work |Free Download| (Standard Lease $24.95) (Instant Delivery)',
      'Tracy Chapman - Fast Car (Bauke Top Remix) (Buy=Free DL)',
      `Taylor Swift & Zayn Malik - I Don't Wanna Live Forever (Toob's Moombahbaas Refix) (buy = free DL!)`,
      'All That Swag (Prod By. YaBoyJDub) *Wack Rap Tuesday* ["BUY" IS FREE DL!]',
      `Jennifer Lopez - Ain't Your Mama (DEEJAYDANNY BOOTLEG)HIT BUY FOR FREE DOWNLOAD !`,
      'Dj Taj ~ Latch (Remix) {DOWNLOAD LINK IN DESCRIPTION}',
      'Dilbar Dilbar ― DJ Farrukh Squashup ― Download Link : hearthis.at/2167189/',
      'Snatch Ma Crops (full download link in description box)',
      // negative cases
      '[FREE_DL] Yuto.com City Light Remix SHIMPEI ×JIVA Nel MONDO',
      '[Buy link = FREE DL!!!] Tororoudon - Hot Cocoa',
    ];

    const expectedTitles = [
      'Alok & Sevenn - BYOB',
      'Calvin Harris - Live At EDC Las Vegas 2014',
      'Analog Trip @ EDM Underground Sessions Vol021 Protonradio 10-1-2017',
      'Strip That Down - Liam Payne ("Deep House" Lucas Levi Remix)',
      'Alan Walker - Faded (Osias Trap Remix)',
      'Bob Marley - Is This Love (Soke Remix)',
      'Hip Hop Beats Instrumental - Hard Work',
      'Tracy Chapman - Fast Car (Bauke Top Remix)',
      `Taylor Swift & Zayn Malik - I Don't Wanna Live Forever (Toob's Moombahbaas Refix)`,
      'All That Swag (Prod By. YaBoyJDub) *Wack Rap Tuesday',
      'Jennifer Lopez - Ain\'t Your Mama (DEEJAYDANNY BOOTLEG)',
      'Dj Taj ~ Latch (Remix)',
      'Dilbar Dilbar ― DJ Farrukh Squashup',
      'Snatch Ma Crops',
      // negative cases
      '[FREE_DL] Yuto.com City Light Remix SHIMPEI ×JIVA Nel MONDO',
      '[Buy link = FREE DL!!!] Tororoudon - Hot Cocoa',
    ];

    beforeEach(() => {
      stubGetDownloadMethodInfo$.returns(of(downloadMethodInfo));
    });

    // In test setup, clean track titles option is enabled
    forEach(trackTitles.map((t, i) => [t, expectedTitles[i]]))
      .it(`should clean track title for '%s'`, (trackTitle: string, expected: string) => {
        const newTrackInfo = {...trackInfo, title: trackTitle};
        rx.subscribeTo(fixture.create$(newTrackInfo, downloadLocation));
        const actual: ITrackDownloadInfo = rx.next.firstCall.args[0];

        expect(actual.trackInfo.title).to.be.equal(expected);
        // expect(actual.downloadOptions.filename).to.contain(expected);
      });

    it('should not clean the track title when clean track title option is disabled', () => {
      stubGetOptions$.returns(of({cleanTrackTitle: {enabled: false}}));
      const newTrackInfo = {...trackInfo, title: trackTitles[0]};
      rx.subscribeTo(fixture.create$(newTrackInfo, downloadLocation));
      const actual: ITrackDownloadInfo = rx.next.firstCall.args[0];

      expect(actual.trackInfo.title).to.be.equal(trackTitles[0]);
      // expect(actual.downloadOptions.filename).to.contain(trackTitles[0]);
    });
  });

  context('the download options', () => {
    it('should set the correct filepath with special characters removed', () => {
      const actual = getDownloadOptions();
      const expectedPath = path.join('download_location_with_special_characters',
        'track_title_with_special_characters.wav');
      expect(actual.filename).to.be.equal(expectedPath);
    });

    it('should not ask the user where to download', () => {
      const actual = getDownloadOptions();
      expect(actual.saveAs).to.be.false;
    });

    it('should not overwrite an existing file with the same file name'
      + ' if overwrite existing files option is disabled', () => {
      // In test setup, overwrite existing files option is disabled
      const actual = getDownloadOptions();
      expect(actual.conflictAction).to.be.equal('uniquify');
    });

    it('should overwrite an existing file with the same file name'
      + ' if overwrite existing files option is enabled', () => {
      stubGetOptions$.returns(of({...options, overwriteExistingFiles: true}));
      const actual = getDownloadOptions();
      expect(actual.conflictAction).to.be.equal('overwrite');
    });

    it('should use the correct download url', () => {
      const actual = getDownloadOptions();
      expect(actual.url).to.be.equal(downloadMethodInfo.url);
    });

    function getDownloadOptions() {
      rx.subscribeTo(fixture.create$(trackInfo, downloadLocation));
      return rx.next.firstCall.args[0].downloadOptions;
    }
  });
});
