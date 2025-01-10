import { LightningElement ,api} from 'lwc';
import 	GOL_Select_Financial_Product from '@salesforce/label/c.GOL_Select_Financial_Product';

export default class GolProductSelectionComponent extends LightningElement {
    // @api response;
    _products = [];
    selectedProduct;
    label = {
        GOL_Select_Financial_Product
    }

    @api
    set products(value) {
        this._products = value || [];
        console.log('Products received in child:', JSON.stringify(this._products));
        this._products = this._products.map((product) => ({
            ...product,
            checked: product.value === this.selectedProduct
        }));
    }

    get products() {
        return this._products;
    }

    connectedCallback() {
        if (this._products.length > 0) {
            this.selectedProduct = this._products[0].value;
        }
        this.updateProducts();
    }

    updateProducts() {
        this._products = this._products.map((product) => ({
            ...product,
            checked: product.value === this.selectedProduct
        }));
    }
    
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
        this.selectedProduct = event.target.value;
        console.log('Selected Product in Child:', this.selectedProduct);
        // this.products = this.products.map((product) => ({
        //     ...product,
        //     checked: product.value === this.selectedProduct
        // }));
        const selectProductEvent = new CustomEvent('productchange', {
            detail: this.selectedProduct
        });
        this.dispatchEvent(selectProductEvent);
    }
}