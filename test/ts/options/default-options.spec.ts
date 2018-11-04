import {defaultOptions} from 'src/ts/options/default-options';
import {configureChai} from 'test/ts/test-initializers';

const expect = configureChai();

describe('the default options', () => {
  it('should have the default settings', () => {
    expect(defaultOptions).to.be.deep.equal({
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
    });
  });
});
