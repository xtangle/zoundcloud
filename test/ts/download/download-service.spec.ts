import {of, throwError, timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {clock, restore, SinonStub, stub, useFakeTimers} from 'sinon';
import {IPlaylistDownloadResult, ITrackDownloadResult, IUserDownloadResult} from 'src/ts/download/download-result';
import {DownloadService} from 'src/ts/download/download-service';
import {PlaylistDownloadService} from 'src/ts/download/playlist-download-service';
import {IResourceInfo, ResourceType} from 'src/ts/download/resource/resource-info';
import {ResourceInfoService} from 'src/ts/download/resource/resource-info-service';
import {TrackDownloadService} from 'src/ts/download/track-download-service';
import {UserDownloadService} from 'src/ts/download/user-download-service';
import {matchesCause, matchesError} from 'test/ts/sinon-matchers';
import {configureChai, useRxTesting} from 'test/ts/test-initializers';

const expect = configureChai();

describe('download service', () => {
  const rx = useRxTesting();

  const fixture = DownloadService;
  const resourceInfoUrl = 'resource-info-url';
  const resourceInfo = {kind: ResourceType.Track} as IResourceInfo;

  const trackDownloadResult = {trackInfo: {}} as ITrackDownloadResult;
  const playlistDownloadResult = {playlistInfo: {}, tracks: [trackDownloadResult]} as IPlaylistDownloadResult;
  const userDownloadResult = {userInfo: {}, tracks: [trackDownloadResult]} as IUserDownloadResult;

  let stubGetResourceInfo$: SinonStub;
  let stubTrackDownload: SinonStub;
  let stubPlaylistDownload: SinonStub;
  let stubUserDownload$: SinonStub;

  beforeEach(() => {
    useFakeTimers();

    stubGetResourceInfo$ = stub(ResourceInfoService, 'getResourceInfo$');
    stubGetResourceInfo$.withArgs(resourceInfoUrl).returns(of(resourceInfo));

    stubTrackDownload = stub(TrackDownloadService, 'download');
    stubTrackDownload.returns(trackDownloadResult);

    stubPlaylistDownload = stub(PlaylistDownloadService, 'download');
    stubPlaylistDownload.returns(playlistDownloadResult);

    stubUserDownload$ = stub(UserDownloadService, 'download$');
    stubUserDownload$.returns(of(userDownloadResult));
  });

  afterEach(() => {
    restore();
  });

  describe('download from a resource', () => {
    context('downloading a track', () => {
      const trackDlInfo = {kind: ResourceType.Track};

      beforeEach(() => {
        stubGetResourceInfo$.withArgs(resourceInfoUrl).returns(of(trackDlInfo));
        stubTrackDownload.returns(trackDownloadResult);
      });

      it('should download track when download info is track type', () => {
        fixture.download$(resourceInfoUrl);

        expect(stubTrackDownload).to.have.been.calledOnceWithExactly(trackDlInfo);
        expect(stubPlaylistDownload).to.not.have.been.called;
        expect(stubUserDownload$).to.not.have.been.called;
      });

      it('should emit the track download result', () => {
        rx.subscribeTo(fixture.download$(resourceInfoUrl));

        expect(rx.next).to.have.been.calledOnceWithExactly(trackDownloadResult);
        expect(rx.complete).to.have.been.called;
      });
    });

    context('downloading a playlist', () => {
      const playlistDlInfo = {kind: ResourceType.Playlist};

      beforeEach(() => {
        stubGetResourceInfo$.withArgs(resourceInfoUrl).returns(of(playlistDlInfo));
        stubPlaylistDownload.returns(playlistDownloadResult);
      });

      it('should download playlist when download info is playlist type', () => {
        fixture.download$(resourceInfoUrl);

        expect(stubPlaylistDownload).to.have.been.calledOnceWithExactly(playlistDlInfo);
        expect(stubTrackDownload).to.not.have.been.called;
        expect(stubUserDownload$).to.not.have.been.called;
      });

      it('should emit the playlist download result', () => {
        rx.subscribeTo(fixture.download$(resourceInfoUrl));

        expect(rx.next).to.have.been.calledOnceWithExactly(playlistDownloadResult);
        expect(rx.complete).to.have.been.called;
      });
    });

    context('downloading user tracks', () => {
      const userDlInfo = {kind: ResourceType.User};

      beforeEach(() => {
        stubGetResourceInfo$.withArgs(resourceInfoUrl).returns(of(userDlInfo));
        stubUserDownload$.returns(of(userDownloadResult));
      });

      it('should download user tracks when download info is user type', () => {
        fixture.download$(resourceInfoUrl);

        expect(stubUserDownload$).to.have.been.calledOnceWithExactly(userDlInfo);
        expect(stubTrackDownload).to.not.have.been.called;
        expect(stubPlaylistDownload).to.not.have.been.called;
      });

      it('should emit the the user download result', () => {
        rx.subscribeTo(fixture.download$(resourceInfoUrl));

        expect(rx.next).to.have.been.calledOnceWithExactly(userDownloadResult);
        expect(rx.complete).to.have.been.called;
      });

      it('should emit error when there is an error downloading user tracks', () => {
        const err = new Error('error downloading user tracks');
        stubUserDownload$.returns(throwError(err));
        rx.subscribeTo(fixture.download$(resourceInfoUrl));

        expect(rx.error).to.have.been.calledWithMatch(matchesError(err));
        expect(rx.next).to.not.have.been.called;
      });
    });

    context('fetching resource info', () => {
      it('should download if fetching resource info takes less than 1 minute', () => {
        stubGetResourceInfo$.withArgs(resourceInfoUrl).returns(timer(59999).pipe(mapTo(resourceInfo)));
        rx.subscribeTo(fixture.download$(resourceInfoUrl));
        clock.tick(60000);

        expect(stubTrackDownload).to.have.been.called;
        expect(rx.next).to.have.been.called;
      });

      it('should emit error if fetching resource info takes 1 minute or more', () => {
        stubGetResourceInfo$.withArgs(resourceInfoUrl).returns(timer(60000).pipe(mapTo(resourceInfo)));
        rx.subscribeTo(fixture.download$(resourceInfoUrl));
        clock.tick(60001);

        expect(stubTrackDownload).to.not.have.been.called;
        expect(rx.next).to.not.have.been.called;
        expect(rx.error).to.have.been.called;
      });

      it('should emit error if there is an error fetching resource info', () => {
        const cause = new Error('error getting resource info');
        stubGetResourceInfo$.withArgs(resourceInfoUrl).returns(throwError(cause));
        rx.subscribeTo(fixture.download$(resourceInfoUrl));

        expect(stubTrackDownload).to.not.have.been.called;
        expect(rx.next).to.not.have.been.called;
        expect(rx.error).to.have.been.calledWithMatch(matchesCause(cause));
      });
    });

    it('should not download if resource info is of unknown kind', () => {
      stubGetResourceInfo$.withArgs(resourceInfoUrl).returns(of({kind: 'foo'}));
      rx.subscribeTo(fixture.download$(resourceInfoUrl));

      const expectedErr = `Cannot download, unsupported resource type 'foo' gotten from ${resourceInfoUrl}`;
      expect(rx.error).to.have.been.calledWithMatch(matchesError(expectedErr));
      expect(rx.next).to.not.have.been.called;
    });
  });
});
