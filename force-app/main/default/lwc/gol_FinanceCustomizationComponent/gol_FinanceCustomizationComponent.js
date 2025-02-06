import { LightningElement, api } from 'lwc';
import GOL_Customization from '@salesforce/label/c.GOL_Customization';
import GOL_Retailer_Discount from '@salesforce/label/c.GOL_Retailer_Discount';
import GOL_Percentage from '@salesforce/label/c.GOL_Percentage';
import GOL_Amount_incl_VAT from '@salesforce/label/c.GOL_Amount_incl_VAT';
import GOL_JLR_Support from '@salesforce/label/c.GOL_JLR_Support';
import GOL_Excl_VAT from '@salesforce/label/c.GOL_Excl_VAT';
import GOL_Modify_in_Everest from '@salesforce/label/c.GOL_Modify_in_Everest';

export default class Gol_FinanceCustomizationComponent extends LightningElement {

    label = {
        GOL_Customization,
        GOL_Retailer_Discount,
        GOL_Percentage,
        GOL_Amount_incl_VAT,
        GOL_JLR_Support,
        GOL_Excl_VAT,
        GOL_Modify_in_Everest
    };
    @api totalAmountVal = 100000;
    @api percentVal = 0;
    @api amountInclVal = 0;
    retailerdiscounthcss = "margin-top:0px";
    connectedCallback(){

    }
    toggleSection(event) {
        let divId = event.currentTarget.dataset.divid;
        let iconId = 'icon-'+divId;
        let currentsection = this.template.querySelector('[data-id="' + divId + '"]');
        let currentIcon = this.template.querySelector('[data-id="' + iconId + '"]');
        if (currentsection.className.search('slds-is-open') == -1) {
            currentsection.className = 'slds-section slds-is-open';
            currentIcon.iconName = "utility:dash";
            this.retailerdiscounthcss = "margin-top:40px";
        } else {
            currentsection.className = 'slds-section slds-is-close';
            currentIcon.iconName = "utility:add";
            this.retailerdiscounthcss = "margin-top:0px";
        }
    }
    handelPercentageChange(event) {
        if(this.percentVal == event.target.value){
            return;
        }        
        this.percentVal = event.target.value;      
        let discNetAmt2Cal = this.totalAmountVal*this.percentVal/100;
        this.amountInclVal = discNetAmt2Cal.toFixed(2); 

    }
    handelAmountInclValChange(event) {
        if(this.amountInclVal == event.target.value){
            return;
        }
        this.amountInclVal = event.target.value;
        let perCal = 100*this.amountInclVal/this.totalAmountVal;
        this.percentVal = perCal.toFixed(2);
    }
    handleRetailerDiscountClick(){

    }
    handleModifyInEverest(event){
       
    }

}