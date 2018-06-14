import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {ITrackInfo} from '@src/download/resource/resource-info';

export const TrackMetadataFactory = {
  create(trackInfo: ITrackInfo): ITrackMetadata {
    const titleParts = trackInfo.title.split(' - ');
    return {
      albumArtist: (titleParts.length > 1) ? titleParts[0] : trackInfo.user.username,
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
      title: (titleParts.length > 1) ? titleParts.slice(1).join(' - ') : trackInfo.title
    };
  }
};
