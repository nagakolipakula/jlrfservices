import { LightningElement, api } from 'lwc';
import { FlowNavigationNextEvent, FlowAttributeChangeEvent } from 'lightning/flowSupport';
import GOL_Back from '@salesforce/label/c.GOL_Back';
import sendFinanceContext from '@salesforce/apex/GOL_SendFinInfoToBank.sendFinanceContext';
import GOL_Send_To_Bank_Button from '@salesforce/label/c.GOL_Send_To_Bank_Button';

export default class Gol_ConfirmContactDetailsOnFinQuoteConfirmation extends LightningElement {


  @api showModal = false;
  @api message = '';
  @api financeInformationId;
  response;
  @api sysLink;
  @api clickedButtonValue;
  @api isLoading = false;
  isError = false;
  messageColour = 'confirmation-text';
  iconName = 'utility:success';


  labels = {
    GOL_Send_To_Bank_Button,
    GOL_Back
  }


  handleContinueButtonClick(event) {
    this.isLoading = true;
    this.isError = false;
    try {
      sendFinanceContext({ financeInfoId: this.financeInformationId })
        .then(result => {
          let obj = JSON.parse(result);
          this.isLoading = false;
          console.log('result-->' + result);
          if (obj.isSuccess) {
            let url = obj.url;
            window.open(url, "_blank");
            this.dispatchEvent(new FlowAttributeChangeEvent('clickedButtonValue', 'SendToBankClicked'));
            const nextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(nextEvent);
            this.showModal = false;
          } else {
            this.messageColour = 'error-text';
            this.iconName = 'utility:error';
            this.message = obj.message;
            this.showModal = true;
            this.isError = true;
          }
        }).catch(error => {
          //error --> show error message
          this.messageColour = 'error-text';
          this.iconName = 'utility:error';
          console.log('error' + error.body.message);
          this.message = 'An error occurred: ' + error.body.message;
          this.showModal = true;
          this.isError = true;
          this.isLoading = false;
        });

    }
    catch (error) {
      //error --> show error message
      this.messageColour = 'error-text';
      this.iconName = 'utility:error';
      console.log('Unhandled error: ' + error.message);
      this.response = undefined;
      this.message = 'An unexpected error occurred.';
      this.showModal = true;
      this.error = error;
      this.isLoading = false;
      this.isError = true;

    }
  }
  handleBackButtonClick() {
    console.log('Back button clicked');
    const nextEvent = new FlowNavigationNextEvent(); // Create Flow Navigation Back event
    this.dispatchEvent(nextEvent); // Dispatch back navigation event
  }

}