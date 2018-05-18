import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {IContentPage} from '@src/page/content-page';
import {elementAdded$, elementRemoved$} from '@src/util/dom-observer';
import * as $ from 'jquery';
import {first} from 'rxjs/operators';

/**
 * Bootstraps a content-page to the DOM.
 *
 * It first tests if the content page should be loaded using the test() function of the content page;
 * if it should be loaded, then it adds an id tag (unique per type of content page) to the content page to the DOM
 * if it doesn't exist. If it should be loaded and the id tag already exists, then a message will be sent to the
 * extension (background page) signalling for the existing content page to be reloaded.
 * If the content page should not be loaded, then the id tag is removed from the DOM if it already exists.
 *
 * The status of the id tag is directly related and is the source of truth to the status of the content page.
 * When the id tag is added, the content page is signalled to load.
 * When it is removed, the content page is signalled to unload.
 *
 * Do note that to prevent state of the subscription being stored, only the first event of the id tag
 * being added/removed will be listened to; any subsequent event after that will be ignored.
 */
export interface IBootstrapper {
  bootstrap(contentPage: IContentPage): void;
}

export const Bootstrapper: IBootstrapper = {
  bootstrap(contentPage: IContentPage): void {
    const id = getTagId(contentPage);
    if (contentPage.test()) {
      if (idTagIsInDOM(id)) {
        ContentPageMessenger.sendToExtension(new RequestContentPageReloadMessage(contentPage.type));
      } else {
        const idTag = createIdTag(id);
        elementAdded$((node: Node) => node.isSameNode(idTag)).pipe(first())
          .subscribe(() => contentPage.load());
        elementRemoved$(idTag).pipe(first())
          .subscribe(() => contentPage.unload());
        addIdTagToDOM(idTag);
      }
    } else {
      removeIdTagFromDOM(id);
    }
  }
};

function getTagId(contentPage: IContentPage): string {
  return `zc-${contentPage.type}-content-page-id`;
}

function idTagIsInDOM(id: string): boolean {
  return $(`#${id}`).length > 0;
}

function createIdTag(id: string): HTMLElement {
  return $('<div/>', {id})[0];
}

function addIdTagToDOM(idTag: HTMLElement): void {
  $('body').append(idTag);
}

function removeIdTagFromDOM(id: string): void {
  $(`#${id}`).remove();
}
