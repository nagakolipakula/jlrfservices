import { LightningElement, api } from 'lwc';
import 	GOL_Finance_Insurance_and_Services from '@salesforce/label/c.GOL_Finance_Insurance_and_Services';
import 	GOL_Finance_Insurance_product_1 from '@salesforce/label/c.GOL_Finance_Insurance_product_1';
import 	GOL_Finance_Insurance_product_2 from '@salesforce/label/c.GOL_Finance_Insurance_product_2';
export default class Gol_InsuranceServicesComponent extends LightningElement {
    
    @api insuranceProducts;
    cpiProducts = [];
    nonCpiProducts = [];
    services = [];
    isInsuranceProducts = {'cpiProducts':false,'nonCpiProducts':false,'services':false};
    label = {
        GOL_Finance_Insurance_and_Services,
        GOL_Finance_Insurance_product_1,
        GOL_Finance_Insurance_product_2
    }
    connectedCallback(){
        console.log('MS++ Insurance Products==> ',JSON.stringify(this.insuranceProducts,null,2));
        if(this.insuranceProducts){
            this.insuranceProductsCheck();
        }
    }
    insuranceProductsCheck(){
        var insuranceProductsVal = JSON.parse(JSON.stringify(this.insuranceProducts));
        if(insuranceProductsVal.cpiProducts && insuranceProductsVal.cpiProducts.length>0){ 
            this.isInsuranceProducts.cpiProducts = true;
            insuranceProductsVal.cpiProducts.forEach((element) => {
                element.checked = false;
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
                element.checked = false;
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
        if(insuranceProductsVal.inputFields &&  insuranceProductsVal.inputFields.services && insuranceProductsVal.inputFields.services.length>0){
            this.isInsuranceProducts.services = true;
            this.services = insuranceProductsVal.inputFields.services;
          }
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
        if(productHeaderName === 'services'){
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