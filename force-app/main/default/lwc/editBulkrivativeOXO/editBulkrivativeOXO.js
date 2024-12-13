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
                    value: item.Name, // Use Name instead of Id
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

        console.log('Updated Selected Derivatives Names:', JSON.stringify(this.selectedDerivativeNames));

        // Dynamically update columns
        this.updateColumns();
    }

    updateColumns() {
        const baseColumns = [
            { label: 'Feature', fieldName: 'FeatureName' },
        ];

        const dynamicColumns = this.selectedDerivativeNames.map((name) => ({
            label: name,
            fieldName: name.replace(/\s+/g, '_'), // Create a unique fieldName for each product
            editable: true, // Enable inline editing
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
                // Map the response data to include dynamic product columns
                this.data = data.map((row) => {
                    const newRow = { ...row };
                    this.selectedDerivativeNames.forEach((product) => {
                        newRow[product.replace(/\s+/g, '_')] = row.ProductValues[product]?.[row.FeatureName] || ''; // Map product values
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

    handleSave(event) {
        const draftValues = event.detail.draftValues;

        console.log('Draft Values:', JSON.stringify(draftValues));

        // Process draft values for saving (e.g., send to Apex for updates)
        this.data = this.data.map((row) => {
            const draft = draftValues.find((item) => item.Id === row.Id);
            return draft ? { ...row, ...draft } : row;
        });

        // Clear draft values after saving
        this.template.querySelector('lightning-datatable').draftValues = [];

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Records updated successfully.',
                variant: 'success',
            })
        );
    }
}