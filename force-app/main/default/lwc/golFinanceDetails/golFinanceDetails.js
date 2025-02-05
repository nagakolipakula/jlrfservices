import { LightningElement, api } from 'lwc';

export default class golFinanceDetails extends LightningElement {
    @api financeRecord;
    @api label;
}
