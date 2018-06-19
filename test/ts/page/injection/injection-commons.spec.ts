import {addToButtonGroup} from '@src/page/injection/injection-commons';
import {configureChai} from '@test/test-initializers';
import * as $ from 'jquery';

const expect = configureChai();

describe('injection commons', () => {
  describe('the addToButtonGroup function', () => {
    let downloadButton: JQuery<HTMLElement>;
    let buttonGroup: JQuery<HTMLElement>;

    beforeEach(() => {
      document.body.innerHTML = `
        <body>
          <div id="buttonGroupTestId" class="sc-button-group sc-button-group-medium">
          </div>
        </body>
      `;

      buttonGroup = $('#buttonGroupTestId');
      downloadButton = $('<button id="downloadButtonTestId">Download</button>');
    });

    it('should add the download button to the button group', () => {
      addToButtonGroup(downloadButton, buttonGroup);
      expect($(getDownloadButton()).length).to.be.equal(1);
    });

    it('should not add the download button if there is no button group', () => {
      buttonGroup = $();
      addToButtonGroup(downloadButton, buttonGroup);
      expect($(getDownloadButton()).length).to.be.equal(0);
    });

    it('should not specify download button to have an icon if no other button has an icon', () => {
      buttonGroup.append(`
        <button class="sc-button sc-button-small sc-button-responsive"></button>
        <button class="sc-button sc-button-small sc-button-responsive"></button>
      `);
      addToButtonGroup(downloadButton, buttonGroup);
      expect($(getDownloadButton())).to.not.have.$class('sc-button-icon');
    });

    it('should specify download button to have an icon if at least one other button has an icon', () => {
      buttonGroup.append(`
        <button class="sc-button sc-button-small sc-button-responsive"></button>
        <button class="sc-button sc-button-small sc-button-icon sc-button-responsive"></button>
      `);
      addToButtonGroup(downloadButton, buttonGroup);
      expect($(getDownloadButton())).to.have.$class('sc-button-icon');
    });

    context('when the share button exists', () => {
      it('should insert the download button after the share button', () => {
        buttonGroup.append(`
          <button class="sc-button sc-button-like"></button>
          <button class="sc-button sc-button-share"></button>
          <button class="sc-button sc-button-repost"></button>
        `);
        addToButtonGroup(downloadButton, buttonGroup);
        expect($('.sc-button-share').next().is(downloadButton)).to.be.true;
      });
    });

    context('when the share button does not exist', () => {
      it('should insert the download button before the more button if it is the last button in the group', () => {
        buttonGroup.append(`
          <button class="sc-button sc-button-like"></button>
          <button class="sc-button sc-button-repost"></button>
          <button class="sc-button sc-button-more"></button>
        `);
        addToButtonGroup(downloadButton, buttonGroup);
        expect($('.sc-button-more').prev().is(downloadButton)).to.be.true;
      });

      it('should append the download button at the end if the more button is not the last button in the group', () => {
        buttonGroup.append(`
          <button class="sc-button sc-button-like"></button>
          <button class="sc-button sc-button-more"></button>
          <button class="sc-button sc-button-repost"></button>
        `);
        addToButtonGroup(downloadButton, buttonGroup);
        expect(buttonGroup.children().last().is(downloadButton)).to.be.true;
      });

      it('should append the download button at the end if the more button does not exist', () => {
        buttonGroup.append(`
          <button class="sc-button sc-button-like"></button>
          <button class="sc-button sc-button-repost"></button>
        `);
        addToButtonGroup(downloadButton, buttonGroup);
        expect(buttonGroup.children().last().is(downloadButton)).to.be.true;
      });
    });

    function getDownloadButton(): JQuery<HTMLElement> {
      return $('#downloadButtonTestId');
    }
  });
});
