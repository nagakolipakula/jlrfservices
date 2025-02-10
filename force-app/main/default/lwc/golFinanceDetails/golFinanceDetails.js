import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';


export default class golFinanceDetails extends LightningElement {
    @api financeRecord;
    @api label;

    handleModifyClick() {
        console.log('Modify button clicked for JLR ID:', JSON.stringify(this.financeRecord, null, 2));
        const modifyFSRecordEvent = new CustomEvent('modify', {
            detail: {
                financeId: this.financeRecord?.GOL_JLR_ID__c
            }
        });
        // const flowNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(modifyFSRecordEvent);
        // this.dispatchEvent(flowNavigationEvent);
    }
}