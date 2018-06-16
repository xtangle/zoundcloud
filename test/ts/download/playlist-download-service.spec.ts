import {ITrackDownloadResult} from '@src/download/download-result';
import {PlaylistDownloadService} from '@src/download/playlist-download-service';
import {IPlaylistInfo, ITrackInfo, IUserInfo, ResourceType} from '@src/download/resource/resource-info';
import {TrackDownloadService} from '@src/download/track-download-service';
import {useSinonChai} from '@test/test-initializers';
import {match, restore, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('playlist download service', () => {

  const fixture = PlaylistDownloadService;
  const trackOneInfo: ITrackInfo = {title: 'foo'} as ITrackInfo;
  const trackTwoInfo: ITrackInfo = {title: 'bar'} as ITrackInfo;
  const playlistInfo: IPlaylistInfo = {
    kind: ResourceType.Playlist,
    permalink_url: 'permalinkUrl',
    title: 'some*playlist?with>special\\characters',
    tracks: [trackOneInfo, trackTwoInfo],
    user: {
      username: 'some<username|with?special/characters'
    } as IUserInfo
  };
  const trackOneDlResult = {trackInfo: trackOneInfo} as ITrackDownloadResult;
  const trackTwoDlResult = {trackInfo: trackTwoInfo} as ITrackDownloadResult;

  let stubDownloadTrack: SinonStub;

  beforeEach(() => {
    stubDownloadTrack = stub(TrackDownloadService, 'download');
    stubDownloadTrack.withArgs(trackOneInfo, match.any).returns(trackOneDlResult);
    stubDownloadTrack.withArgs(trackTwoInfo, match.any).returns(trackTwoDlResult);
  });

  afterEach(() => {
    restore();
  });

  describe('downloading a playlist', () => {
    it('should download each track in the playlist', () => {
      fixture.download(playlistInfo);

      expect(stubDownloadTrack).to.have.been.calledTwice;
      expect(stubDownloadTrack.getCall(0).args[0]).to.be.equal(trackOneInfo);
      expect(stubDownloadTrack.getCall(1).args[0]).to.be.equal(trackTwoInfo);
    });

    it('should download to the correct download location', () => {
      const expectedDlLocation = 'some_username_with_special_characters - some_playlist_with_special_characters';
      fixture.download(playlistInfo);

      expect(stubDownloadTrack).to.have.been.calledTwice;
      stubDownloadTrack.getCalls()
        .forEach((spyCall) => expect(spyCall.args[1]).to.be.equal(expectedDlLocation));
    });

    it('should return a playlist download result', () => {
      const actual = fixture.download(playlistInfo);

      expect(actual).to.be.deep.equal({
        kind: ResourceType.Playlist,
        playlistInfo,
        tracks: [trackOneDlResult, trackTwoDlResult]
      });
    });
  });
});
