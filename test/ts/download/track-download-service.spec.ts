import {of, throwError, timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {clock, match, restore, SinonSpy, SinonStub, spy, stub, useFakeTimers} from 'sinon';
import {MetadataAdapter} from 'src/ts/download/metadata/metadata-adapter';
import {ITrackInfo, ResourceType} from 'src/ts/download/resource/resource-info';
import {ITrackDownloadInfo} from 'src/ts/download/track-download-info';
import {TrackDownloadInfoFactory} from 'src/ts/download/track-download-info-factory';
import {TrackDownloadService} from 'src/ts/download/track-download-service';
import {OptionsObservables} from 'src/ts/options/options-observables';
import {matchesCause, matchesError} from 'test/ts/sinon-matchers';
import {configureChai, useRxTesting, useSinonChrome} from 'test/ts/test-initializers';
import DownloadOptions = chrome.downloads.DownloadOptions;

const expect = configureChai();

describe(`track download service`, () => {
  const sinonChrome = useSinonChrome();
  const rx = useRxTesting();

  const fixture = TrackDownloadService;
  const trackInfo = {title: 'some-song'} as ITrackInfo;
  const downloadLocation = 'download-location';
  const downloadInfo = {
    downloadOptions: {url: 'original-url'} as DownloadOptions,
    trackInfo,
  } as ITrackDownloadInfo;
  const downloadInfoWithMetadata = {
    downloadOptions: {url: 'updated-options-url'} as DownloadOptions,
    trackInfo,
  } as ITrackDownloadInfo;

  let stubGetOptions$: SinonStub;
  let stubCreateDownloadInfo$: SinonStub;
  let stubAddMetadata$: SinonStub;
  let stubRevokeObjectURL: SinonSpy;

  beforeEach(() => {
    useFakeTimers();

    stubGetOptions$ = stub(OptionsObservables, 'getOptions$');
    stubGetOptions$.returns(of({addMetadata: {enabled: true}}));

    stubCreateDownloadInfo$ = stub(TrackDownloadInfoFactory, 'create$');
    stubCreateDownloadInfo$.withArgs(trackInfo, downloadLocation).returns(of(downloadInfo));

    stubAddMetadata$ = stub(MetadataAdapter, 'addMetadata$');
    stubAddMetadata$.withArgs(downloadInfo).returns(of(downloadInfoWithMetadata));

    stubRevokeObjectURL = spy(URL, 'revokeObjectURL');
    sinonChrome.downloads.download.yields(123);
  });

  afterEach(() => {
    restore();
  });

  describe(`downloading a track`, () => {
    it('should download the track and add track metadata when add metadata option is enabled', () => {
      // In test setup, add metadata option is enabled
      fixture.download(trackInfo, downloadLocation);

      expect(stubAddMetadata$).to.have.been.calledOnceWithExactly(downloadInfo);
      expect(sinonChrome.downloads.download).to.have.been.calledOnce
        .calledWithExactly(downloadInfoWithMetadata.downloadOptions, match.any);
    });

    it('should download the track and not add track metadata when add metadata option is disabled', () => {
      stubGetOptions$.returns(of({addMetadata: {enabled: false}}));
      fixture.download(trackInfo, downloadLocation);

      expect(stubAddMetadata$).not.to.have.been.called;
      expect(sinonChrome.downloads.download).to.have.been.calledOnce
        .calledWithExactly(downloadInfo.downloadOptions, match.any);
    });

    it('should revoke the download url after starting the download', () => {
      fixture.download(trackInfo, downloadLocation);

      expect(stubRevokeObjectURL).to.have.been.calledOnce
        .calledWithExactly(downloadInfoWithMetadata.downloadOptions.url)
        .calledAfter(sinonChrome.downloads.download);
    });

    it('should download with a default download location of empty (current directory)', () => {
      stubCreateDownloadInfo$.withArgs(trackInfo, '').returns(of(downloadInfo));
      fixture.download(trackInfo);

      expect(stubCreateDownloadInfo$).to.have.been.calledOnceWithExactly(trackInfo, '');
      expect(sinonChrome.downloads.download).to.have.been.called;
    });

    it('should return the download result with the correct kind and trackInfo', () => {
      const actual = fixture.download(trackInfo, downloadLocation);

      expect(actual.kind).to.be.equal(ResourceType.Track);
      expect(actual.trackInfo).to.be.equal(trackInfo);
    });

    it('should return an item in download metadata if download started successfully', () => {
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);

      expect(rx.next).to.have.been
        .calledOnceWithExactly({downloadId: 123, downloadInfo: downloadInfoWithMetadata});
      expect(rx.complete).to.have.been.called;
    });

    it('should return an error in download metadata if download info cannot be fetched', () => {
      const cause = new Error('cannot fetch download info');
      stubCreateDownloadInfo$.withArgs(trackInfo, downloadLocation).returns(throwError(cause));
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);

      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.calledOnce.calledWithMatch(matchesCause(cause));
    });

    it('should return an error in download metadata if there was error starting the download', () => {
      sinonChrome.runtime.lastError = {message: 'some error message'};
      sinonChrome.downloads.download.yields(undefined);
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);

      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.calledOnce.calledWithMatch(matchesError('some error message'));
    });

    it('should download if fetching download info or metadata takes less than 30 minutes', () => {
      stubCreateDownloadInfo$.withArgs(trackInfo, downloadLocation)
        .returns(timer(900000).pipe(mapTo(downloadInfo)));
      stubAddMetadata$.withArgs(downloadInfo)
        .returns(timer(899999).pipe(mapTo(downloadInfoWithMetadata)));
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);
      clock.tick(1800000);

      expect(sinonChrome.downloads.download).to.have.been.called;
      expect(rx.next).to.have.been.calledOnce;
      expect(rx.complete).to.have.been.called;
    });

    it('should not download and emit error if fetching download method takes 30 minutes or more', () => {
      stubCreateDownloadInfo$.withArgs(trackInfo, downloadLocation)
        .returns(timer(900000).pipe(mapTo(downloadInfo)));
      stubAddMetadata$.withArgs(downloadInfo)
        .returns(timer(900000).pipe(mapTo(downloadInfoWithMetadata)));
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);
      clock.tick(1800000);

      expect(sinonChrome.downloads.download).to.not.have.been.called;
      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.called;
    });
  });
});
