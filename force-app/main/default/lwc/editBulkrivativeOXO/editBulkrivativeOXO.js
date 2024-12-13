import { LightningElement, api, track } from 'lwc';
import getDiscoveryDerivatives from '@salesforce/apex/BulkDerivativeControllerNK.getDiscoveryDerivatives';
import getBulkDerivative from '@salesforce/apex/BulkDerivativeControllerNK.getBulkDerivative';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { label: 'Feature', fieldName: 'FeatureName' },
    { label: 'OXO Configuration', fieldName: 'OxoConfig', editable: true },
];

export default class EditBulkDerivativeOXO extends LightningElement {
    @api selectedBrand;
    @api selectedMarket;
    @api selectedDerivative;
    @api selectedFeatureGroup;
    @api selectedFeature;

    @track derivativesOptions = [];
    @track selectedDerivatives = [];
    @track selectedDerivativeNames = [];
    @track featureGroup = '';
    @track feature = '';
    @track data = [];
    @track dataPresent = false;
    @track columns = COLUMNS;

    connectedCallback() {
        this.fetchDiscoveryDerivatives();
    }

    fetchDiscoveryDerivatives() {
        getDiscoveryDerivatives()
            .then((data) => {
                this.derivativesOptions = data.map((item) => ({
                    label: item.Name,
                    value: item.Id,
                }));
                console.log('Fetched Derivatives Options:', JSON.stringify(this.derivativesOptions));
            })
            .catch((error) => {
                console.error('Error fetching Discovery derivatives:', error);
            });
    }

    handlePicklistChange(event) {
        this.selectedDerivatives = [...event.detail.value];

        this.selectedDerivativeNames = this.selectedDerivatives.map((id) => {
            const matchingOption = this.derivativesOptions.find((option) => option.value === id);
            return matchingOption ? matchingOption.label : 'Unknown';
        });

        console.log('Updated Selected Derivatives IDs:', JSON.stringify(this.selectedDerivatives));
        console.log('Updated Selected Derivatives Names:', JSON.stringify(this.selectedDerivativeNames));
    }

    handleFeatureGroupChange(event) {
        this.featureGroup = event.target.value;
        console.log('Updated Feature Group:', this.featureGroup);
    }

    handleFeatureChange(event) {
        this.feature = event.target.value;
        console.log('Updated Feature:', this.feature);
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

        console.log('Fetching Bulk Derivatives for Feature Group:', this.featureGroup);
        console.log('Fetching Bulk Derivatives for Feature:', this.feature);
        console.log('Fetching Bulk Derivatives for Market:', this.selectedMarket);
        console.log('Fetching Bulk Derivatives for Derivatives (Names):', JSON.stringify(this.selectedDerivativeNames));

        getBulkDerivative({
            productId: this.selectedDerivativeNames[0],
            marketId: this.selectedMarket
        })
            .then((data) => {
                this.data = data;
                this.dataPresent = this.data.length > 0; // Update dataPresent flag
                console.log('Fetched Bulk Derivatives:', JSON.stringify(this.data));
            })
            .catch((error) => {
                this.data = [];
                this.dataPresent = false;
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