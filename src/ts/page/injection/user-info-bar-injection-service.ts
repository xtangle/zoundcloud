import {ZC_DL_BUTTON_MEDIUM_CLASS} from '@src/constants';
import {DownloadButtonFactory} from '@src/page/injection/download-button-factory';
import {addToButtonGroup} from '@src/page/injection/injection-commons';
import {InjectionSignalFactory} from '@src/page/injection/injection-signal-factory';
import {UrlService} from '@src/util/url-service';
import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

const USER_URL_PATTERN = /https:\/\/soundcloud.com\/[^\/]+/;

export const UserInfoBarInjectionService = {
  injectDownloadButtons(onUnload$: Observable<any>) {
    const selector = '.userInfoBar';
    InjectionSignalFactory.create$(selector)
      .pipe(takeUntil(onUnload$))
      .subscribe(addToUserInfoBar.bind(null, onUnload$));
  }
};

function createDownloadButton(onUnload$: Observable<any>): JQuery<HTMLElement> {
  const userInfoUrl = USER_URL_PATTERN.exec(UrlService.getCurrentUrl())[0];
  return DownloadButtonFactory.create(onUnload$, userInfoUrl)
    .addClass(['sc-button-medium', ZC_DL_BUTTON_MEDIUM_CLASS]);
}

function addToUserInfoBar(onUnload$: Observable<any>, userInfoBar: JQuery<HTMLElement>): void {
  const downloadButton = createDownloadButton(onUnload$);
  const buttonGroup = userInfoBar.find('.sc-button-group');
  addToButtonGroup(downloadButton, buttonGroup);
}
