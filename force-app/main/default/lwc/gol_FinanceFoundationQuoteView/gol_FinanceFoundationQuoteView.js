import { LightningElement, api } from 'lwc';
import GOL_Lease from '@salesforce/label/c.GOL_Lease';
import GOL_monthly from '@salesforce/label/c.GOL_monthly';
import GOL_Final_price_with_trade_in from '@salesforce/label/c.GOL_Final_price_with_trade_in';
import GOL_Deposits from '@salesforce/label/c.GOL_Deposits';
import GOL_Agreement_duration from '@salesforce/label/c.GOL_Agreement_duration';
import GOL_Mileage_per_annum from '@salesforce/label/c.GOL_Mileage_per_annum';
import GOL_Effective_rate from '@salesforce/label/c.GOL_Effective_rate';
import GOL_Nominal_rate from '@salesforce/label/c.GOL_Nominal_rate';
import GOL_Management_fees from '@salesforce/label/c.GOL_Management_fees';
import GOL_Total_lease_amount from '@salesforce/label/c.GOL_Total_lease_amount';
import GOL_Monthly_payment from '@salesforce/label/c.GOL_Monthly_payment';
import GOL_JLR_Id from '@salesforce/label/c.GOL_JLR_Id';
import GOL_VAT_label from '@salesforce/label/c.GOL_VAT_label';
import GOL_Lorem_Text from '@salesforce/label/c.GOL_Lorem_Text';
import GOL_Modify_button from '@salesforce/label/c.GOL_Modify_button';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';



export default class gol_FinanceFoundationQuoteView extends LightningElement {
    @api financeInformationId;
    @api ContactId;
    label = {
        GOL_Lease,
        GOL_monthly,
        GOL_Final_price_with_trade_in,
        GOL_Deposits,
        GOL_Agreement_duration,
        GOL_Mileage_per_annum,
        GOL_Effective_rate,
        GOL_Nominal_rate,
        GOL_Management_fees,
        GOL_Total_lease_amount,
        GOL_Monthly_payment,
        GOL_JLR_Id,
        GOL_VAT_label,
        GOL_Lorem_Text,
        GOL_Modify_button
    }

    connectedCallback () {
        console.log('financeInformationId', this.financeInformationId);
        console.log('ContactId', this.ContactId);
    }

    handleBackToFianceCalculator() {
        contactId = this.ContactId;
        this.dispatchEvent(new FlowNavigationNextEvent(contactId));
        // this.dispatchEvent(new FlowNavigationBackEvent(contactId));));
        // this.dispatchEvent(new CustomEvent('modify', {
        //     detail: { contactId: this.ContactId || 'Static Text' },
        //     bubbles: true,
        //     composed: true
        // }));
        // console.log('modify event fired with ContactId:', this.ContactId || 'Static Text');
    }    
}