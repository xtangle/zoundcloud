import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackInfo, ResourceType} from '@src/download/resource/resource-info';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {TrackDownloadInfoFactory} from '@src/download/track-download-info-factory';
import {TrackDownloadService} from '@src/download/track-download-service';
import {matchesCause, matchesError} from '@test/sinon-matchers';
import {configureChai, useRxTesting, useSinonChrome} from '@test/test-initializers';
import {of, throwError, timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {clock, match, restore, SinonSpy, SinonStub, spy, stub, useFakeTimers} from 'sinon';
import DownloadOptions = chrome.downloads.DownloadOptions;

const expect = configureChai();

describe(`track download service`, () => {
  const sinonChrome = useSinonChrome();
  const rx = useRxTesting();

  const fixture = TrackDownloadService;
  const trackInfo = {title: 'some-song'} as ITrackInfo;
  const downloadLocation = 'download-location';
  const inputDownloadInfo = {trackInfo} as ITrackDownloadInfo;
  const downloadInfo = {
    downloadOptions: {url: 'download-options-url'} as DownloadOptions,
    trackInfo
  } as ITrackDownloadInfo;

  let stubCreateDownloadInfo$: SinonStub;
  let stubAddMetadata$: SinonStub;
  let stubRevokeObjectURL: SinonSpy;

  beforeEach(() => {
    useFakeTimers();

    stubCreateDownloadInfo$ = stub(TrackDownloadInfoFactory, 'create$');
    stubCreateDownloadInfo$.withArgs(trackInfo, downloadLocation).returns(of(inputDownloadInfo));

    stubAddMetadata$ = stub(MetadataAdapter, 'addMetadata$');
    stubAddMetadata$.withArgs(inputDownloadInfo).returns(of(downloadInfo));

    stubRevokeObjectURL = spy(URL, 'revokeObjectURL');
    sinonChrome.downloads.download.yields(123);
  });

  afterEach(() => {
    restore();
  });

  describe(`downloading a track`, () => {
    it('should download the track using the download options', () => {
      fixture.download(trackInfo, downloadLocation);

      expect(sinonChrome.downloads.download).to.have.been.calledOnce
        .calledWithExactly(downloadInfo.downloadOptions, match.any);
    });

    it('should revoke the download url after starting the download', () => {
      fixture.download(trackInfo, downloadLocation);

      expect(stubRevokeObjectURL).to.have.been.calledOnce
        .calledWithExactly(downloadInfo.downloadOptions.url)
        .calledAfter(sinonChrome.downloads.download);
    });

    it('should download with a default download location of empty (current directory)', () => {
      stubCreateDownloadInfo$.withArgs(trackInfo, '').returns(of(inputDownloadInfo));
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

      expect(rx.next).to.have.been.calledOnceWithExactly({downloadId: 123, downloadInfo});
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
        .returns(timer(900000).pipe(mapTo(inputDownloadInfo)));
      stubAddMetadata$.withArgs(inputDownloadInfo)
        .returns(timer(899999).pipe(mapTo(downloadInfo)));
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);
      clock.tick(1800000);

      expect(sinonChrome.downloads.download).to.have.been.called;
      expect(rx.next).to.have.been.calledOnce;
      expect(rx.complete).to.have.been.called;
    });

    it('should not download and emit error if fetching download method takes 30 minutes or more', () => {
      stubCreateDownloadInfo$.withArgs(trackInfo, downloadLocation)
        .returns(timer(900000).pipe(mapTo(inputDownloadInfo)));
      stubAddMetadata$.withArgs(inputDownloadInfo)
        .returns(timer(900000).pipe(mapTo(downloadInfo)));
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);
      clock.tick(1800000);

      expect(sinonChrome.downloads.download).to.not.have.been.called;
      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.called;
    });
  });
});
