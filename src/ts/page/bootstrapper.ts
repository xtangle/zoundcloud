import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {ContentPage} from '@src/page/content-page';
import {elementAdded$, elementRemoved$} from '@src/util/dom-observer';
import * as $ from 'jquery';
import {first} from 'rxjs/operators';

export const TAG_ID = 'zc-content-page';

/**
 * Bootstraps a content-page to the DOM.
 *
 * When calling the bootstrap() function on a content page, it adds an 'id tag' (a unique div element)
 * to the DOM if it doesn't already exist. If the id tag already exists, a request reload content page message
 * is sent to the extension signalling for the content page to be reloaded.
 *
 * The purpose of the id tag is to signal whether the content script has already been loaded. Additionally,
 * when the id tag is removed, the content page is signalled to be unloaded.
 */
export const Bootstrapper = {
  bootstrap(contentPage: ContentPage): void {
    if (idTagIsInDOM()) {
      ContentPageMessenger.sendToExtension(new RequestContentPageReloadMessage());
    } else {
      const idTag = createIdTag();
      elementAdded$((node: Node) => node.isSameNode(idTag))
        .pipe(first())
        .subscribe(() => contentPage.load());
      elementRemoved$(idTag)
        .pipe(first())
        .subscribe(() => contentPage.unload());
      addIdTagToDOM(idTag);
    }
  }
};

function idTagIsInDOM(): boolean {
  return $(`#${TAG_ID}`).length > 0;
}

function createIdTag(): HTMLElement {
  return $('<div/>', {id: TAG_ID})[0];
}

function addIdTagToDOM(idTag: HTMLElement): void {
  $('body').append(idTag);
}
