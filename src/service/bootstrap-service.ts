import * as $ from 'jquery';
import 'rxjs/add/operator/first';
import {IContentPage} from '../page/content-page';
import {elementAdded$, elementRemoved$} from '../util/dom-observer';

export const BootstrapService = {
  /**
   * Bootstraps a content-page to the DOM.
   *
   * It first tests if the content page should be loaded using the test() function of the content page;
   * if it should be loaded, then it adds an id tag unique to the content page to the DOM,
   * otherwise, it removes the id tag from the DOM if it already exists.
   *
   * The status of the id tag is directly related and is the source of truth to the status of the content page.
   * When the id tag is added, the content page is signalled to load.
   * When it is removed, the content page is signalled to unload.
   * However, do note that because we do not wish to keep state, only the first event of the id tag being added/removed
   * will be listened to; any subsequent events after that will be ignored.
   */
  bootstrap(contentPage: IContentPage): void {
    if (contentPage.test()) {
      if (!idTagIsInDOM(contentPage.id)) {
        const idTag = createIdTag(contentPage.id);
        elementAdded$((node: Node) => node.isSameNode(idTag)).first().subscribe(() => contentPage.load());
        elementRemoved$(idTag).first().subscribe(() => contentPage.unload());
        addIdTagToDOM(idTag);
      }
    } else {
      removeIdTagFromDOM(contentPage.id);
    }
  }
};

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
