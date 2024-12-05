import { LightningElement, track } from 'lwc';

export default class DynamicTableWithPicklists extends LightningElement {
    @track selectedCountry = '';
    @track selectedDerivatives = [];
    @track showWarning = false;
    @track warningTimeoutId;
    @track data = [
        { Id: '1', Name: '19" Style 5021, 5 split-spoke, Gloss Sparkle Silver', Country: 'Global', Car1: 'O', Car2: 'S', Car3: 'N/A', Car4: 'O', Car5: 'S', Car6: 'N/A' },
        { Id: '2', Name: '23" Style 5011, 5 split-spoke, Gloss Sparkle Silver', Country: 'Europe', Car1: 'S', Car2: 'N/A', Car3: 'O', Car4: 'S', Car5: 'N/A', Car6: 'O' },
        { Id: '3', Name: '22" 9 spoke Style 9002 with Diamond Turned finish', Country: 'North America', Car1: 'N/A', Car2: 'O', Car3: 'S', Car4: 'N/A', Car5: 'O', Car6: 'S' },
        { Id: '4', Name: '17" Style 5021, 5 split-spoke, Gloss Sparkle Silver', Country: 'Asia', Car1: 'S', Car2: 'S', Car3: 'N/A', Car4: 'O', Car5: 'S', Car6: 'N/A' },
        { Id: '5', Name: '16" Style 5011, 5 split-spoke, Gloss Sparkle Silver', Country: 'Europe', Car1: 'O', Car2: 'N/A', Car3: 'O', Car4: 'S', Car5: 'N/A', Car6: 'O' },
        { Id: '6', Name: '14" Style 5021, 5 split-spoke, Gloss Sparkle Silver', Country: 'Asia', Car1: 'N/A', Car2: 'O', Car3: 'S', Car4: 'N/A', Car5: 'O', Car6: 'S' },
        { Id: '7', Name: '28" Style 5011, 5 split-spoke, Gloss Sparkle Silver', Country: 'North America', Car1: 'N/A', Car2: 'O', Car3: 'S', Car4: 'N/A', Car5: 'O', Car6: 'S' },
        { Id: '8', Name: '19" Style 5021, 5 split-spoke, Gloss Sparkle Silver', Country: 'Asia', Car1: 'S', Car2: 'S', Car3: 'N/A', Car4: 'O', Car5: 'S', Car6: 'N/A' },
        { Id: '9', Name: '24" Style 5011, 5 split-spoke, Gloss Sparkle Silver', Country: 'Europe', Car1: 'O', Car2: 'N/A', Car3: 'O', Car4: 'S', Car5: 'N/A', Car6: 'O' },
        { Id: '10', Name: '29" Style 5021, 5 split-spoke, Gloss Sparkle Silver', Country: 'Asia', Car1: 'N/A', Car2: 'O', Car3: 'S', Car4: 'N/A', Car5: 'O', Car6: 'S' },

    ];

    @track columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Car1', fieldName: 'Car1', type: 'text', editable: true },
        { label: 'Car2', fieldName: 'Car2', type: 'text', editable: true },
        { label: 'Car3', fieldName: 'Car3', type: 'text', editable: true },
        { label: 'Car4', fieldName: 'Car4', type: 'text', editable: true },
        { label: 'Car5', fieldName: 'Car5', type: 'text', editable: true },
        { label: 'Car6', fieldName: 'Car6', type: 'text', editable: true },
    ];

    @track filteredData = [...this.data];
    @track filteredColumns = [...this.columns];

    derivativeOptions = [
        { label: 'Discovery 19MY v10.0 - Bulgaria', value: 'Car1' },
        { label: 'Discovery 19MY v4.7 - Europe', value: 'Car2' },
        { label: 'Discovery 19MY v4.7 - Belgium', value: 'Car3' },
        { label: 'Discovery 19MY v4.7 - Austria', value: 'Car4' },
        { label: 'Discovery 19.5MY v4.9 - Brussels', value: 'Car5' },
        { label: 'Discovery 19MY v4.8 - Turkey', value: 'Car6' },
    ];

    countryOptions = [
        { label: 'Select a Market', value: ''},
        { label: 'Global', value: 'Global' },
        { label: 'Europe', value: 'Europe' },
        { label: 'North America', value: 'North America' },
        { label: 'Asia', value: 'Asia' },
    ];

    handleCountryChange(event) {
        this.selectedCountry = event.detail.value;
        console.log('Selected Country:', this.selectedCountry);
        this.updateFilteredData();
    }

    handleDerivativeChange(event) {
        this.selectedDerivatives = event.detail.value;
        console.log('Selected Derivatives:', this.selectedDerivatives);
        this.updateFilteredData();
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;

        this.showWarning = false;

        draftValues.forEach((draft) => {
            const record = this.data.find((row) => row.Id === draft.Id);
            if (record) {
                Object.keys(draft).forEach((field) => {
                    if (record[field] === 'N/A') {
                        this.showWarning = true;

                        clearTimeout(this.warningTimeoutId);
                        this.warningTimeoutId = setTimeout(() => {
                            this.showWarning = false;
                        }, 20000);
                        return;
                    }
                    record[field] = draft[field];
                });
            }
        });

        this.data = [...this.data];
    }

    updateFilteredData() {
        const countryFilteredData = this.data.filter(
            (row) => !this.selectedCountry || row.Country === this.selectedCountry
        );
    
        if (!this.selectedDerivatives.length) {
            this.filteredColumns = this.columns;
            this.filteredData = countryFilteredData;
        } else {
            this.filteredColumns = this.columns.filter(
                (column) =>
                    column.fieldName === 'Name' || this.selectedDerivatives.includes(column.fieldName)
            );
    
            this.filteredData = countryFilteredData.map((row) => {
                const filteredRow = { Id: row.Id, Name: row.Name };
                this.selectedDerivatives.forEach((derivative) => {
                    filteredRow[derivative] = row[derivative];
                });
                return filteredRow;
            });
        }
    
        console.log('Filtered Columns:', this.filteredColumns);
        console.log('Filtered Data:', this.filteredData);
    }
    

    handleCancel() {
        this.showWarning = false;
        clearTimeout(this.warningTimeoutId);
    }
}
