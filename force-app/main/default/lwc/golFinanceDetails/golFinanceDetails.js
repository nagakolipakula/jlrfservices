import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';
import getFieldMappings from '@salesforce/apex/GOL_FS_ViewQuoteFieldMappingController.getFieldMappings';

export default class golFinanceDetails extends LightningElement {
    @api financeRecord;
    @api label;
    legaltext;
    IsNotCreated = false;
    fieldMappings = [];
    //financeDetails = {};
    //countryCode;

    connectedCallback(){
        if(this.financeRecord && this.financeRecord.ERPT_FIN_LegalText__c){
            var legalTextVal = this.financeRecord.ERPT_FIN_LegalText__c;
            console.log('MS legalTextVal==> '+legalTextVal);
        this.legaltext = legalTextVal.replaceAll('[','<').replaceAll(']','>').trim();
        }
        this.checkFinanceInformationRecordStatus();

        if (this.financeRecord && this.financeRecord.Id) {
            console.log('financeRecord Id:', this.financeRecord.Id);
            this.fetchFieldMappings(this.financeRecord);
        } else {
            console.error('financeRecord Id is NULL');
        }
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

    fetchFieldMappings() {
        console.log('Calling Apex getFieldMappings...');

        getFieldMappings({ financeRecord: this.financeRecord })
            .then((result) => {
                console.log('Apex Response:', JSON.stringify(result, null, 2));

                if (result && result.fieldMappings) {
                    this.fieldMappings = result.fieldMappings
                        .map((rec) => ({
                            fieldLabel: rec.Field_Name__c,
                            fieldApi: rec.Field_Name_in_FSDev__c,
                            sequence: rec.Sequence__c || 999
                        }))
                        .sort((a, b) => a.sequence - b.sequence);
                } else {
                    console.warn('No field mappings found.');
                }
            })
            .catch((error) => {
                console.error('Apex getFieldMappings FAILED:', error);
            });
    }
}