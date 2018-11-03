import * as $ from 'jquery';
import {fromEvent, Observable} from 'rxjs';
import {takeUntil, throttleTime} from 'rxjs/operators';
import {ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_ICON_CLASS} from 'src/ts/constants';
import {ContentPageMessenger} from 'src/ts/messaging/page/content-page-messenger';
import {RequestDownloadMessage} from 'src/ts/messaging/page/request-download.message';

export const DownloadButtonFactory = {
  create(onUnload$: Observable<any>, resourceInfoUrl: string): JQuery<HTMLElement> {
    const dlButton = createDlButton();
    addDlButtonBehavior(dlButton, onUnload$, resourceInfoUrl);
    return dlButton;
  }
};

function createDlButton(): JQuery<HTMLElement> {
  return $('<button/>')
    .addClass(['sc-button', 'sc-button-responsive'])
    .addClass([ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_ICON_CLASS])
    .prop('title', 'Download')
    .html('Download');
}

function addDlButtonBehavior(dlButton: JQuery<HTMLElement>,
                             onUnload$: Observable<any>,
                             resourceInfoUrl: string) {
  fromEvent(dlButton, 'click')
    .pipe(takeUntil(onUnload$), throttleTime(3000))
    .subscribe(() => ContentPageMessenger.sendToExtension$(new RequestDownloadMessage(resourceInfoUrl)));
}
