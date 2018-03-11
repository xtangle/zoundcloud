export interface IUserInfo {
  username: string;
}

export interface ITrackInfo {
  downloadable: boolean;
  download_url?: string;
  id: number;
  stream_url?: string;
  title: string;
}

export interface IPlaylistInfo {
  title: string;
  tracks: ITrackInfo[];
  user: IUserInfo;
}
