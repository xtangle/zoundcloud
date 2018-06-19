export function addToButtonGroup(downloadButton: JQuery<HTMLElement>,
                                 buttonGroup: JQuery<HTMLElement>) {
  if (buttonGroup.length) {
    const buttons = buttonGroup.children('button');
    if (buttons.hasClass('sc-button-icon')) {
      downloadButton.addClass('sc-button-icon');
    }
    const shareButton = buttons.filter('.sc-button-share');
    if (shareButton.length) {
      downloadButton.insertAfter(shareButton);
    } else {
      const lastButtonInGroup = buttons.last();
      if (lastButtonInGroup.hasClass('sc-button-more')) {
        downloadButton.insertBefore(lastButtonInGroup);
      } else {
        buttonGroup.append(downloadButton);
      }
    }
  }
}
