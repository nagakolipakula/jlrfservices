public with sharing class GOL_GetFinanceQuote {
    
    private static String FULL_FINANCE_GET_QUOTE_ENDPOINT;
    private static String FULL_FINANCE_GET_QUOTE_X_CLIENT_ORIGIN;

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
                if(parsedResponse.cpiProducts != null && parsedResponse.cpiProducts.size() > 0){
                    createFinanceItemsCpiProducts(financeRecordId, parsedResponse.cpiProducts);
                }
                if(parsedResponse.nonCpiProducts != null && parsedResponse.nonCpiProducts.size() > 0){
                    createFinanceItemsNonCpiProducts(financeRecordId, parsedResponse.nonCpiProducts);
                }
                if(parsedResponse.financialProduct.services != null && parsedResponse.financialProduct.services.size() > 0){
                    createFinanceItemsServices(financeRecordId, parsedResponse.financialProduct.services);
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

    public static HttpResponse sendFinanceQuoteRequest(String quotePayload) {
        //Label.GOL_Get_Finance_Quote_End_Point, Label.GOL_FS_X_Client_origin
        FULL_FINANCE_GET_QUOTE_ENDPOINT = LMS_CST_IntegrationEndpoint__c.getInstance(GOL_Constants.FULL_FINANCE_GET_QUOTE_API).LMS_CST_EndpointAddress__c;
        FULL_FINANCE_GET_QUOTE_X_CLIENT_ORIGIN = LMS_CST_IntegrationEndpoint__c.getInstance(GOL_Constants.FULL_FINANCE_GET_QUOTE_API).LMS_CST_Scope__c;

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:GOL_MS_Finance/' + FULL_FINANCE_GET_QUOTE_ENDPOINT);
        request.setMethod('POST');
        request.setTimeout(20000);
        request.setBody(quotePayload);
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('X-Client-origin', FULL_FINANCE_GET_QUOTE_X_CLIENT_ORIGIN);
        return http.send(request);
    }

    public static Id createFinanceInformationRecord(String quoteId, GOL_JSON2ApexFinancialQuoteWrapper parsedResponse,String financeQuoteIdOld) {
        if (parsedResponse == null) {
            return null;
        }
        
        LMS_FinanceInformation__c financeInformation = new LMS_FinanceInformation__c();

        

        if(!String.isEmpty(financeQuoteIdOld)){
            financeInformation.Id = financeQuoteIdOld;
        }else{
            financeInformation.LMS_FIN_Lead__c = getSalesLead(quoteId);
            LMS_Quote__c quote = [SELECT Name FROM LMS_Quote__c WHERE Id = :quoteId LIMIT 1];
            Integer existingFinRecCount = [SELECT COUNT() FROM LMS_FinanceInformation__c WHERE LMS_FIN_Quote__c = :quoteId];
            Integer count = existingFinRecCount + 1;
            String suffix = String.valueOf(1000 + count).mid(1, 3);
            String JLRIdRef = quote.Name + ' - ' + suffix;

            financeInformation.GOL_JLR_QUOTE_FIN_ID__c = JLRIdRef;
        }
        
        financeInformation.LMS_FIN_Quote__c = quoteId;
        financeInformation.RecordTypeId = Schema.SObjectType.LMS_FinanceInformation__c.getRecordTypeInfosByDeveloperName().get(GOL_Constants.LMS_FIN_CENTRAL_FINANCING_RT).getRecordTypeId();
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
        financeInformation.GOL_Age_Range__c  = parsedResponse.ageRange;
        financeInformation.GOL_Zip_Postal_Code__c = parsedResponse.zipCode;
        // financeInformation.GOL_JLR_QUOTE_FIN_ID__c = JLRIdRef;

        financeInformation.LMS_FIN_Status__c = GOL_Constants.LMS_FIN_Status_FINANCE_Created;
        if (parsedResponse.quoteDetails != null && parsedResponse.quoteDetails.size() > 0) {
            financeInformation.GOL_View_Quote_Details__c = JSON.serialize(parsedResponse.quoteDetails);
        }
        financeInformation.GOL_FIN_Finance_Product_Description__c = parsedResponse.FinancialProduct.description; //GOL-4251
        upsert financeInformation;
        return financeInformation.Id;
    }

    public static void deleteFinanceItems(String financeInformationId){
        List<ERPT_FinanceItem__c> lstFinanceItems = [SELECT Id FROM ERPT_FinanceItem__c WHERE ERPT_FII_FinanceInformation__c = :financeInformationId];
        if(!lstFinanceItems.isEmpty()){
            delete lstFinanceItems;
        }
    }

    public static void createFinanceItemsFixedCosts(String financeInformationId,List<GOL_JSON2ApexFinancialQuoteWrapper.FixedCost> fixedCosts) {
        // if (fixedCosts == null) {
        //     return null;
        // }
        List<ERPT_FinanceItem__c> lstFinanceItems = new List<ERPT_FinanceItem__c>();
        for(GOL_JSON2ApexFinancialQuoteWrapper.FixedCost fixedCost : fixedCosts) {
            ERPT_FinanceItem__c financeItem = new ERPT_FinanceItem__c();
            financeItem.ERPT_FII_FinanceInformation__c = financeInformationId;
            financeItem.RecordTypeId = Schema.SObjectType.ERPT_FinanceItem__c.getRecordTypeInfosByDeveloperName().get(GOL_Constants.ERPT_FII_FIXEDCOST_RT).getRecordTypeId();
            financeItem.ERPT_FII_Description__c = fixedCost.name;
            financeItem.ERPT_FII_FullName__c = fixedCost.name;
            financeItem.ERPT_FII_GrossAmount__c = fixedCost.grossAmount;
            lstFinanceItems.add(financeItem);
        }
        if (!lstFinanceItems.isEmpty()) {
            insert lstFinanceItems;
        }
    }

    public static void createFinanceItemsCpiProducts(String financeInformationId,List<GOL_JSON2ApexFinancialQuoteWrapper.CpiProducts> cpiProducts) {
        List<ERPT_FinanceItem__c> lstFinanceItems = new List<ERPT_FinanceItem__c>();
        for(GOL_JSON2ApexFinancialQuoteWrapper.CpiProducts cpiProduct : cpiProducts) {
            ERPT_FinanceItem__c financeItem = new ERPT_FinanceItem__c();
            financeItem.ERPT_FII_FinanceInformation__c = financeInformationId;
            financeItem.RecordTypeId = Schema.SObjectType.ERPT_FinanceItem__c.getRecordTypeInfosByDeveloperName().get(GOL_Constants.ERPT_FII_CPIPRODUCT_RT).getRecordTypeId();
            financeItem.ERPT_FII_ExternalRef__c = cpiProduct.id;
            financeItem.ERPT_FII_financialProductRef__c = cpiProduct.financialProductId;
            financeItem.ERPT_FII_FullName__c = cpiProduct.name;
            //financeItem.ERPT_FII_premiumPeriodAmount__c = cpiProduct.monthlyCost;

            lstFinanceItems.add(financeItem);
        }
        if (!lstFinanceItems.isEmpty()){
            insert lstFinanceItems;
        }
    }

    public static void createFinanceItemsNonCpiProducts(String financeInformationId,List<GOL_JSON2ApexFinancialQuoteWrapper.NonCpiProducts> nonCpiProducts) {
        List<ERPT_FinanceItem__c> lstFinanceItems = new List<ERPT_FinanceItem__c>();
        for(GOL_JSON2ApexFinancialQuoteWrapper.NonCpiProducts nonCpiProduct : nonCpiProducts) {
            ERPT_FinanceItem__c financeItem = new ERPT_FinanceItem__c();
            financeItem.ERPT_FII_FinanceInformation__c = financeInformationId;
            financeItem.RecordTypeId = Schema.SObjectType.ERPT_FinanceItem__c.getRecordTypeInfosByDeveloperName().get(GOL_Constants.ERPT_FII_NONCPIPRODUCT_RT).getRecordTypeId();
            financeItem.ERPT_FII_ExternalRef__c = nonCpiProduct.id;
            financeItem.ERPT_FII_financialProductRef__c = nonCpiProduct.financialProductId;
            financeItem.ERPT_FII_FullName__c = nonCpiProduct.name;
            //financeItem.ERPT_FII_premiumPeriodAmount__c = nonCpiProduct.monthlyCost;
            
            lstFinanceItems.add(financeItem);
        }
        
        if (!lstFinanceItems.isEmpty()){
            insert lstFinanceItems;
        }
       
    }

    public static void createFinanceItemsServices(String financeInformationId,List<GOL_JSON2ApexFinancialQuoteWrapper.Services> services) {
        List<ERPT_FinanceItem__c> lstFinanceItems = new List<ERPT_FinanceItem__c>();
        for(GOL_JSON2ApexFinancialQuoteWrapper.Services service : services) {
            // if(!service.serviceValue.excluded){
                ERPT_FinanceItem__c financeItem = new ERPT_FinanceItem__c();
                financeItem.ERPT_FII_FinanceInformation__c = financeInformationId;
                financeItem.RecordTypeId = Schema.SObjectType.ERPT_FinanceItem__c.getRecordTypeInfosByDeveloperName().get(GOL_Constants.ERPT_FII_ARVAL_ADDITIONAL_FIELDS_RT).getRecordTypeId();
                financeItem.ERPT_FII_Description__c = service.label;
                financeItem.ERPT_FII_ExternalRef__c = service.serviceId;
                financeItem.ERPT_FII_FullName__c = service.serviceValue.label;
                financeItem.ERPT_FII_Value__c = service.serviceValue.value;
                financeItem.GOL_FII_Excluded__c = service.serviceValue.excluded;
                lstFinanceItems.add(financeItem);
            // }
        }
        
        if (!lstFinanceItems.isEmpty()){
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
        public String financeQuoteId;
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