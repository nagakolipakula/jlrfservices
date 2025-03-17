import { LightningElement, api } from 'lwc';
import { FlowNavigationNextEvent} from 'lightning/flowSupport';
import GOL_Present_Quote_Continue_Button from '@salesforce/label/c.GOL_Present_Quote_Continue_Button';

export default class Gol_ConfirmContactDetailsOnFinQuoteConfirmation extends LightningElement {


  @api showModal = false;
  @api message = '';

  labels = {
    GOL_Present_Quote_Continue_Button
 }

  
  handleContinueButtonClick(event) {
      const nextEvent = new FlowNavigationNextEvent();
      this.dispatchEvent(nextEvent);
      this.showModal = false;
  }
  

}