/*
import {IResourceInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {DownloadService} from '@src/download/download-service';
import {PlaylistDownloadService} from '@src/download/playlist-download-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {UserDownloadService} from '@src/download/user-download-service';
import {useFakeTimer, useRxTesting, useSinonChai} from '@test/test-initializers';
import {of, throwError, timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('download service', () => {
  const rx = useRxTesting();
  const cw = useFakeTimer();

  const fixture = DownloadService;
  const downloadInfoUrl = 'download-info-url';
  const downloadInfo = {kind: 'track'} as IResourceInfo;

  describe('downloading from a resource', () => {
    let stubGetDownloadInfo$: SinonStub;
    let stubTrackDownload$: SinonStub;
    let stubPlaylistDownload$: SinonStub;
    let stubUserDownload$: SinonStub;

    beforeEach(() => {
      stubGetDownloadInfo$ = stub(DownloadInfoService, 'getResourceInfo$');
      stubGetDownloadInfo$.withArgs(downloadInfoUrl).returns(of(downloadInfo));

      stubTrackDownload$ = stub(TrackDownloadService, 'download$');
      stubTrackDownload$.returns(of(0));

      stubPlaylistDownload$ = stub(PlaylistDownloadService, 'download$');
      stubPlaylistDownload$.returns(of(0));

      stubUserDownload$ = stub(UserDownloadService, 'download$');
      stubUserDownload$.returns(of(0));
    });

    afterEach(() => {
      stubGetDownloadInfo$.restore();
      stubTrackDownload$.restore();
      stubPlaylistDownload$.restore();
      stubUserDownload$.restore();
    });

    context('downloading a track', () => {
      const trackDlInfo = {kind: 'track'};

      beforeEach(() => {
        stubGetDownloadInfo$.withArgs(downloadInfoUrl).returns(of(trackDlInfo));
        stubTrackDownload$.returns(of(1));
      });

      it('should download track when download info is track type', () => {
        fixture.download$(downloadInfoUrl);

        expect(stubTrackDownload$).to.have.been.calledOnce.calledWithExactly(trackDlInfo);
        expect(stubPlaylistDownload$).to.not.have.been.called;
        expect(stubUserDownload$).to.not.have.been.called;
      });

      it('should emit download id', () => {
        rx.subscribeTo(fixture.download$(downloadInfoUrl));

        expect(rx.next).to.have.been.calledOnce.calledWithExactly(1);
        expect(rx.complete).to.have.been.called;
      });

      it('should emit error when there is error downloading track', () => {
        stubTrackDownload$.returns(throwError('error downloading track'));
        rx.subscribeTo(fixture.download$(downloadInfoUrl));

        expect(rx.error).to.have.been.calledWith('error downloading track');
        expect(rx.next).to.not.have.been.called;
      });
    });

    context('downloading a playlist', () => {
      const playlistDlInfo = {kind: 'playlist'};

      beforeEach(() => {
        stubGetDownloadInfo$.withArgs(downloadInfoUrl).returns(of(playlistDlInfo));
        stubPlaylistDownload$.returns(of(2, 3));
      });

      it('should download playlist when download info is playlist type', () => {
        fixture.download$(downloadInfoUrl);

        expect(stubPlaylistDownload$).to.have.been.calledOnce.calledWithExactly(playlistDlInfo);
        expect(stubTrackDownload$).to.not.have.been.called;
        expect(stubUserDownload$).to.not.have.been.called;
      });

      it('should emit download ids', () => {
        rx.subscribeTo(fixture.download$(downloadInfoUrl));

        expect(rx.next).to.have.been.calledTwice;
        expect(rx.next.getCall(0)).to.have.been.calledWithExactly(2);
        expect(rx.next.getCall(1)).to.have.been.calledWithExactly(3);
        expect(rx.complete).to.have.been.called;
      });

      it('should emit error when there is error downloading playlist', () => {
        stubPlaylistDownload$.returns(throwError('error downloading playlist'));
        rx.subscribeTo(fixture.download$(downloadInfoUrl));

        expect(rx.error).to.have.been.calledWith('error downloading playlist');
        expect(rx.next).to.not.have.been.called;
      });
    });

    context('downloading user tracks', () => {
      const userDlInfo = {kind: 'user'};

      beforeEach(() => {
        stubGetDownloadInfo$.withArgs(downloadInfoUrl).returns(of(userDlInfo));
        stubUserDownload$.returns(of(4, 5));
      });

      it('should download user tracks when download info is user type', () => {
        fixture.download$(downloadInfoUrl);

        expect(stubUserDownload$).to.have.been.calledOnce.calledWithExactly(userDlInfo);
        expect(stubTrackDownload$).to.not.have.been.called;
        expect(stubPlaylistDownload$).to.not.have.been.called;
      });

      it('should emit download ids', () => {
        rx.subscribeTo(fixture.download$(downloadInfoUrl));

        expect(rx.next).to.have.been.calledTwice;
        expect(rx.next.getCall(0)).to.have.been.calledWithExactly(4);
        expect(rx.next.getCall(1)).to.have.been.calledWithExactly(5);
        expect(rx.complete).to.have.been.called;
      });

      it('should emit error when there is error downloading user tracks', () => {
        stubUserDownload$.returns(throwError('error downloading user tracks'));
        rx.subscribeTo(fixture.download$(downloadInfoUrl));

        expect(rx.error).to.have.been.calledWith('error downloading user tracks');
        expect(rx.next).to.not.have.been.called;
      });
    });

    context('fetching download info', () => {
      it('should download if fetching download info takes less than 30 seconds', () => {
        stubGetDownloadInfo$.withArgs(downloadInfoUrl).returns(timer(29999).pipe(mapTo(downloadInfo)));
        rx.subscribeTo(fixture.download$(downloadInfoUrl));
        cw.clock.tick(30000);

        expect(stubTrackDownload$).to.have.been.called;
        expect(rx.next).to.have.been.called;
      });

      it('should emit error if fetching download info takes 30 seconds or more', () => {
        stubGetDownloadInfo$.withArgs(downloadInfoUrl).returns(timer(30000).pipe(mapTo(downloadInfo)));
        rx.subscribeTo(fixture.download$(downloadInfoUrl));
        cw.clock.tick(30001);

        expect(stubTrackDownload$).to.not.have.been.called;
        expect(rx.next).to.not.have.been.called;
        expect(rx.error).to.have.been.called;
      });

      it('should emit error if there is an error fetching download info', () => {
        stubGetDownloadInfo$.withArgs(downloadInfoUrl).returns(throwError('error getting download info'));
        rx.subscribeTo(fixture.download$(downloadInfoUrl));

        expect(stubTrackDownload$).to.not.have.been.called;
        expect(rx.next).to.not.have.been.called;
        expect(rx.error).to.have.been.calledWithExactly('error getting download info');
      });
    });

    it('should not download if download info is of unknown type', () => {
      stubGetDownloadInfo$.withArgs(downloadInfoUrl).returns(of({kind: 'foo'}));
      rx.subscribeTo(fixture.download$(downloadInfoUrl));

      expect(rx.error).to.have.been.called;
      expect(rx.next).to.not.have.been.called;
    });
  });
});
*/
