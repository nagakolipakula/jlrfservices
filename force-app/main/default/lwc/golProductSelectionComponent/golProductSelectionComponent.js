import { LightningElement ,api} from 'lwc';
import 	GOL_Select_Financial_Product from '@salesforce/label/c.GOL_Select_Financial_Product';

export default class golProductSelectionComponent extends LightningElement {
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
        
    handleProductChange(event) {
        this.selectedProduct = event.target.value;
        console.log('Selected Product in Child:', this.selectedProduct);
        const selectProductEvent = new CustomEvent('productchange', {
            detail: this.selectedProduct
        });
        this.dispatchEvent(selectProductEvent);
    }
}