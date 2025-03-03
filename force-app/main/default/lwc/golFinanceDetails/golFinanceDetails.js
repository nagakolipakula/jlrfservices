import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';


export default class golFinanceDetails extends LightningElement {
    @api financeRecord;
    @api label;
    legaltext;
    IsNotCreated = false;
    connectedCallback(){
        if(this.financeRecord && this.financeRecord.ERPT_FIN_LegalText__c){
        var legalTextVal = this.financeRecord.ERPT_FIN_LegalText__c;
        console.log('MS legalTextVal==> '+legalTextVal);
        this.legaltext = legalTextVal.replaceAll('[','<').replaceAll(']','>').trim();
        }
        this.checkFinanceInformationRecordStatus();
    }
    checkFinanceInformationRecordStatus(){
        if(this.financeRecord && this.financeRecord.LMS_FIN_Status__c !== 'Created'){
            this.IsNotCreated = true;
        }
    }
    handleModifyClick() {
        console.log('Modify button clicked for JLR ID:', JSON.stringify(this.financeRecord, null, 2));
        const modifyFSRecordEvent = new CustomEvent('modify', {
            detail: {
                financeId: this.financeRecord
            }
        });
        // const flowNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(modifyFSRecordEvent);
        // this.dispatchEvent(flowNavigationEvent);
    }
}