import { LightningElement, api } from 'lwc';
import GOL_Quotation_overview from '@salesforce/label/c.GOL_Quotation_overview';
import GOL_New_Calculation_Button from '@salesforce/label/c.GOL_New_Calculation_Button';
import GOL_Update_Quote_Button from '@salesforce/label/c.GOL_Update_Quote_Button';
import GOL_Open_Quote_Button from '@salesforce/label/c.GOL_Open_Quote_Button';
import GOL_Send_To_Bank_Button from '@salesforce/label/c.GOL_Send_To_Bank_Button';
import GOL_Link_To_Pf_PoS from '@salesforce/label/c.GOL_Link_To_Pf_PoS';
import GOL_Link_To_Arval_Pos from '@salesforce/label/c.GOL_Link_To_Arval_Pos';

export default class QuotationOverview extends LightningElement {
    @api buttonActionForOverview;
    @api FinanceInfoRecords;

    label = {
        GOL_Quotation_overview,
        GOL_New_Calculation_Button,
        GOL_Update_Quote_Button,
        GOL_Open_Quote_Button,
        GOL_Send_To_Bank_Button,
        GOL_Link_To_Pf_PoS,
        GOL_Link_To_Arval_Pos
    }

    connectedCallback() {
        console.log('connectedCallback: FinanceInfoRecords', JSON.stringify(this.FinanceInfoRecords, null, 2));
    }

    handleNewCalculationClick(){

    }

    handleUpdateClick()
    {
        
    }
    handleOpenClick()
    {

    }

    handleSendToBankClick()
    {

    }
}