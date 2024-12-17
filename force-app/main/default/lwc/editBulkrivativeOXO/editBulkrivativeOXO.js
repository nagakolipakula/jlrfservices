import { LightningElement, api, track } from 'lwc';
import getBulkDerivative from '@salesforce/apex/BulkDerivativeControllerNK.getBulkDerivative';
import getDiscoveryDerivatives from '@salesforce/apex/BulkDerivativeControllerNK.getDiscoveryDerivatives';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EditBulkDerivativeOXO extends LightningElement {
    @api selectedBrand;
    @api selectedMarket;
    @api selectedDerivative;
    @api selectedFeatureGroup;
    @api selectedFeature;
    @track derivativesOptions = [];
    @track filteredDerivativesOptions = [];
    @track selectedDerivatives = [];
    @track selectedDerivativeNames = [];
    @track featureGroup = '';
    @track feature = '';
    @track data = [];
    @track columns = [
        { label: 'Feature', fieldName: 'FeatureName' },
    ];

    connectedCallback() {
        this.fetchDiscoveryDerivatives();
    }

    fetchDiscoveryDerivatives() {
        getDiscoveryDerivatives()
            .then((data) => {
                this.derivativesOptions = data.map((item) => ({
                    label: item.Name,
                    value: item.Name,
                }));

                this.filterDerivativesByMarket();
                console.log('Fetched Derivatives Options:', JSON.stringify(this.derivativesOptions));
            })
            .catch((error) => {
                console.error('Error fetching Discovery derivatives:', error);
            });
    }

    handleMarketChange(event) {
        this.selectedMarket = event.target.value;
        this.filterDerivativesByMarket();
    }

    filterDerivativesByMarket() {
        if (this.selectedMarket && this.selectedMarket.trim() !== '') {
            const searchKey = this.selectedMarket.toLowerCase();
            this.filteredDerivativesOptions = this.derivativesOptions.filter((option) =>
                option.label.toLowerCase().includes(searchKey)
            );
        } else {
            this.filteredDerivativesOptions = [...this.derivativesOptions];
        }
    }

    handlePicklistChange(event) {
        this.selectedDerivatives = [...event.detail.value];
        this.selectedDerivativeNames = this.selectedDerivatives.map((id) => {
            const matchingOption = this.filteredDerivativesOptions.find((option) => option.value === id);
            return matchingOption ? matchingOption.label : 'Unknown';
        });

        console.log('Updated Selected Derivatives Names:', JSON.stringify(this.selectedDerivativeNames));
        this.updateColumns();
    }

    updateColumns() {
        const baseColumns = [
            { label: 'Feature', fieldName: 'FeatureName' },
        ];

        const dynamicColumns = this.selectedDerivativeNames.map((name) => ({
            label: name,
            fieldName: name.replace(/\s+/g, '_'),
            editable: true,
        }));

        this.columns = [...baseColumns, ...dynamicColumns];
    }

    fetchBulkDerivatives() {
        if (!this.selectedMarket || this.selectedMarket === '') {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select a market.',
                    variant: 'error',
                })
            );
            return;
        }

        if (!this.selectedDerivativeNames || this.selectedDerivativeNames.length === 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select at least one derivative.',
                    variant: 'error',
                })
            );
            return;
        }

        getBulkDerivative({
            productIds: this.selectedDerivativeNames,
            marketId: this.selectedMarket
        })
            .then((data) => {
                this.data = data.map((row) => {
                    const newRow = { ...row };
                    this.selectedDerivativeNames.forEach((product) => {
                        newRow[product.replace(/\s+/g, '_')] = row.ProductValues[product]?.[row.FeatureName] || '';
                    });
                    return newRow;
                });

                console.log('Fetched Bulk Derivatives:', JSON.stringify(this.data));
            })
            .catch((error) => {
                console.error('Error fetching bulk derivatives:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to fetch bulk derivatives.',
                        variant: 'error',
                    })
                );
            });
    }
}