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
    @track filteredDerivativesOptions = [];
    @track derivativesOptions = [];

    // Top Table Data
    @track transformedData = {
        BodyStyle: [],
        Engine: [],
        Trim: [],
        ModelCode: [],
        DerivativePackCode: [],
        OxoConfig: [],
    };

    // Bottom Table Data
    @track bottomTableData = [];
    @track bottomColumns = [
        { label: 'Feature', fieldName: 'FeatureName' },
        { label: 'OXO Configuration', fieldName: 'OxoConfig' },
    ];

    connectedCallback() {
        this.fetchDiscoveryDerivatives();
    }

    // Fetch Available Derivatives
    fetchDiscoveryDerivatives() {
        getDiscoveryDerivatives()
            .then((data) => {
                this.derivativesOptions = data.map((item) => ({
                    label: item.Name,
                    value: item.Name,
                }));
                this.filterDerivativesByMarket();
            })
            .catch((error) => console.error('Error fetching derivatives:', error));
    }

    handleMarketChange(event) {
        this.selectedMarket = event.target.value;
        this.filterDerivativesByMarket();
    }

    filterDerivativesByMarket() {
        if (this.selectedMarket) {
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
            const match = this.filteredDerivativesOptions.find((option) => option.value === id);
            return match ? match.label : '';
        });
    
        // Reset columns and data when derivatives are deselected
        if (this.selectedDerivativeNames.length === 0) {
            this.transformedData = { BodyStyle: [], Engine: [], Trim: [], ModelCode: [], DerivativePackCode: [], OxoConfig: [] };
            this.bottomTableData = [];
            this.bottomColumns = [{ label: 'Feature', fieldName: 'FeatureName' }];
        }
    
        console.log('Updated Selected Derivatives:', JSON.stringify(this.selectedDerivativeNames));
    }handlePicklistChange(event) {
        this.selectedDerivatives = [...event.detail.value];
        this.selectedDerivativeNames = this.selectedDerivatives.map((id) => {
            const match = this.filteredDerivativesOptions.find((option) => option.value === id);
            return match ? match.label : '';
        });
    
        console.log('Selected Derivatives:', JSON.stringify(this.selectedDerivativeNames));
    
        if (this.selectedDerivativeNames.length === 0) {
            this.transformedData = {
                BodyStyle: [],
                Engine: [],
                Trim: [],
                ModelCode: [],
                DerivativePackCode: [],
                OxoConfig: [],
            };
    
            this.bottomTableData = [];
            this.bottomColumns = [{ label: 'Feature', fieldName: 'FeatureName' }];
            this.columns = [];
        } else {
            this.fetchTopTableData();
            this.fetchBottomTableData();
        }
    }    

    fetchTopTableData() {
        if (!this.selectedDerivativeNames.length) {
            this.transformedData = {
                BodyStyle: [],
                Engine: [],
                Trim: [],
                ModelCode: [],
                DerivativePackCode: [],
                OxoConfig: [],
            };
            this.columns = [];
            return;
        }
    
        getBulkDerivative({
            productIds: this.selectedDerivativeNames,
            marketId: this.selectedMarket
        })
            .then((data) => {
                // Reset transformed data
                this.transformedData = {
                    BodyStyle: [],
                    Engine: [],
                    Trim: [],
                    ModelCode: [],
                    DerivativePackCode: [],
                    OxoConfig: [],
                };
    
                this.selectedDerivativeNames.forEach((product) => {
                    const record = data.find((row) => row.ProductValues[product]);
                    this.transformedData.BodyStyle.push(record ? record.BodyStyle : '');
                    this.transformedData.Engine.push(record ? record.Engine : '');
                    this.transformedData.Trim.push(record ? record.Trim : '');
                    this.transformedData.ModelCode.push(record ? record.ModelCode : '');
                    this.transformedData.DerivativePackCode.push(record ? record.DerivativePackCode : '');
                    this.transformedData.OxoConfig.push(record ? record.OxoConfig : '');
                });
    
                this.columns = this.selectedDerivativeNames.map((name) => ({
                    label: name,
                    fieldName: name.replace(/\s+/g, '_'),
                }));
            })
            .catch((error) => this.showError('Failed to fetch top table data.'));
    }

    prepareBottomTableData(rawData) {
        const preparedData = [];
    
        rawData.forEach((row) => {
            const rowData = { FeatureName: row.FeatureName };
    
            this.selectedDerivativeNames.forEach((derivative) => {
                const colName = derivative.replace(/\s+/g, '_');
                rowData[colName] = row.ProductValues[derivative]?.[row.FeatureName] || 'N/A';
            });
    
            preparedData.push(rowData);
        });
    
        return preparedData;
    }

    fetchBottomTableData() {
        if (!this.selectedDerivativeNames.length) {
            this.bottomTableData = [];
            this.bottomColumns = [{ label: 'Feature', fieldName: 'FeatureName' }];
            return;
        }
    
        getBulkDerivative({
            productIds: this.selectedDerivativeNames,
            marketId: this.selectedMarket
        })
            .then((data) => {
                this.bottomTableData = this.prepareBottomTableData(data);
    
                this.bottomColumns = [
                    { label: 'Feature', fieldName: 'FeatureName', editable: false },
                    ...this.selectedDerivativeNames.map((name) => ({
                        label: name,
                        fieldName: name.replace(/\s+/g, '_'),
                        type: 'text',
                        editable: true,
                    })),
                ];
    
                console.log('Bottom Table Data:', JSON.stringify(this.bottomTableData));
            })
            .catch((error) => {
                console.error('Error fetching bottom table data:', error);
                this.showError('Failed to fetch bottom table data.');
            });
    }

    fetchBulkDerivatives() {
        this.fetchTopTableData();
        this.fetchBottomTableData();
    }
    

    showError(message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error',
            })
        );
    }
}