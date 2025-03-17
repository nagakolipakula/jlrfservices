import { LightningElement, api } from 'lwc';
import 	GOL_Finance_Insurance_and_Services from '@salesforce/label/c.GOL_Finance_Insurance_and_Services';
import 	GOL_Finance_Insurance_product_1 from '@salesforce/label/c.GOL_Finance_Insurance_product_1';
import 	GOL_Finance_Insurance_product_2 from '@salesforce/label/c.GOL_Finance_Insurance_product_2';
import 	GOL_Finance_Zip_Postal_code from '@salesforce/label/c.GOL_Finance_Zip_Postal_code';
import 	GOL_Finance_Client_age from '@salesforce/label/c.GOL_Finance_Client_age';

export default class Gol_InsuranceServicesComponent extends LightningElement {
    
    @api insuranceProducts;
    cpiProducts = [];
    nonCpiProducts = [];
    zipCode = "";
    ageRange = [];
    ageRangeSelected;
    services = [];
    isInsuranceProducts = {'cpiProducts':false,'nonCpiProducts':false,'services':false,'ageRange':false,'zipcode':false};
    label = {
        GOL_Finance_Insurance_and_Services,
        GOL_Finance_Insurance_product_1,
        GOL_Finance_Insurance_product_2,
        GOL_Finance_Zip_Postal_code,
        GOL_Finance_Client_age
    }
    connectedCallback(){
        console.log('MS++ Insurance Products==> ',JSON.stringify(this.insuranceProducts,null,2));
        if(this.insuranceProducts){
            this.insuranceProductsCheck();
        }
    }
    insuranceProductsCheck(){
        var insuranceProductsVal = JSON.parse(JSON.stringify(this.insuranceProducts));
        if(insuranceProductsVal.zipCode){
            this.isInsuranceProducts.zipcode = true;
            this.zipCode = insuranceProductsVal.zipCode;
        }
        if(insuranceProductsVal.cpiProducts && insuranceProductsVal.cpiProducts.length>0){ 
            this.isInsuranceProducts.cpiProducts = true;
            insuranceProductsVal.cpiProducts.forEach((element) => {
                if(element.checked === undefined){
                    element.checked = false;
                }                
                if(element.description !== undefined){
                    element.checkboxLabel = element.description;
                }else if(element.name){
                    element.checkboxLabel = element.name;
                }else{
                    element.checkboxLabel = '';
                }
            });
            this.cpiProducts = insuranceProductsVal.cpiProducts;   
            console.log('MS++ cpiProducts==> '+JSON.stringify(insuranceProductsVal.cpiProducts,null,2));   
          }         
        if(insuranceProductsVal.nonCpiProducts && insuranceProductsVal.nonCpiProducts.length>0){
            this.isInsuranceProducts.nonCpiProducts = true;
            insuranceProductsVal.nonCpiProducts.forEach((element) => {
                if(element.checked === undefined){
                    element.checked = false;
                }   
                if(element.description !== undefined){
                    element.checkboxLabel = element.description;
                }else if(element.name){
                    element.checkboxLabel = element.name;
                }else{
                    element.checkboxLabel = '';
                }
            });
            this.nonCpiProducts = insuranceProductsVal.nonCpiProducts;
          }
        if(insuranceProductsVal.ageRange && insuranceProductsVal.ageRange.length>0){
            this.isInsuranceProducts.ageRange = true;
            this.ageRange = insuranceProductsVal.ageRange;
        } 
        if(insuranceProductsVal.ageRangeSelected !== undefined){
            this.ageRangeSelected = insuranceProductsVal.ageRangeSelected;
        }
        if(insuranceProductsVal.inputFields &&  insuranceProductsVal.inputFields.services && insuranceProductsVal.inputFields.services.length>0){
            this.isInsuranceProducts.services = true;
            this.services = insuranceProductsVal.inputFields.services;
          }
    }
    get ageRangeOptions(){
        // if(this.ageRange && this.ageRange.length>0){
            this.ageRange.forEach((element)=>{
                    if(element.name === this.ageRangeSelected){
                        element.selected = true;
                    }else{
                        element.selected = false;
                    }
            });
            return this.ageRange;
        // }
        // }else{
        //     return [
        //         {
        //             "lowerBound": 18,
        //             "upperBound": 40,
        //             "name": "18-40"
        //         },
        //         {
        //             "lowerBound": 41,
        //             "upperBound": 50,
        //             "name": "41-50"
        //         },
        //         {
        //             "lowerBound": 51,
        //             "upperBound": 60,
        //             "name": "51-60"
        //         },
        //         {
        //             "lowerBound": 61,
        //             "upperBound": 70,
        //             "name": "61-70"
        //         }
        //     ];
        // }
    }
    get options() {
        this.services.forEach((element)=>{
            element.validValues.forEach((childelement)=>{
                if(element.defaultValue === childelement.value){
                    childelement.selected = true;
                }else{
                    childelement.selected = false;
                }
            });
        });
        return this.services;
    }
    handleInsuranceProductSelection(event){
        let selectedProduct;
        const productHeaderName = event.target.dataset.mid;
       
        const productId = event.target.dataset.id;
        if(productHeaderName === 'services' || productHeaderName === 'zipcode' || productHeaderName === 'clientage'){
            selectedProduct = event.target.value;
        }else{
            selectedProduct = event.target.checked;
        }
        console.log(selectedProduct+' <==> '+productHeaderName+' <===> '+productId+' <==MS++ handleInsuranceProductSelection==> ');
        let insuranceProductDetails = {'productHeaderName':productHeaderName,'productId':productId,'selectedProduct':selectedProduct};    
        this.dispatchEvent(
            new CustomEvent('insuranceproductchange', {
                detail: insuranceProductDetails
            })
        );
    }
}