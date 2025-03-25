public with sharing class GOL_GetUpdatedFinanceQuote {
 @InvocableMethod(label='Invoke Get Finance Quote API and Update Finance record' description='Invocable method to get quote API callout and update record')
    public static List<Response> invokeGetUpdatedFinanceQuoteAPI(List<Request> lstRequestData) {
        List<Response> lstResponse = new List<Response>();
        Response results = new Response();
        Map<String, String> sliderInputLableFieldMap = new Map<String, String>();
        
        if (lstRequestData == null || lstRequestData.isEmpty() || lstRequestData.get(0).quoteId == null || lstRequestData.get(0).financeQuoteId == null) {
            results.isSuccess = false;
            results.message = 'Invalid input: quoteId or quotePayload is missing';
            lstResponse.add(results);
            return lstResponse;
        }
        String quoteId = lstRequestData.get(0).quoteId;
        String financeQuoteIdOld = lstRequestData.get(0).financeQuoteId;
        
        List<GOL_Record_vs_Input_Fields_Mapping__mdt> sliderInputFields = GOL_GetFinanceQuote.getInputFieldsMappingRecords();
        if(!sliderInputFields.isEmpty() && sliderInputFields.size()>0){
            for(GOL_Record_vs_Input_Fields_Mapping__mdt inputFidelds : sliderInputFields){
                if(inputFidelds.Field_API_Name__c != '' && inputFidelds.Input_Fields_Name__c != ''){
                sliderInputLableFieldMap.put(inputFidelds.Field_API_Name__c, inputFidelds.Input_Fields_Name__c);
                }
            }
        }
        LMS_FinanceInformation__c FinInfo = [SELECT Id, LMS_FIN_Quote__r.EPRT_QUO_External_ID__c, GOL_Age_Range__c,GOL_Channel__c,GOL_Person_Type__c,GOL_Type_Of_Use__c,GOL_Zip_Postal_Code__c,
        LMS_FIN_Annual_Contract_Mileage__c,LMS_FIN_Deposit__c, LMS_FIN_Term__c, LMS_FIN_Flat_Rate__c,LMS_FIN_ProdName__c,
        LMS_FIN_Finance_Reference__c,LMS_FIN_FinanceInstitution__c, CurrencyIsoCode, ERPT_FIN_CreditTimeUoM__c FROM LMS_FinanceInformation__c Where Id =: financeQuoteIdOld];
        
        List<ERPT_FinanceItem__c> FinItemList = [SELECT Id, ERPT_FII_FinanceInformation__c, ERPT_FII_ExternalRef__c, ERPT_FII_financialProductRef__c,ERPT_FII_FullName__c,
        GOL_Record_Type_Name__c FROM ERPT_FinanceItem__c Where ERPT_FII_FinanceInformation__c =: financeQuoteIdOld];
       	
        //LMS_FIN_Annual_Contract_Mileage__c = annualMileagesRange, 
        //LMS_FIN_Deposit__c = downPaymentRange,downPaymentGrossAmountRange
        //LMS_FIN_Term__c = durationsRange
        //LMS_FIN_Flat_Rate__c = finalTermRateRange
        //GOL_Record_vs_Input_Fields_Mapping__mdt custom metadata
        //
        //LMS_FIN_ProdName__c = name = "name": "Crédit classique"
        //LMS_FIN_Finance_Reference__c = fullId = "fullId": "C"
        //LMS_FIN_FinanceInstitution__c = provider =  "provider": "BNPP"
        //CurrencyIsoCode =  "currencyCode": "EUR"
        //ERPT_FIN_CreditTimeUoM__c = "creditTimeUnit": "MONTH"
        //try {
        //    HttpResponse response = GOL_GetFinanceQuote.sendFinanceQuoteRequest(quotePayload);
            
        //    if (response.getStatusCode() == 200) {}
        //    catch (CalloutException e) {
        //    results.isSuccess = false;
         //   results.message = 'Callout Exception: ' + e.getMessage();
        //}
        return lstResponse;
    }
    public class Request {
        @InvocableVariable
        public Id quoteId;
        
        @InvocableVariable
        public String financeQuoteId;
    }
    public class Response {
        @InvocableVariable
        public Boolean isSuccess;
        
        @InvocableVariable
        public String message;
  
    }
}