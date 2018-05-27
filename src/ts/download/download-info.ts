export interface IDownloadInfo {
  kind: string;
  permalink_url: string;
}

export interface IUserInfo extends IDownloadInfo {
  username: string;
}

export interface ITrackInfo extends IDownloadInfo {
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

export interface IPlaylistInfo extends IDownloadInfo {
  title: string;
  tracks: ITrackInfo[];
  user: IUserInfo;
}
