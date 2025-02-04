import { LightningElement, api } from 'lwc';
import 	GOL_Finance_Insurance_and_Services from '@salesforce/label/c.GOL_Finance_Insurance_and_Services';
export default class Gol_InsuranceServicesComponent extends LightningElement {
    @api indexnumber;
    label = {
        GOL_Finance_Insurance_and_Services
    }
}