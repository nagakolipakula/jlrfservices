import {LightningElement, api} from 'lwc';
import doGetRecords from '@salesforce/apex/LMS_ImportAccessoriesController.doGetRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import LMS_Success from '@salesforce/label/c.LMS_Success';
import LMS_Error from '@salesforce/label/c.LMS_Error';
import LMS_Close from '@salesforce/label/c.LMS_Close';
import LMS_Cancel from '@salesforce/label/c.LMS_Cancel';
import LMS_Next from '@salesforce/label/c.LMS_Next';
import LMS_Loading from '@salesforce/label/c.LMS_Loading';
import LMS_CC_ModalRunButton from '@salesforce/label/c.LMS_CC_ModalRunButton';
import LMS_UnknownError	from '@salesforce/label/c.LMS_UnknownError';
import LMS_AccessoriesAppHeader	from '@salesforce/label/c.LMS_AccessoriesAppHeader';
import LMS_AccessoriesAppHelpText from '@salesforce/label/c.LMS_AccessoriesAppHelpText';
import LMS_AccessoriesAppCode from '@salesforce/label/c.LMS_AccessoriesAppCode';

const CLOSE_MODAL_EVENT = 'closeaccessories';
const ACCESSORY_APP = 'ACCESSORY';

export default class LmsImportAccessoriesPopup extends LightningElement {

    LABELS = {
        LMS_Success,
        LMS_Error,
        LMS_Close,
        LMS_Cancel,
        LMS_Next,
        LMS_Loading,
        LMS_CC_ModalRunButton,
        LMS_UnknownError,
        LMS_AccessoriesAppHeader,
        LMS_AccessoriesAppHelpText,
        LMS_AccessoriesAppCode
    };

    @api recordId;
    @api header = this.LABELS.LMS_AccessoriesAppHeader;
    @api helpText = this.LABELS.LMS_AccessoriesAppHelpText;
    @api fieldLabel = this.LABELS.LMS_AccessoriesAppCode;
    @api integrationType = ACCESSORY_APP;
    inputCode = null;
    isLoaded = false;
    isInputVisible = true;
    isResultVisible = false;
    message;

    connectedCallback() {
        this.isLoaded = true;
    }

    closeModal() {
        this.dispatchEvent(new CustomEvent(CLOSE_MODAL_EVENT, {bubbles: true, composed: true, detail: 'Closing Modal'}));
    }

    setCode(event) {
        this.inputCode = event.detail.value;
    }

    doSubmit(event) {
        this.isLoaded = false;
        this.isInputVisible = false;
        doGetRecords({code: this.inputCode, recordId: this.recordId, type: this.integrationType})
            .then(result =>{
                console.log(result);
                this.inputCode = null;
                if (result.isSuccess) {
                    this.dispatchEvent(new ShowToastEvent({
                        title: this.LABELS.LMS_Success,
                        message: '',
                        variant: 'success',
                    }));
                    if (this.integrationType == 'TRADEIN') {
                        this.isLoaded = true;
                        location.reload();
                    } else {
                        this.dispatchEvent(new CustomEvent('success', {bubbles: true, composed: true, isSuccess: true}));
                        this.closeModal();
                        eval("$A.get('e.force:refreshView').fire();");
                    }
                } else {
                    this.isLoaded = true;
                    this.isResultVisible = true;
                    this.message = result.message;
                }
            }).catch(error =>{
                this.inputCode = null;
                this.isLoaded = true;
                this.isResultVisible = true;
                this.message = this.LABELS.LMS_UnknownError;
            })
    }

    get isDisabled() {
        return this.inputCode == null;
    }
}