const ID3Writer = require('browser-id3-writer');

export type IID3Writer = typeof ID3Writer;

export interface IID3WriterService {
  addTag(writer: IID3Writer): IID3Writer;
  createWriter(arrayBuffer: ArrayBuffer): IID3Writer;
  getURL(writer: IID3Writer): string;
  setFrame(writer: IID3Writer, frame: string, value: any): IID3Writer;
}

export const ID3WriterService: IID3WriterService = {
  addTag: (writer: IID3Writer) => {
    writer.addTag();
    return writer;
  },
  createWriter: (arrayBuffer: ArrayBuffer) => new ID3Writer(arrayBuffer),
  getURL: (writer: IID3Writer) => writer.getURL(),
  setFrame: (writer: IID3Writer, frame: string, value: any) => {
    if (value !== null && value !== undefined) {
      writer.setFrame(frame, value);
    }
    return writer;
  },
};
