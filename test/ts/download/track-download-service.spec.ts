import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {TrackDownloadService} from '@src/download/track-download-service';
import {FilenameService} from '@src/util/filename-service';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {noop, tick} from '@test/test-utils';
import * as path from 'path';
import {Subscription} from 'rxjs/Subscription';
import {match, SinonMatcher, SinonSpy, SinonStub, spy, stub} from 'sinon';

const expect = useSinonChai();

describe('track download service', () => {
  const fixture = TrackDownloadService;
  const sinonChrome = useSinonChrome();

  describe('downloading a track', () => {

    context('finding which download method to use', () => {
      describe('using the download url', () => {
        const trackInfo = createTrackInfo();

        beforeEach(() => {
          fixture.downloadTrack(trackInfo);
        });

        it('should download using the download url if possible', () => {
          const expectedUrl = `${trackInfo.download_url}?client_id=${CLIENT_ID}`;
          expect(sinonChrome.downloads.download).calledOnce.calledWithMatch(match.has('url', expectedUrl));
        });

        it('should set the file extension to the original format', () => {
          expect(sinonChrome.downloads.download).calledOnce
            .calledWithMatch(fileExtensionMatching(trackInfo.original_format));
        });
      });

      describe('using the stream url', () => {
        const trackInfo = createTrackInfo(false);

        beforeEach(() => {
          fixture.downloadTrack(trackInfo);
        });

        it('should download using the stream url if download url cannot be used', () => {
          const expectedUrl = `${trackInfo.stream_url}?client_id=${CLIENT_ID}`;
          expect(sinonChrome.downloads.download).calledOnce.calledWithMatch(match.has('url', expectedUrl));
        });

        it('should set the file extension to mp3', () => {
          expect(sinonChrome.downloads.download).calledOnce.calledWithMatch(fileExtensionMatching('mp3'));
        });
      });

      describe('using the i1 api stream url', () => {
        const trackInfo = createTrackInfo(false, false);

        beforeEach(() => {
          fixture.downloadTrack(trackInfo);
        });

        it('should download using the i1 api stream url if both download url and stream url cannot be used', () => {
          const expectedUrl = `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`;
          expect(sinonChrome.downloads.download).calledOnce.calledWithMatch(match.has('url', expectedUrl));
        });

        it('should set the file extension to mp3', () => {
          expect(sinonChrome.downloads.download).calledOnce.calledWithMatch(fileExtensionMatching('mp3'));
        });
      });

      function fileExtensionMatching(extension: string): SinonMatcher {
        return match.has('filename', match((filename: string) => filename.endsWith(`.${extension}`)));
      }
    });

    context('download properties', () => {
      const trackInfo = createTrackInfo();
      const trackTitleNoSpecialChars = 'track-title-with-no-special-chars';
      const expectedFilename = `${trackTitleNoSpecialChars}.${trackInfo.original_format}`;
      let stubRemoveSpecialCharacters: SinonStub;

      beforeEach(() => {
        stubRemoveSpecialCharacters = stub(FilenameService, 'removeSpecialCharacters');
        stubRemoveSpecialCharacters.withArgs(trackInfo.title).returns(trackTitleNoSpecialChars);
        stubRemoveSpecialCharacters.callThrough();
      });

      afterEach(() => {
        stubRemoveSpecialCharacters.restore();
      });

      it('should not ask the user where to download', () => {
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).calledOnce.calledWithMatch(match.has('saveAs', false));
      });

      it('should use the track title with special characters trimmed as the file name', () => {
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).calledOnce
          .calledWithMatch(match.has('filename', expectedFilename));
      });

      it('should download to the specified download location if provided', () => {
        const downloadLocation = 'parentDir';
        fixture.downloadTrack(trackInfo, downloadLocation);
        expect(sinonChrome.downloads.download).calledOnce
          .calledWithMatch(match.has('filename', path.join(downloadLocation, expectedFilename)));
      });
    });

    context('the returned observable', () => {
      let subscription: Subscription;
      const callback: SinonSpy = spy();

      beforeEach(() => {
        sinonChrome.downloads.download.resetBehavior();
        callback.resetHistory();
      });

      afterEach(() => {
        subscription.unsubscribe();
      });

      it('should emit the download id and complete if the download started successfully', async () => {
        const downloadId = 123;
        sinonChrome.downloads.download.callsArgWithAsync(1, downloadId);

        subscription = fixture.downloadTrack(createTrackInfo()).subscribe(callback);
        expect(callback).to.not.have.been.called;
        await tick();

        expect(callback).to.have.been.calledOnce.calledWithExactly(downloadId);
        expect(subscription.closed).to.be.true;
      });

      it('should emit an error with the lastError message if the download didn\'t start successfully', async () => {
        const errorMsg = 'error message';
        sinonChrome.downloads.download.callsArgWithAsync(1, undefined);
        sinonChrome.runtime.lastError = {message: errorMsg};

        subscription = fixture.downloadTrack(createTrackInfo()).subscribe(noop, callback);
        expect(callback).to.not.have.been.called;
        await tick();

        expect(callback).to.have.been.calledOnce.calledWithExactly(errorMsg);
        expect(subscription.closed).to.be.true;
      });
    });

    function createTrackInfo(downloadable: boolean = true,
                             hasStreamUrl: boolean = true): ITrackInfo {
      return {
        download_url: 'https://api.soundcloud.com/tracks/208094428/download',
        downloadable,
        id: 123,
        original_format: 'wav',
        stream_url: hasStreamUrl ? 'https://api.soundcloud.com/tracks/208094428/stream' : undefined,
        title: 'song-title'
      };
    }
  });

});
