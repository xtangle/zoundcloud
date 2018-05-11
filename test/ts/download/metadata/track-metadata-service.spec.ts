import {TrackMetadataService} from '@src/download/metadata/track-metadata-service';
import {expect} from 'chai';

describe('track metadata service', () => {
  const fixture = TrackMetadataService;

  describe('converting track info to track metadata', () => {

    context('when the song artist can be parsed from the song title', () => {
      const titleWithArtist = 'track-artist - a song title - with some dashes';
      const trackInfo = createTrackInfo(titleWithArtist);
      const actual = fixture.toTrackMetadata(trackInfo);

      it('should use the parsed artist', () => {
        expect(actual.albumArtist).to.be.equal('track-artist');
      });

      it('should use the parsed title', () => {
        expect(actual.title).to.be.equal('a song title - with some dashes');
      });

      it('should convert all other fields correctly', () => {
        expect(actual).to.deep.include({
          artist_url: trackInfo.user.permalink_url,
          audio_source_url: trackInfo.permalink_url,
          bpm: trackInfo.bpm,
          cover_url: trackInfo.artwork_url,
          description: trackInfo.description,
          duration: trackInfo.duration,
          genres: [trackInfo.genre],
          release_day: trackInfo.release_day,
          release_month: trackInfo.release_month,
          release_year: trackInfo.release_year
        });
      });
    });

    context('when the song artist cannot be parsed from the song title', () => {
      const trackInfo = createTrackInfo();
      const actual = fixture.toTrackMetadata(trackInfo);

      it('should convert all fields correctly', () => {
        expect(actual).to.be.deep.equal({
          albumArtist: trackInfo.user.username,
          artist_url: trackInfo.user.permalink_url,
          audio_source_url: trackInfo.permalink_url,
          bpm: trackInfo.bpm,
          cover_url: trackInfo.artwork_url,
          description: trackInfo.description,
          duration: trackInfo.duration,
          genres: [trackInfo.genre],
          release_day: trackInfo.release_day,
          release_month: trackInfo.release_month,
          release_year: trackInfo.release_year,
          title: trackInfo.title
        });
      });
    });

    function createTrackInfo(title: string = 'a-song-title') {
      return {
        artwork_url: 'artwork-url',
        bpm: 123,
        description: 'song-description',
        download_url: 'download-url',
        downloadable: true,
        duration: 234,
        genre: 'song-genre',
        id: 345,
        original_format: 'orig-format',
        permalink_url: 'permalink-url',
        release_day: 1,
        release_month: 2,
        release_year: 1991,
        stream_url: 'stream-url',
        title,
        user: {
          permalink_url: 'user-permalink-url',
          username: 'user-username'
        }
      };
    }
  });
});
