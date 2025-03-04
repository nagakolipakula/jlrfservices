import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent} from 'lightning/flowSupport';

export default class Gol_ConfirmContactDetailsOnFinQuoteConfirmation extends LightningElement {

    @api showModal = false;
    errorMessage = 'Successfully Saved!';
    continueButton = 'Continue';
    cancelButton = 'Cancel';
    //sendEmailTaxModel = 'true';

    handleContinueButtonClick(event) {
       // this.dispatchEvent(new CustomEvent('continue'));
    //    alert('continue');
      const nextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(nextEvent);
    }
    handleCancelButtonClick(event) {
        //this.dispatchEvent(new CustomEvent('cancel'));
        // alert('cancel');
          const nextEvent = new FlowNavigationNextEvent();
                this.dispatchEvent(nextEvent);
    }

}