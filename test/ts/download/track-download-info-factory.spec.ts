import * as path from 'path';
import {of} from 'rxjs';
import {match, restore, SinonStub, stub} from 'sinon';
import {ITrackInfo} from 'src/ts/download/resource/resource-info';
import {ITrackDownloadInfo} from 'src/ts/download/track-download-info';
import {TrackDownloadInfoFactory} from 'src/ts/download/track-download-info-factory';
import {ITrackDownloadMethodInfo, TrackDownloadMethod} from 'src/ts/download/track-download-method';
import {TrackDownloadMethodService} from 'src/ts/download/track-download-method-service';
import {configureChai, useRxTesting} from 'test/ts/test-initializers';
import DownloadOptions = chrome.downloads.DownloadOptions;

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
    url: 'download-url'
  };

  let stubGetDownloadMethodInfo$: SinonStub;

  beforeEach(() => {
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

  context('cleaning the track info', () => {
    const titleSuffixes = [
      ' - FREE DOWNLOAD',
      '|[FREE DOWNLOAD]',
      '** FREE DOWNLOAD **',
      ' // FREE DOWNLOAD!!! //',
      ' * FREE DOWNLOAD !!!',
      '_Free Download',
      ' (Free Download)',
      ' free download',
      ' [Buy = Free Download]',
      '*BUY=FREE DOWNLOAD*',
      ' BUY= Free Download',
      '| free dl',
      ' FREE_DL'
    ];

    forEach(titleSuffixes)
      .it(`should remove '%s' from the end of the song title`, (suffix: string) => {
        const newTrackInfo = {...trackInfo, title: `${trackInfo.title}${suffix}`};
        rx.subscribeTo(fixture.create$(newTrackInfo, downloadLocation));
        const actual: ITrackDownloadInfo = rx.next.firstCall.args[0];

        expect(actual.trackInfo.title).to.be.equal(trackInfo.title);
        expect(actual.downloadOptions.filename).not.to.contain(suffix);
      });
  });

  context('the download options', () => {
    let actual: DownloadOptions;

    beforeEach(() => {
      rx.subscribeTo(fixture.create$(trackInfo, downloadLocation));
      actual = rx.next.firstCall.args[0].downloadOptions;
    });

    it('should set the correct filepath with special characters removed', () => {
      const expectedPath = path.join('download_location_with_special_characters',
        'track_title_with_special_characters.wav');
      expect(actual.filename).to.be.equal(expectedPath);
    });

    it('should not ask the user where to download', () => {
      expect(actual.saveAs).to.be.false;
    });

    it('should not overwrite an existing file with the same filename', () => {
      expect(actual.conflictAction).to.be.equal('uniquify');
    });

    it('should use the correct download url', () => {
      expect(actual.url).to.be.equal(downloadMethodInfo.url);
    });
  });
});
