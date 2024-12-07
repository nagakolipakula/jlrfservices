import { LightningElement, api, wire } from 'lwc';
import getBulkDerivative from '@salesforce/apex/BulkDerivativeControllerNK.getBulkDerivative';
import processIdsInApex from '@salesforce/apex/BulkDerivativeControllerNK.processIdsInApex';

const COLUMNS = [
    { label: 'Feature', fieldName: 'FeatureName' },
    { label: 'OXO Configuration', fieldName: 'OxoConfig', editable: true },
];

export default class EditBulkrivativeOXO extends LightningElement {
    @api selectedBrand;
    @api selectedMarket;
    @api selectedDerivative;
    @api selectedFeatureGroup;
    @api selectedFeature;

    data = [];
    draftValues = [];
    columns = COLUMNS;

    marketIds = [];
    derivativeIds = [];

    @wire(getBulkDerivative, { productId: '$selectedDerivative', marketId: '$selectedMarket' })
    wiredBulkDerivative({ data, error }) {
        if (data) {
            console.log('Data:', data);
            this.data = data;

            // Extract Market and Derivative Ids
            this.marketIds = [...new Set(data.map(item => item.Market__c))];
            this.derivativeIds = [...new Set(data.map(item => item.Product__c))];

            console.log('Market IDs:', this.marketIds);
            console.log('Derivative IDs:', this.derivativeIds);
        } else if (error) {
            console.error('Error fetching bulk derivatives:', error);
        }
    }


    passIdsToApex() {
        const payload = {
            marketIds: this.marketIds,
            derivativeIds: this.derivativeIds,
        };

        processIdsInApex({ payload: JSON.stringify(payload) })
            .then((result) => {
                console.log('Apex Process Result:', result);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Ids processed successfully in Apex.',
                        variant: 'success',
                    })
                );
            })
            .catch((error) => {
                console.error('Error processing IDs in Apex:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to process IDs in Apex.',
                        variant: 'error',
                    })
                );
            });
    }
}
