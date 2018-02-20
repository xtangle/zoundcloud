import {Subscription} from 'rxjs/Subscription';

export interface IContentPage {
  readonly id: string;
  readonly subscriptions: Subscription;
  shouldLoad(): boolean;
  onLoad(): void;
}
