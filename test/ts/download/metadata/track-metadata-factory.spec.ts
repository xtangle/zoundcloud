import {ITrackInfo} from '@src/download/download-info';
import {TrackMetadataFactory} from '@src/download/metadata/track-metadata-factory';
import {expect} from 'chai';

describe('track metadata factory', () => {
  const fixture = TrackMetadataFactory;

  describe('creating from track info', () => {
    context('when the song artist can be parsed from the song title', () => {
      it('should parse the artist and title from the track title ' +
        'and convert all other fields correctly', () => {
        const trackInfo = createTrackInfo({
          title: 'a track-artist - a song-title - separated by a dash and spaces'
        });
        const actual = fixture.create(trackInfo);
        const expected = createExpectedMetadata({
          albumArtist: 'a track-artist',
          title: 'a song-title - separated by a dash and spaces'
        });
        expect(actual).to.deep.include(expected);
      });
    });

    context('when the song artist cannot be parsed from the song title', () => {
      it('should convert all fields correctly', () => {
        const trackInfo = createTrackInfo();
        const actual = fixture.create(trackInfo);
        const expected = createExpectedMetadata();
        expect(actual).to.be.deep.equal(expected);
      });
    });

    function createTrackInfo(overrides: object = {}): ITrackInfo {
      return {
        artwork_url: 'artwork-url',
        bpm: 123,
        description: 'song-description',
        download_url: 'download-url',
        downloadable: true,
        duration: 234,
        genre: 'song-genre',
        id: 345,
        kind: 'track',
        original_format: 'orig-format',
        permalink_url: 'permalink-url',
        release_day: 1,
        release_month: 2,
        release_year: 1991,
        stream_url: 'stream-url',
        title: 'a-song-title',
        user: {
          kind: 'user',
          permalink_url: 'user-permalink-url',
          username: 'user-username'
        },
        ...overrides
      };
    }

    function createExpectedMetadata(overrides: object = {}) {
      const trackInfo = createTrackInfo();
      return {
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
        title: trackInfo.title,
        ...overrides
      };
    }
  });
});
