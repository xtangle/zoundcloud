import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackInfo, ResourceType} from '@src/download/resource-info';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {TrackDownloadInfoService} from '@src/download/track-download-info-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {useFakeTimer, useRxTesting, useSinonChai, useSinonChrome} from '@test/test-initializers';
import {matchesError} from '@test/test-utils';
import {of, throwError, timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {match, SinonSpy, SinonStub, spy, stub} from 'sinon';
import DownloadOptions = chrome.downloads.DownloadOptions;

const expect = useSinonChai();

describe(`track download service`, () => {
  const sinonChrome = useSinonChrome();
  const cw = useFakeTimer();
  const rx = useRxTesting();
  const fixture = TrackDownloadService;

  describe(`downloading a track`, () => {
    const trackInfo = {title: 'some-song'} as ITrackInfo;
    const downloadLocation = 'download-location';
    const inputDownloadInfo = {trackInfo} as ITrackDownloadInfo;
    const downloadInfo = {
      downloadOptions: {url: 'download-options-url'} as DownloadOptions,
      trackInfo
    } as ITrackDownloadInfo;

    let stubToDownloadInfo$: SinonStub;
    let stubAddMetadata$: SinonStub;
    let stubRevokeObjectURL: SinonSpy;

    beforeEach(() => {
      stubToDownloadInfo$ = stub(TrackDownloadInfoService, 'toDownloadInfo$');
      stubToDownloadInfo$.withArgs(trackInfo, downloadLocation).returns(of(inputDownloadInfo));

      stubAddMetadata$ = stub(MetadataAdapter, 'addMetadata$');
      stubAddMetadata$.withArgs(inputDownloadInfo).returns(of(downloadInfo));

      stubRevokeObjectURL = spy(URL, 'revokeObjectURL');
      sinonChrome.downloads.download.yields(123);
    });

    afterEach(() => {
      stubToDownloadInfo$.restore();
      stubAddMetadata$.restore();
      stubRevokeObjectURL.restore();
    });

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
      stubToDownloadInfo$.withArgs(trackInfo, '').returns(of(inputDownloadInfo));
      fixture.download(trackInfo);

      expect(stubToDownloadInfo$).to.have.been.calledOnce.calledWithExactly(trackInfo, '');
      expect(sinonChrome.downloads.download).to.have.been.called;
    });

    it('should return the download result with the correct kind and trackInfo', () => {
      const actual = fixture.download(trackInfo, downloadLocation);

      expect(actual.kind).to.be.equal(ResourceType.Track);
      expect(actual.trackInfo).to.be.equal(trackInfo);
    });

    it('should return an item in download metadata if download started successfully', () => {
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);

      expect(rx.next).to.have.been.calledOnce.calledWithExactly({downloadId: 123, downloadInfo});
      expect(rx.complete).to.have.been.called;
    });

    it('should return an error in download metadata if download info cannot be fetched', () => {
      const error = new Error('cannot fetch download info');
      stubToDownloadInfo$.withArgs(trackInfo, downloadLocation).returns(throwError(error));
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);

      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.calledOnce
        .calledWithMatch(matchesError(`Cannot download track: ${trackInfo.title}`, error));
    });

    it('should return an error in download metadata if there was error starting the download', () => {
      sinonChrome.runtime.lastError = {message: 'some error message'};
      sinonChrome.downloads.download.yields(undefined);
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);

      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.calledOnce.calledWithMatch(matchesError('some error message'));
    });

    it('should download if fetching download info or metadata takes less than 5 minutes', () => {
      stubToDownloadInfo$.withArgs(trackInfo, downloadLocation)
        .returns(timer(100000).pipe(mapTo(inputDownloadInfo)));
      stubAddMetadata$.withArgs(inputDownloadInfo)
        .returns(timer(199999).pipe(mapTo(downloadInfo)));
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);
      cw.clock.tick(300000);

      expect(sinonChrome.downloads.download).to.have.been.called;
      expect(rx.next).to.have.been.calledOnce;
      expect(rx.complete).to.have.been.called;
    });

    it('should not download and emit error if fetching download method takes 5 minutes or more', () => {
      stubToDownloadInfo$.withArgs(trackInfo, downloadLocation)
        .returns(timer(100000).pipe(mapTo(inputDownloadInfo)));
      stubAddMetadata$.withArgs(inputDownloadInfo)
        .returns(timer(200000).pipe(mapTo(downloadInfo)));
      rx.subscribeTo(fixture.download(trackInfo, downloadLocation).metadata$);
      cw.clock.tick(300001);

      expect(sinonChrome.downloads.download).to.not.have.been.called;
      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.called;
    });

    /* todo: these tests should belong in the track-download-info-service.spec

    it(`should use the download url in the download method`, () => {
      fixture.download(trackInfo);
      expect(sinonChrome.downloads.download).to.have.been.calledOnce
        .calledWithMatch(match.has('url', downloadMethod.url));
    });

    it(`should not ask the user where to download`, () => {
      fixture.download(trackInfo);
      expect(sinonChrome.downloads.download).to.have.been.calledOnce
        .calledWithMatch(match.has('saveAs', false));
    });

    it(`should not overwrite an existing file with the same filename`, () => {
      fixture.download$(trackInfo);
      expect(sinonChrome.downloads.download).to.have.been.calledOnce
        .calledWithMatch(match.has('conflictAction', 'uniquify'));
    });

    it(`should save with the correct filename when download location is not provided`, () => {
      fixture.download$(trackInfo);
      expect(sinonChrome.downloads.download).to.have.been.calledOnce
        .calledWithMatch(match.has('filename', 'song_title_with_special_characters.mp3'));
    });

    it(`should save with the correct filename and location when download location is provided`, () => {
      fixture.download$(trackInfo, 'parent|dir/with:special?characters');
      const expectedPath = path.join('parent_dir_with_special_characters', 'song_title_with_special_characters.mp3');
      expect(sinonChrome.downloads.download).to.have.been.calledOnce
        .calledWithMatch(match.has('filename', expectedPath));
    });*/
  });
});
