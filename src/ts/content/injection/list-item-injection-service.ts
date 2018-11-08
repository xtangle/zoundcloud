import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ZC_DL_BUTTON_SMALL_CLASS} from 'src/ts/constants';
import {DownloadButtonFactory} from 'src/ts/content/injection/download-button-factory';
import {addToButtonGroup} from 'src/ts/content/injection/injection-commons';
import {InjectionSignalFactory} from 'src/ts/content/injection/injection-signal-factory';

export const ListItemInjectionService = {
  injectDownloadButtons(onUnload$: Observable<any>) {
    const selector = '.soundList__item, .searchList__item, .trackList__item, ' +
      '.systemPlaylistTrackList__item, .chartTracks__item';
    InjectionSignalFactory.create$(selector)
      .pipe(takeUntil(onUnload$))
      .subscribe(addToListItem.bind(null, onUnload$));
  },
};

function createDownloadButton(onUnload$: Observable<any>, downloadInfoUrl: string): JQuery<HTMLElement> {
  return DownloadButtonFactory.create(onUnload$, downloadInfoUrl)
    .addClass(['sc-button-small', ZC_DL_BUTTON_SMALL_CLASS]);
}

function addToListItem(onUnload$: Observable<any>, listItem: JQuery<HTMLElement>): void {
  const downloadInfoUrl = listItem
    .find('.soundTitle__title, .trackItem__trackTitle, .chartTrack__title > a')
    .first().prop('href');
  const downloadButton = createDownloadButton(onUnload$, downloadInfoUrl);
  const buttonGroup = listItem.find('.soundActions .sc-button-group');
  addToButtonGroup(downloadButton, buttonGroup);
}
