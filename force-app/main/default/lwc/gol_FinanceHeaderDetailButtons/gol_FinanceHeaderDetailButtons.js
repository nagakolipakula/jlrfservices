import { LightningElement, track, api } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';
import 	GOL_Finance_Finance_calculator from '@salesforce/label/c.GOL_Finance_Finance_calculator';
import 	GOL_Finance_Personal_Purchase from '@salesforce/label/c.GOL_Finance_Personal_Purchase';
import 	GOL_Finance_Purchase_For_a_Company from '@salesforce/label/c.GOL_Finance_Purchase_For_a_Company';
export default class Gol_FinanceHeaderDetailButtons extends LightningElement {
    @api companyNameCheck = 'PRIVATE';
    @api quoteId;
    @api loadButtonChecks;
    @api productAPIResponseCode;
    label = {
        GOL_Finance_Finance_calculator,
        GOL_Finance_Personal_Purchase,
        GOL_Finance_Purchase_For_a_Company
     }
    @track personalPerchaseStyle = 'btn-client-deselect';
    @track companyPerchaseStyle = 'btn-client-select';

    connectedCallback() {
        //this.dispatchEvent(new FlowAttributeChangeEvent('companyNameCheck', 'PRIVATE')); 
        //this.navigateFlow();
        console.log('this.companyNameCheck==>'+this.companyNameCheck);
        if(this.companyNameCheck === 'PROFESSIONAL'){
            this.personalPerchaseStyle = 'btn-client-select';
            this.companyPerchaseStyle = 'btn-client-deselect';
        }else if(this.companyNameCheck === 'PRIVATE'){
            this.personalPerchaseStyle = 'btn-client-deselect';
            this.companyPerchaseStyle = 'btn-client-select';
        }
    }
    handleReconfigure (event){
            if(this.companyNameCheck !== event.target.value || this.productAPIResponseCode != 200){
            const selectedButton = event.target.dataset.id;
            if (selectedButton === 'personal') {
                  this.personalPerchaseStyle = 'btn-client-select';
                  this.companyPerchaseStyle = 'btn-client-deselect';
              } else if (selectedButton === 'company') {
                  this.personalPerchaseStyle = 'btn-client-deselect';
                  this.companyPerchaseStyle = 'btn-client-select';
              }
              console.log('--------<<>>>'+event.target.value);
            this.dispatchEvent(new FlowAttributeChangeEvent('companyNameCheck', event.target.value));
            this.navigateFlow();
            }
          }
          navigateFlow() {
            this.dispatchEvent(new FlowNavigationNextEvent());
               
        }      
}