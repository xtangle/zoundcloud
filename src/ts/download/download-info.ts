export interface IUserInfo {
  permalink_url?: string;
  username: string;
}

export interface ITrackInfo {
  artwork_url?: string;
  bpm?: number;
  description?: string;
  download_url?: string;
  downloadable: boolean;
  duration?: number;
  genre?: string;
  id: number;
  original_format: string;
  permalink_url?: string;
  release_day?: number;
  release_month?: number;
  release_year?: number;
  stream_url?: string;
  title: string;
  user: IUserInfo;
}

export interface IPlaylistInfo {
  title: string;
  tracks: ITrackInfo[];
  user: IUserInfo;
}
