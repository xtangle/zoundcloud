export interface IContentPage {
  readonly id: string;
  test(): boolean;
  load(): void;
  unload(): void;
}
