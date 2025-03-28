import { LightningElement, api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import GOL_SuccessConfirmationIcon from '@salesforce/resourceUrl/GOL_SuccessConfirmationIcon';

export default class Gol_ShowToastInScreenFlows extends LightningElement {

    @api title;
    @api isErrorMessage = false;

    @track isVisible;

    connectedCallback() {
        console.log('------<<<>>>>Under the message'+this.title)
        // Set a timeout to hide the component after 10 seconds
        if(this.title != '' && this.title != null && this.title != undefined){
            this.isVisible = true;
            setTimeout(() => {
                this.isVisible = false;
            }, 10000);
        }
        console.log('------<<<>>>>Under the message')
    }

    get iconUrl() {
        return GOL_SuccessConfirmationIcon; // Adjust the file name and extension accordingly
    }

}