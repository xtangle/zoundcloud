export interface ITrackMetadata {
  albumArtist: string;
  artist_url: string;
  audio_source_url: string;
  bpm: number;
  cover_url: string;
  description: string;
  duration: number; // in ms
  genres: string[];
  release_day: number;
  release_month: number;
  release_year: number;
  title: string;
}
