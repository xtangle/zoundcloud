import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ZC_DL_BUTTON_MEDIUM_CLASS} from 'src/ts/constants';
import {DownloadButtonFactory} from 'src/ts/content/injection/download-button-factory';
import {addToButtonGroup} from 'src/ts/content/injection/injection-commons';
import {InjectionSignalFactory} from 'src/ts/content/injection/injection-signal-factory';
import {UrlService} from 'src/ts/util/url-service';

export const ListenEngagementInjectionService = {
  injectDownloadButtons(onUnload$: Observable<any>) {
    const selector = 'div.listenEngagement.sc-clearfix';
    InjectionSignalFactory.create$(selector)
      .pipe(takeUntil(onUnload$))
      .subscribe(addToListenEngagement.bind(null, onUnload$));
  }
};

function createDownloadButton(onUnload$: Observable<any>): JQuery<HTMLElement> {
  const currUrl = UrlService.getCurrentUrl();
  return DownloadButtonFactory.create(onUnload$, currUrl)
    .addClass(['sc-button-medium', ZC_DL_BUTTON_MEDIUM_CLASS]);
}

function addToListenEngagement(onUnload$: Observable<any>, listenEngagement: JQuery<HTMLElement>): void {
  const downloadButton = createDownloadButton(onUnload$);
  const buttonGroup = listenEngagement.find('.listenEngagement__footer .soundActions .sc-button-group');
  addToButtonGroup(downloadButton, buttonGroup);
}
