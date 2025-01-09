import { LightningElement ,api} from 'lwc';
import 	GOL_Select_Financial_Product from '@salesforce/label/c.GOL_Select_Financial_Product';

export default class GolProductSelectionComponent extends LightningElement {
    // @api response;
    @api products = [];
    selectedProduct;
    label = {
        GOL_Select_Financial_Product
    }

    // connectedCallback() {
    //     console.log('Products received in child component:', this.products);
    //     // this.initializeProductItems();
    // }
    
    // initializeProductItems() {
    //     if(this.response){
    //         let tidyUpResponse = this.response.replace(/<\/?[^>]+(>|$)/g, '').trim();
    //         let parsedResponse;
    //         try {
    //             parsedResponse = JSON.parse(tidyUpResponse);
    //         } catch (error) {
    //             console.error('Failed to parse sanitized response:', error);
    //             return;
    //         }

    //         if (parsedResponse) {
    //             parsedResponse.forEach(item => {
    //                 this.products.push({
    //                         label: item.description,
    //                         value: item.id
    //                 });
    //                 if(item.selected){
    //                     this.selectedProduct = item.id;
    //                 }
    //             });
    //             if(this.selectedProduct == undefined || this.selectedProduct == '' || this.selectedProduct == null){
    //                 this.selectedProduct = parsedResponse[0].id;
    //             }
    //         }
    //     }
    // }
    
    handleProductChange(event) {
        this.selectedProduct = event.detail.value;
        const selectProductEvent = new CustomEvent('productchange', {
            detail: this.selectedProduct
        });
        this.dispatchEvent(selectProductEvent);
    }
}