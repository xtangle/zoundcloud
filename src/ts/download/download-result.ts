import {Observable} from 'rxjs';
import {IPlaylistInfo, ITrackInfo, IUserInfo, ResourceType} from 'src/ts/download/resource/resource-info';
import {ITrackDownloadInfo} from 'src/ts/download/track-download-info';

export interface IDownloadResult {
  kind: ResourceType;
}

export interface ITrackDownloadMetadata {
  downloadId: number;
  downloadInfo: ITrackDownloadInfo;
}

export interface ITrackDownloadResult extends IDownloadResult {
  trackInfo: ITrackInfo;
  metadata$: Observable<ITrackDownloadMetadata>;
}

export interface IPlaylistDownloadResult extends IDownloadResult {
  playlistInfo: IPlaylistInfo;
  tracks: ITrackDownloadResult[];
}

export interface IUserDownloadResult extends IDownloadResult {
  userInfo: IUserInfo;
  tracks: ITrackDownloadResult[];
}
