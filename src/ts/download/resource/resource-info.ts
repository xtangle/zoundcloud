export enum ResourceType {
  Track = 'track',
  Playlist = 'playlist',
  User = 'user',
}

export interface IResourceInfo {
  kind: ResourceType;
  permalink_url: string;
}

export interface IUserInfo extends IResourceInfo {
  username: string;
}

export interface ITrackInfo extends IResourceInfo {
  artwork_url?: string;
  bpm?: number;
  description?: string;
  download_url?: string;
  downloadable: boolean;
  duration?: number;
  genre?: string;
  id: number;
  original_format: string;
  release_day?: number;
  release_month?: number;
  release_year?: number;
  stream_url?: string;
  title: string;
  user: IUserInfo;
}

export interface IPlaylistInfo extends IResourceInfo {
  title: string;
  tracks: ITrackInfo[];
  user: IUserInfo;
}
