import {IOptions} from 'src/ts/options/option';

export const defaultOptions: IOptions = {
  addMetadata: true,
  alwaysDownloadMp3: true,
  cleanTrackTitle: {
    enabled: true,
    pattern:
      `[-―_|/*!\\s]*[{(【\\[\\s]*` +
      `((click|hit|press)?\\s*['"]?buy['"]?(link|is|to|for|a|4|=|-|\\s)*)?` +
      `((free[\\s_]?(download|dl))|((free|full)?[\\s_]?(download|dl)[\\s_]?link)).*$`,
  },
  overwriteExistingFiles: false,
};
