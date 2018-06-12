import {ITrackInfo} from '@src/download/resource-info';
import {TrackDownloadInfoFactory} from '@src/download/track-download-info-factory';
import {ITrackDownloadMethodInfo, TrackDownloadMethod} from '@src/download/track-download-method';
import {TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import * as path from 'path';
import {of} from 'rxjs';
import {match, SinonStub, stub} from 'sinon';
import DownloadOptions = chrome.downloads.DownloadOptions;

const expect = useSinonChai();

describe('track download info factory', () => {
  const rx = useRxTesting();
  const fixture = TrackDownloadInfoFactory;

  const trackInfo = {title: 'track?title/with\\special>characters'} as ITrackInfo;
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
    stubGetDownloadMethodInfo$.restore();
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

  context('the download options', () => {
    const DL_OPTIONS_KEY = 'downloadOptions';
    let actual: DownloadOptions;

    beforeEach(() => {
      rx.subscribeTo(fixture.create$(trackInfo, downloadLocation));
      actual = rx.next.firstCall.args[0][DL_OPTIONS_KEY];
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
