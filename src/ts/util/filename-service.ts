/**
 * This util exists because Chrome download api is really finicky with which characters
 * are allowed in filenames (eg. the ~ symbol is not allowed even though Windows allows it).
 */
export const FilenameService = {
  removeSpecialCharacters(name: string): string {
    return name.replace(/[<>:"|?*\/\\]/g, '_').replace(/~/g, '-');
  }
};
