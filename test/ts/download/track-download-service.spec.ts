/*
import {ITrackInfo} from '@src/download/download-info';
import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackDownloadMethod} from '@src/download/track-download-method';
import {TrackDownloadInfoService} from '@src/download/track-download-method-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {useFakeTimer, useRxTesting, useSinonChai, useSinonChrome} from '@test/test-initializers';
import * as path from 'path';
import {of, throwError, timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {match, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe(`track download service`, () => {
  const sinonChrome = useSinonChrome();
  const cw = useFakeTimer();
  const rx = useRxTesting();
  const fixture = TrackDownloadService;

  describe(`downloading a track`, () => {
    const trackInfo = {
      downloadable: false,
      id: 123,
      original_format: 'wav',
      title: 'song/title?with\\special>characters',
      user: {username: 'foo'}
    } as ITrackInfo;

    const downloadMethod = {
      fileExtension: 'mp3',
      trackInfo,
      url: 'download-method-url'
    } as ITrackDownloadMethod;

    let stubToDownloadMethod$: SinonStub;
    let stubAddMetadata$: SinonStub;

    beforeEach(() => {
      stubToDownloadMethod$ = stub(TrackDownloadInfoService, 'toDownloadMethod$');
      stubToDownloadMethod$.withArgs(trackInfo).returns(of(downloadMethod));

      stubAddMetadata$ = stub(MetadataAdapter, 'addMetadata$');
      stubAddMetadata$.withArgs(downloadMethod, match.any).callsFake((_, downloadOptions) => of(downloadOptions));

      sinonChrome.downloads.download.yields(123);
    });

    afterEach(() => {
      stubToDownloadMethod$.restore();
      stubAddMetadata$.restore();
    });

    it(`should use the download url in the download method`, () => {
      fixture.download$(trackInfo);
      expect(sinonChrome.downloads.download).to.have.been.calledOnce
        .calledWithMatch(match.has('url', downloadMethod.url));
    });

    it(`should not ask the user where to download`, () => {
      fixture.download$(trackInfo);
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
    });

    it('should emit the download id if track has started downloading', () => {
      rx.subscribeTo(fixture.download$(trackInfo));

      expect(sinonChrome.downloads.download).to.have.been.calledOnce;
      expect(rx.next).to.have.been.calledOnce.calledWithExactly(123);
      expect(rx.complete).to.have.been.called;
    });

    it('should download if fetching download method takes less than 5 minutes', () => {
      stubToDownloadMethod$.withArgs(trackInfo).returns(timer(299999).pipe(mapTo(downloadMethod)));
      rx.subscribeTo(fixture.download$(trackInfo));
      cw.clock.tick(300000);

      expect(sinonChrome.downloads.download).to.have.been.calledOnce;
    });

    it('should not download and emit error if fetching download method takes 5 minutes or more', () => {
      stubToDownloadMethod$.withArgs(trackInfo).returns(timer(300000).pipe(mapTo(downloadMethod)));
      rx.subscribeTo(fixture.download$(trackInfo));
      cw.clock.tick(300001);

      expect(sinonChrome.downloads.download).to.not.have.been.called;
      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.called;
    });

    it('should not download and emit error message if there is an error fetching the download method', () => {
      stubToDownloadMethod$.withArgs(trackInfo).returns(throwError('cannot get download method'));
      rx.subscribeTo(fixture.download$(trackInfo));

      expect(sinonChrome.downloads.download).to.not.have.been.called;
      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.called;
    });

    it('should emit an error with the lastError message if the download did not start successfully', () => {
      sinonChrome.runtime.lastError = {message: 'error message'};
      sinonChrome.downloads.download.yields(undefined);
      rx.subscribeTo(fixture.download$(trackInfo));

      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.calledWithExactly('error message');
    });
  });
});
*/
