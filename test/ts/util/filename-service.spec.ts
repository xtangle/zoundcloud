import {expect} from 'chai';
import {FilenameService} from 'src/ts/util/filename-service';

describe('filename service', () => {
  const fixture = FilenameService;

  context('removing special characters', () => {
    // special characters here are ['<', '>', ':', '"', '|', '?', '*', '\/', '\\']
    it('should replace special characters with an underscore', () => {
      const name = 'a>file<name:with"@ton?|of*special\/characters\\!.mp3';
      const expected = 'a_file_name_with_@ton__of_special_characters_!.mp3';
      expect(fixture.removeSpecialCharacters(name)).to.be.equal(expected);
    });

    it('should replace any tilda with a dash', () => {
      const name = 'some~file~name.mp3';
      const expected = 'some-file-name.mp3';
      expect(fixture.removeSpecialCharacters(name)).to.be.equal(expected);
    });
  });
});
