import {IPlaylistInfo, ITrackInfo, IUserInfo} from '@src/download/download-info';
import {PlaylistDownloadService} from '@src/download/playlist-download-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import {of, throwError} from 'rxjs';
import {match, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('playlist download service', () => {
  const rx = useRxTesting();
  const fixture = PlaylistDownloadService;

  const trackOneInfo: ITrackInfo = {title: 'foo'} as ITrackInfo;
  const trackTwoInfo: ITrackInfo = {title: 'bar'} as ITrackInfo;
  const playlistInfo: IPlaylistInfo = {
    kind: 'playlist',
    permalink_url: 'permalinkUrl',
    title: 'some*playlist?with>special\\characters',
    tracks: [trackOneInfo, trackTwoInfo],
    user: {
      username: 'some<username|with?special/characters'
    } as IUserInfo
  };

  describe('downloading a playlist', () => {
    let stubDownloadTrack$: SinonStub;

    beforeEach(() => {
      stubDownloadTrack$ = stub(TrackDownloadService, 'download$');
      stubDownloadTrack$.withArgs(trackOneInfo, match.any).returns(of(1));
      stubDownloadTrack$.withArgs(trackTwoInfo, match.any).returns(of(2));
    });

    afterEach(() => {
      stubDownloadTrack$.restore();
    });

    it('should download each track in playlist', () => {
      fixture.download$(playlistInfo);

      expect(stubDownloadTrack$).to.have.been.calledTwice;
      expect(stubDownloadTrack$.getCall(0).args[0]).to.be.equal(trackOneInfo);
      expect(stubDownloadTrack$.getCall(1).args[0]).to.be.equal(trackTwoInfo);
    });

    it('should download to the correct download location', () => {
      const expectedDlLocation = 'some_username_with_special_characters - some_playlist_with_special_characters';
      fixture.download$(playlistInfo);

      expect(stubDownloadTrack$).to.have.been.calledTwice;
      stubDownloadTrack$.getCalls().forEach((spyCall) => expect(spyCall.args[1]).to.be.equal(expectedDlLocation));
    });

    it('should return stream of download ids and complete once all tracks have been downloaded', () => {
      rx.subscribeTo(fixture.download$(playlistInfo));

      expect(rx.next).to.have.been.calledTwice;
      expect(rx.next.getCall(0)).to.have.been.calledWithExactly(1);
      expect(rx.next.getCall(1)).to.have.been.calledWithExactly(2);
      expect(rx.complete).to.have.been.called;
    });

    it('should log error and continue downloading other tracks if there is an error downloading a track', () => {
      stubDownloadTrack$.withArgs(trackOneInfo, match.any).returns(throwError('error downloading track one'));
      rx.subscribeTo(fixture.download$(playlistInfo));

      expect(rx.error).to.not.have.been.called;
      expect(rx.next).to.have.been.calledOnce.calledWithExactly(2);
      expect(rx.complete).to.have.been.called;
    });
  });
});
