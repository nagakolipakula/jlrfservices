import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LMS_QUO_UnknownError from '@salesforce/label/c.LMS_QUO_UnknownError';
import QuoteExpiryChanged from '@salesforce/label/c.LMS_QuoteExpiryChanges';
import cancelLabel from '@salesforce/label/c.LMS_Cancel';
import msgLabel from '@salesforce/label/c.LMS_Message';
import okLabel from '@salesforce/label/c.LMS_ButtonOK';
import RequiredEvidenceDocument from '@salesforce/label/c.LMS_EvidenceDocumentsRequired';
import saveVMECampaignSpecifications from '@salesforce/apex/LMS_QOT_AddQliViewController.saveVMEQLI';
const FIELDS = ['LMS_Quote__c.Name', 'LMS_Quote__c.LMS_QUO_ExpirationDate__c'];

export default class LmsWarningMessage extends NavigationMixin(LightningElement) {
    @api isModalOpen;
    @api selectedRows;
    @api recId;
    @api gsReset;//GOL-2390
    @api recordType;

    @track changedDate = false;
    @track loadSpinner = false;
    @track errorMsg = '';

    quoteValues;
    dateVal;
    newDateVal;
    evidenceDocs = '';

    @track changedLabel = '';

    label = {
        RequiredEvidenceDocument,
        cancelLabel,
        okLabel,
        msgLabel
    };

    @wire(getRecord, { recordId: '$recId', fields: FIELDS })
    oppRecord({ data, error }) {
        console.log('  data --> ' + JSON.stringify(data) + ' error -->  ' + JSON.stringify(error))
        if (data) {
            this.quoteValues = data;
            this.dateVal = data.fields.LMS_QUO_ExpirationDate__c.value;
            let evdDocs = [];
            let vmeDate = [];
            if(this.selectedRows){
                let selectVals = JSON.parse(this.selectedRows);
                for (var x in selectVals) {
                    if (selectVals[x].VME_End_Date__c < this.dateVal ) {
                        vmeDate.push(selectVals[x].VME_End_Date__c);
                        console.log('yes');
                    }
                    console.log('values = ' + JSON.stringify(selectVals[x].VME_End_Date__c));
                    let docs = selectVals[x].VME_Document_Evidence__c.split(";");                 
                    for(var x in docs){
                        if(!evdDocs.includes(docs[x])){
                            evdDocs.push(docs[x]);
                        }
                    }
                }
            }
            if(vmeDate.length != 0){
                vmeDate.sort();
                this.newDateVal = vmeDate[0];
                this.changedLabel = QuoteExpiryChanged.replace('{0}', this.dateVal).replace('{1}',this.newDateVal);
                this.changedDate = true;
            }
            if(evdDocs.length != 0){
                this.evidenceDocs = evdDocs.join(',');
            }
        } else if (error) {
            this.errorMsg = error;
        }
    }

    handleSave() {
        this.loadSpinner = true;
        saveVMECampaignSpecifications({ quoteId: this.recId, changedRecords: this.selectedRows, recType: this.recordType, dateValue : this.newDateVal })
            .then(result => {
                this.loadSpinner = false;
                console.log('Result :======================', result);
                console.log('Result :', JSON.stringify(result));
                if(result == 'Ok'){
                    this.handleCloseModal();
                    if(this.gsReset){ //GOL-2390
                        window.location.reload(); //GOL-2390
                    }else{ //GOL-2390
                        this.navigateToViewRecordPage(this.recId);
                    }//GOL-2390
                }else{
                    this.showToast('Error', result , 'error');
                }
            }).catch(error => {
                console.log(JSON.stringify(error));
                if (error) {
                    this.loadSpinner = false;
                    if (error.body && error.body.message) {
                        this.errorMsg = LMS_QUO_UnknownError + ' ' + error.body.message;
                    }else if(error.body.pageErrors[0].message != null){
                        this.errorMsg = LMS_QUO_UnknownError + ' ' + error.body.pageErrors[0].message;
                    }else{
                        this.errorMsg = LMS_QUO_UnknownError;
                    }
                }
                this.showToast('Error', this.errorMsg , 'error');
            });
    }

    navigateToViewRecordPage(recId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                "recordId": recId,
                "objectApiName": "LMS_Quote__c",
                "actionName": "view"
            },
        });
    }

    handleCloseModal() {
        const passEvent = new CustomEvent('closemodal', {
            detail:{showModal : false} 
        });
        this.dispatchEvent(passEvent);
    }

    showToast(title, message, type) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: type,
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
}