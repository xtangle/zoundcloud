import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {IContentPage} from '@src/page/content-page';
import {Subscription} from 'rxjs';

export function subscribeToReloadPageRequest(this: IContentPage): Subscription {
  return ContentPageMessenger.onMessage(ReloadContentPageMessage.TYPE).subscribe(
    (args: IMessageHandlerArgs<ReloadContentPageMessage>) => {
      if (args.message.contentPageType === this.type) {
        this.reload();
      }
    });
}
