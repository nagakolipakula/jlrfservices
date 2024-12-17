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
    
        // Clear tables and columns when no derivatives are selected
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
            this.columns = []; // Clear top table columns
        } else {
            this.fetchTopTableData();
            this.fetchBottomTableData();
        }
    }    

    // Fetch Data for Top Table
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
            this.columns = []; // Clear top table columns
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

    // Fetch Data for Bottom Table
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
                const bottomDataMap = new Map();
    
                // Build rows dynamically
                data.forEach((row) => {
                    const featureName = row.FeatureName;
                    if (!bottomDataMap.has(featureName)) {
                        bottomDataMap.set(featureName, { FeatureName: featureName });
                    }
    
                    // Add OxoConfig for each derivative dynamically
                    this.selectedDerivativeNames.forEach((product) => {
                        bottomDataMap.get(featureName)[product.replace(/\s+/g, '_')] =
                            row.ProductValues[product]?.[featureName] || 'N/A';
                    });
                });
    
                // Convert to array for lightning-datatable
                this.bottomTableData = Array.from(bottomDataMap.values());
    
                // Rebuild dynamic columns
                this.bottomColumns = [
                    { label: 'Feature', fieldName: 'FeatureName' },
                    ...this.selectedDerivativeNames.map((name) => ({
                        label: name,
                        fieldName: name.replace(/\s+/g, '_'),
                        type: 'text',
                        editable: true,
                    })),
                ];
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