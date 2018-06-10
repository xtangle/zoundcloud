import {IPlaylistInfo, ITrackInfo, IUserInfo, ResourceType} from '@src/download/resource-info';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {Observable} from 'rxjs';

export interface IDownloadResult {
  kind: ResourceType;
}

export interface ITrackDownloadMetadata {
  downloadId: number;
  downloadInfo: ITrackDownloadInfo;
}

export interface ITrackDownloadResult extends IDownloadResult {
  trackInfo: ITrackInfo;
  metadata: Observable<ITrackDownloadMetadata>;
}

export interface IPlaylistDownloadResult extends IDownloadResult {
  playlistInfo: IPlaylistInfo;
  tracks: ITrackDownloadResult[];
}

export interface IUserDownloadResult extends IDownloadResult {
  userInfo: IUserInfo;
  tracks: ITrackDownloadResult[];
}
