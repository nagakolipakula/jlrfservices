import { LightningElement, api } from 'lwc';
import 	GOL_Finance_Insurance_and_Services from '@salesforce/label/c.GOL_Finance_Insurance_and_Services';
import 	GOL_Finance_Insurance_product_1 from '@salesforce/label/c.GOL_Finance_Insurance_product_1';
import 	GOL_Finance_Insurance_product_2 from '@salesforce/label/c.GOL_Finance_Insurance_product_2';
export default class Gol_InsuranceServicesComponent extends LightningElement {
    
    @api insuranceProducts;
    cpiProducts = [];
    nonCpiProducts = [];
    isInsuranceProducts = {'cpiProducts':false,'nonCpiProducts':false,'services':false};
    label = {
        GOL_Finance_Insurance_and_Services,
        GOL_Finance_Insurance_product_1,
        GOL_Finance_Insurance_product_2
    }
    connectedCallback(){
        console.log('MS++ Insurance Products==> ',JSON.stringify(this.insuranceProducts));
        if(this.insuranceProducts){
            this.insuranceProductsCheck();
        }
    }
    insuranceProductsCheck(){
        if(this.insuranceProducts.cpiProducts){
            this.isInsuranceProducts.cpiProducts = true;
            // this.insuranceProducts.cpiProducts.forEach(element => {
            //     element.checked = false;
            //     // if(element.description !== undefined){
            //     //     element.checkboxLabel = element.description;
            //     // }else if(element.name){
            //     //     element.checkboxLabel = element.name;
            //     // }else{
            //     //     element.checkboxLabel = '';
            //     // }
            // });
            this.cpiProducts = this.insuranceProducts.cpiProducts;      
          }         
        if(this.insuranceProducts.nonCpiProducts){
            this.isInsuranceProducts.nonCpiProducts = true;
            // this.insuranceProducts.nonCpiProducts.forEach(element => {
            //     element.checked = false;
            //     if(element.description !== undefined){
            //         element.checkboxLabel = element.description;
            //     }else if(element.name){
            //         element.checkboxLabel = element.name;
            //     }else{
            //         element.checkboxLabel = '';
            //     }
            // });
            this.nonCpiProducts = this.insuranceProducts.nonCpiProducts;
          }       
        if(this.insuranceProducts.inputFields &&  this.insuranceProducts.inputFields.services){
            this.isInsuranceProducts.services = true;
          }
    }
}