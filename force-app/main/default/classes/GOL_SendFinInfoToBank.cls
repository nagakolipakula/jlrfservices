public with sharing class GOL_SendFinInfoToBank {

    public static String sendFinanceContextRequest(String financeInfoId) {
        LMS_FinanceInformation__c financeRecord = fetchFinanceRecord(financeInfoId);
        if (financeRecord == null) {
            System.debug('Finance record not found for Id: ' + financeInfoId);
            return 'Finance record not found';
        }
        GOL_SendFinInfoToBankWrapper payload = mapFinanceRecordToPayload(financeRecord);
        String requestBody = JSON.serialize(payload);
        System.debug('Request Body: ' + requestBody);
        return sendHttpRequest(financeInfoId, requestBody);
    }

    private static String sendHttpRequest(String financeInfoId, String requestBody) {
        HttpResponse response = executeHttpPost(financeInfoId, requestBody);
    
        if (response == null) {
            return 'Callout failed: No response received';
        }
        System.debug('Response Status: ' + response.getStatus());
        System.debug('Response Body: ' + response.getBody());
        if (response.getStatusCode() == 200) {
            processSuccessfulResponse(financeInfoId, response.getBody());
        }
        return response.getBody();
    }
    
    private static HttpResponse executeHttpPost(String financeInfoId, String requestBody) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            String endpoint = 'callout:GOL_MS_Finance/' + Label.GOL_Get_Finance_Quote_End_Point + '/' + financeInfoId + '/context';
            request.setEndpoint(endpoint);
            request.setMethod('POST');
            request.setTimeout(20000);
            request.setBody(requestBody);
            request.setHeader('Content-Type', 'application/json;charset=UTF-8');
            // System.debug('Endpoint URL: ' + endpoint);
            return http.send(request);
        } catch (CalloutException e) {
            System.debug('Callout failed: ' + e.getMessage());
            return null;
        }
    }
    
    private static void processSuccessfulResponse(String financeInfoId, String responseBody) {
        Map<String, Object> responseMap = parseJsonResponse(responseBody);
    
        if (responseMap != null && responseMap.containsKey('routeOut')) {
            Map<String, Object> routeOut = (Map<String, Object>) responseMap.get('routeOut');
            if (routeOut.containsKey('url')) {
                String systemLinkUrl = (String) routeOut.get('url');
                System.debug('Extracted URL: ' + systemLinkUrl);
                updateFinanceSystemLink(financeInfoId, systemLinkUrl);
            }
        }
    }
    
    private static Map<String, Object> parseJsonResponse(String jsonString) {
        try {
            return (Map<String, Object>) JSON.deserializeUntyped(jsonString);
        } catch (Exception e) {
            System.debug('JSON Parsing failed: ' + e.getMessage());
            return null;
        }
    }    

    //Update url to LMS_FIN_SysLink__c
    private static void updateFinanceSystemLink(String financeInfoId, String systemLinkUrl) {
        try {
            LMS_FinanceInformation__c financeRecord = new LMS_FinanceInformation__c(
                Id = financeInfoId,
                LMS_FIN_SysLink__c = systemLinkUrl
            );
            update financeRecord;
            System.debug('Successfully updated LMS_FIN_SysLink__c: ' + systemLinkUrl);
        } catch (Exception e) {
            System.debug('Failed to update LMS_FIN_SysLink__c: ' + e.getMessage());
        }
    }

    // Fetch Finance Information record
    private static LMS_FinanceInformation__c fetchFinanceRecord(String financeInfoId) {
        return [
            SELECT 
                LMS_FIN_Quote__c,
                LMS_FIN_Term__c,
                LMS_FIN_Deposit__c,
                LMS_FIN_Annual_Contract_Mileage__c,
                ERPT_FIN_TotalGrossAmt__c,
                ERPT_FIN_InstallmentIntGrossAmt__c,
                GOL_Type_Of_Use__c,
                GOL_Channel__c, 
                GOL_Person_Type__c
            FROM LMS_FinanceInformation__c 
            WHERE Id = :financeInfoId 
            LIMIT 1
        ];
    }

    // Make payload
    private static GOL_SendFinInfoToBankWrapper mapFinanceRecordToPayload(LMS_FinanceInformation__c financeRecord) {
        GOL_SendFinInfoToBankWrapper payload = new GOL_SendFinInfoToBankWrapper();

        String externalQuoteId = '';
        if (financeRecord.LMS_FIN_Quote__c != null) {
            LMS_Quote__c quoteRecord = [SELECT EPRT_QUO_External_ID__c FROM LMS_Quote__c WHERE Id = :financeRecord.LMS_FIN_Quote__c LIMIT 1];
            externalQuoteId = quoteRecord.EPRT_QUO_External_ID__c != null ? quoteRecord.EPRT_QUO_External_ID__c : '';
        }
        payload.quoteId = externalQuoteId;
        //payload.quoteId = financeRecord.LMS_FIN_Quote__c != null ? financeRecord.LMS_FIN_Quote__c : '';
        payload.typeOfUse = financeRecord.GOL_Type_Of_Use__c != null ? financeRecord.GOL_Type_Of_Use__c : 'PROFESSIONAL';
        payload.channel = financeRecord.GOL_Channel__c != null ? financeRecord.GOL_Channel__c : '';
        payload.personType = financeRecord.GOL_Person_Type__c != null ? financeRecord.GOL_Person_Type__c : 'LEGAL';

        //Quote details
        payload.quote = new GOL_SendFinInfoToBankWrapper.Quote();
        payload.quote.annualMileage = financeRecord.LMS_FIN_Annual_Contract_Mileage__c != null ? Integer.valueOf(financeRecord.LMS_FIN_Annual_Contract_Mileage__c) : 0;
        payload.quote.duration = financeRecord.LMS_FIN_Term__c != null ? Integer.valueOf(financeRecord.LMS_FIN_Term__c) : 0;
        payload.quote.downPaymentGrossAmount = financeRecord.LMS_FIN_Deposit__c != null ? financeRecord.LMS_FIN_Deposit__c : 0;
        payload.quote.totalGrossAmount = financeRecord.ERPT_FIN_TotalGrossAmt__c != null ? financeRecord.ERPT_FIN_TotalGrossAmt__c : 0;
        payload.quote.installmentGrossAmount = financeRecord.ERPT_FIN_InstallmentIntGrossAmt__c != null ? financeRecord.ERPT_FIN_InstallmentIntGrossAmt__c : 0;
        
        //FinancialProduct
        payload.financialProduct = new GOL_SendFinInfoToBankWrapper.FinancialProduct();
        payload.financialProduct.id = '';
        payload.financialProduct.name = '';
        payload.financialProduct.currencyCode = '';
        payload.financialProduct.rateType = new List<String>();
        payload.financialProduct.financialProductCategory = new GOL_SendFinInfoToBankWrapper.FinancialProductCategory();
        payload.financialProduct.financialProductCategory.code = '';
        payload.financialProduct.financialProductCategory.name = '';
        payload.financialProduct.financialProductCategory.description = '';
        
        //Products
        payload.products = new GOL_SendFinInfoToBankWrapper.Products();
        payload.products.inputFields = new GOL_SendFinInfoToBankWrapper.InputFields();
        payload.products.inputFields.downPaymentGrossAmountRange = new GOL_SendFinInfoToBankWrapper.AmountRange();
        payload.products.inputFields.downPaymentGrossAmountRange.selectedValue = 0;
        payload.products.inputFields.downPaymentNetAmountRange = new GOL_SendFinInfoToBankWrapper.AmountRange();
        payload.products.inputFields.downPaymentNetAmountRange.selectedValue = 0;
        payload.products.units = new GOL_SendFinInfoToBankWrapper.Units();
        payload.products.units.currencyCode = '';
        payload.products.units.durationTimeUnit = '';

        // Map CPI and Non-CPI Products
        payload.products.cpiProducts = new GOL_SendFinInfoToBankWrapper.Product();
        payload.products.cpiProducts.financialProductId = '';
        payload.products.cpiProducts.name = '';
        payload.products.cpiProducts.description = '';
        payload.products.cpiProducts.id = '';
        
        payload.products.nonCpiProducts = new GOL_SendFinInfoToBankWrapper.Product();
        payload.products.nonCpiProducts.financialProductId = '';
        payload.products.nonCpiProducts.name = '';
        payload.products.nonCpiProducts.description = '';
        payload.products.nonCpiProducts.id = '';
        
        return payload;
    }
}