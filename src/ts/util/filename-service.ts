/**
 * Chrome download api is really finicky with which characters to allow in filenames (eg. the ~ symbol)
 */
export interface IFilenameService {
  removeSpecialCharacters(name: string): string;
}

export const FilenameService: IFilenameService = {
  removeSpecialCharacters(name: string): string {
    return name.replace(/[<>:"|?*\/\\]/g, '_').replace(/~/g, '-');
  }
};
