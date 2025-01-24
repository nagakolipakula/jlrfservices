import { LightningElement } from 'lwc';
import GOL_Lease from '@salesforce/label/c.GOL_Lease';
import GOL_monthly from '@salesforce/label/c.GOL_monthly';
import GOL_Final_price_with_trade_in from '@salesforce/label/c.GOL_Final_price_with_trade_in';
import GOL_Deposits from '@salesforce/label/c.GOL_Deposits';
import GOL_Agreement_duration from '@salesforce/label/c.GOL_Agreement_duration';
import GOL_Mileage_per_annum from '@salesforce/label/c.GOL_Mileage_per_annum';
import GOL_Effective_rate from '@salesforce/label/c.GOL_Effective_rate';
import GOL_Nominal_rate from '@salesforce/label/c.GOL_Nominal_rate';
import GOL_Management_fees from '@salesforce/label/c.GOL_Management_fees';
import GOL_Total_lease_amount from '@salesforce/label/c.GOL_Total_lease_amount';
import GOL_Monthly_payment from '@salesforce/label/c.GOL_Monthly_payment';


export default class gol_FinanceFoundationQuoteView extends LightningElement {
    label = {
        GOL_Lease,
        GOL_monthly,
        GOL_Final_price_with_trade_in,
        GOL_Deposits,
        GOL_Agreement_duration,
        GOL_Mileage_per_annum,
        GOL_Effective_rate,
        GOL_Nominal_rate,
        GOL_Management_fees,
        GOL_Total_lease_amount,
        GOL_Monthly_payment


    }
}