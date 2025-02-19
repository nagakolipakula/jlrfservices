public with sharing class GOL_GetFinanceQuote {
    
    @InvocableMethod(label='Invoke Get Finance Quote API and Create Finance record' description='Invocable method to get quote API callout and insert record')
    public static List<Response> invokeGetFinanceQuoteAPI(List<Request> lstRequestData) {
        List<Response> lstResponse = new List<Response>();
        Response results = new Response();
        
        if (lstRequestData == null || lstRequestData.isEmpty() || lstRequestData.get(0).quoteId == null || lstRequestData.get(0).quotePayload == null) {
            results.isSuccess = false;
            results.message = 'Invalid input: quoteId or quotePayload is missing';
            lstResponse.add(results);
            return lstResponse;
        }
        String quoteId = lstRequestData.get(0).quoteId;
        String quotePayload = lstRequestData.get(0).quotePayload;
        String financeQuoteIdOld = lstRequestData.get(0).financeQuoteId;
    

        //quotePayload = quotePayload.replace('44250.003', '44250');//Remove this later

        try {
            HttpResponse response = sendFinanceQuoteRequest(quotePayload);
            
            if (response.getStatusCode() == 200) {
                GOL_JSON2ApexFinancialQuoteWrapper parsedResponse = GOL_JSON2ApexFinancialQuoteWrapper.parse(response.getBody());
                Id financeRecordId = createFinanceInformationRecord(quoteId, parsedResponse,financeQuoteIdOld);
                deleteFinanceItems(financeRecordId);
                if(parsedResponse.fixedCosts != null && parsedResponse.fixedCosts.size() > 0){
                    createFinanceItemsFixedCosts(financeRecordId, parsedResponse.fixedCosts);
                }
                results.isSuccess = (financeRecordId != null);
                results.financeQuoteId = financeRecordId;
            } else {
                results.isSuccess = false;
                results.message = 'API Error: ' + response.getStatusCode() + ' ' + response.getStatus();
            }
        } catch (CalloutException e) {
            results.isSuccess = false;
            results.message = 'Callout Exception: ' + e.getMessage();
        } catch (Exception e) {
            results.isSuccess = false;
            results.message = 'Unexpected Error: ' + e.getMessage();
        }

        lstResponse.add(results);
        return lstResponse;
    }

    private static HttpResponse sendFinanceQuoteRequest(String quotePayload) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:GOL_MS_Finance/' + Label.GOL_Get_Finance_Quote_End_Point);
        request.setMethod('POST');
        request.setTimeout(20000);
        request.setBody(quotePayload);
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        return http.send(request);
    }

    private static Id createFinanceInformationRecord(String quoteId, GOL_JSON2ApexFinancialQuoteWrapper parsedResponse,String financeQuoteIdOld) {
        if (parsedResponse == null) {
            return null;
        }
        
        LMS_FinanceInformation__c financeInformation = new LMS_FinanceInformation__c();
        financeInformation.Id = financeQuoteIdOld;
        financeInformation.LMS_FIN_Quote__c = quoteId;
        financeInformation.RecordTypeId = Schema.SObjectType.LMS_FinanceInformation__c.getRecordTypeInfosByDeveloperName().get(GOL_Constants.LMS_FIN_CENTRAL_FINANCING_RT).getRecordTypeId();
        if(financeQuoteIdOld == null ){
            financeInformation.LMS_FIN_Lead__c = getSalesLead(quoteId);
        }
        
        financeInformation.LMS_FIN_Term__c = parsedResponse.Quote.duration;//Months (duration)
        financeInformation.LMS_FIN_ProdName__c = parsedResponse.FinancialProduct.name; //Product Name
        financeInformation.LMS_FIN_FinanceInstitution__c = parsedResponse.FinancialProduct.provider; //Need to check this value
        financeInformation.LMS_FIN_Finance_Reference__c = parsedResponse.FinancialProduct.fullId; //Product Id
        financeInformation.LMS_FIN_Finance_Provider__c = GOL_Constants.LMS_FIN_FINANCE_PROVIDER;
        financeInformation.LMS_FIN_Annual_Contract_Mileage__c = parsedResponse.Quote.annualMileage;//Anual Milege
        financeInformation.ERPT_FIN_TotalGrossAmt__c = parsedResponse.Quote.totalGrossAmount; //Gross Amount
        financeInformation.ERPT_FIN_LegalTitle__c = parsedResponse.LegalDocument.title;//Legal 
        financeInformation.ERPT_FIN_LegalText__c = parsedResponse.LegalDocument.body;//Legal 
        financeInformation.ERPT_FIN_InstallmentIntGrossAmt__c = parsedResponse.Quote.installmentGrossAmount;//Monthly Gross amount
        financeInformation.ERPT_FIN_CreditTimeUoM__c = parsedResponse.FinancialProduct.creditTimeUnit;//Months
        financeInformation.CurrencyIsoCode = parsedResponse.FinancialProduct.currencyCode;//Currency code
        financeInformation.LMS_FIN_Deposit__c = parsedResponse.Quote.downPaymentGrossAmount; //Deposit
        financeInformation.GOL_Type_Of_Use__c = parsedResponse.typeOfUse; 
        financeInformation.GOL_Person_Type__c  = parsedResponse.personType;
        financeInformation.GOL_Channel__c = parsedResponse.channel;
        
        upsert financeInformation;
        return financeInformation.Id;
    }
    private static void deleteFinanceItems(String financeInformationId){
        List<ERPT_FinanceItem__c> lstFinanceItems = [SELECT Id FROM ERPT_FinanceItem__c WHERE ERPT_FII_FinanceInformation__c = :financeInformationId];
        if(!lstFinanceItems.isEmpty()){
            delete lstFinanceItems;
        }
    }

    private static void createFinanceItemsFixedCosts(String financeInformationId,List<GOL_JSON2ApexFinancialQuoteWrapper.FixedCost> fixedCosts) {
        // if (fixedCosts == null) {
        //     return null;
        // }
        List<ERPT_FinanceItem__c> lstFinanceItems = new List<ERPT_FinanceItem__c>();
        for(GOL_JSON2ApexFinancialQuoteWrapper.FixedCost fixedCost : fixedCosts) {
            ERPT_FinanceItem__c financeInformation = new ERPT_FinanceItem__c();
            financeInformation.ERPT_FII_FinanceInformation__c = financeInformationId;
            financeInformation.RecordTypeId = Schema.SObjectType.ERPT_FinanceItem__c.getRecordTypeInfosByDeveloperName().get(GOL_Constants.ERPT_FII_FIXEDCOST_RT).getRecordTypeId();
            financeInformation.ERPT_FII_Description__c = fixedCost.name;
            financeInformation.ERPT_FII_FullName__c = fixedCost.name;
            financeInformation.ERPT_FII_GrossAmount__c = fixedCost.grossAmount;
            lstFinanceItems.add(financeInformation);
        }
        if (!lstFinanceItems.isEmpty()) {
            insert lstFinanceItems;
        }
    }

    private static Id getSalesLead(Id quoteId) {
        List<LMS_Quote__c> quoList = [SELECT LMS_QUO_Opportunity__c FROM LMS_Quote__c WHERE Id = :quoteId LIMIT 1];
        return (quoList.isEmpty()) ? null : quoList[0].LMS_QUO_Opportunity__c;
    }

    @AuraEnabled(cacheable=true)
    public static List<GOL_Record_vs_Input_Fields_Mapping__mdt> getInputFieldsMappingRecords() {
        return [SELECT DeveloperName, Field_API_Name__c,Input_Fields_Name__c,Object_API_Name__c FROM GOL_Record_vs_Input_Fields_Mapping__mdt];
    }

    public class Request {
        @InvocableVariable
        public Id quoteId;
        
        @InvocableVariable
        public String quotePayload;

        @InvocableVariable
        public Id financeQuoteId;
    }

    public class Response {
        @InvocableVariable
        public Boolean isSuccess;
        
        @InvocableVariable
        public String message;
        
        @InvocableVariable
        public Id financeQuoteId;
    }

}