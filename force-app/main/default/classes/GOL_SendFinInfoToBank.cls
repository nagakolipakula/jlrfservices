public with sharing class GOL_SendFinInfoToBank {

    @Future(callout=true)
    public static void sendFinanceContextRequest(String financeInfoId) {
        LMS_FinanceInformation__c financeRecord = fetchFinanceRecord(financeInfoId);
        if (financeRecord == null) {
            System.debug('Finance record not found for Id: ' + financeInfoId);
            return;
        }
        
        GOL_JSON2ApexFinancialQuoteWrapper payload = mapFinanceRecordToPayload(financeRecord);
        String requestBody = JSON.serialize(payload);
        
        System.debug('Request Body: ' + requestBody);
        sendHttpRequest(financeInfoId, requestBody);
    }

    // To send HTTP request
    private static void sendHttpRequest(String financeInfoId, String requestBody) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        String endpoint = 'callout:GOL_MS_Finance/' + Label.GOL_Get_Finance_Quote_End_Point + financeInfoId + '/context';
        request.setEndpoint(endpoint);
        request.setMethod('POST');
        request.setTimeout(20000);
        request.setBody(requestBody);
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        
        try {
            HttpResponse response = http.send(request);
            System.debug('Response Status: ' + response.getStatus());
            System.debug('Response Body: ' + response.getBody());
        } catch (CalloutException e) {
            System.debug('Callout failed: ' + e.getMessage());
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
    private static GOL_JSON2ApexFinancialQuoteWrapper mapFinanceRecordToPayload(LMS_FinanceInformation__c financeRecord) {
        GOL_JSON2ApexFinancialQuoteWrapper payload = new GOL_JSON2ApexFinancialQuoteWrapper();

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
        payload.quote = new GOL_JSON2ApexFinancialQuoteWrapper.Quote();
        payload.quote.annualMileage = financeRecord.LMS_FIN_Annual_Contract_Mileage__c != null ? Integer.valueOf(financeRecord.LMS_FIN_Annual_Contract_Mileage__c) : 0;
        payload.quote.duration = financeRecord.LMS_FIN_Term__c != null ? Integer.valueOf(financeRecord.LMS_FIN_Term__c) : 0;
        payload.quote.downPaymentGrossAmount = financeRecord.LMS_FIN_Deposit__c != null ? financeRecord.LMS_FIN_Deposit__c : 0;
        payload.quote.totalGrossAmount = financeRecord.ERPT_FIN_TotalGrossAmt__c != null ? financeRecord.ERPT_FIN_TotalGrossAmt__c : 0;
        payload.quote.installmentGrossAmount = financeRecord.ERPT_FIN_InstallmentIntGrossAmt__c != null ? financeRecord.ERPT_FIN_InstallmentIntGrossAmt__c : 0;
        
        //FinancialProduct
        payload.financialProduct = new GOL_JSON2ApexFinancialQuoteWrapper.FinancialProduct();
        // payload.financialProduct.id = '';
        payload.financialProduct.name = '';
        payload.financialProduct.currencyCode = '';
        // payload.financialProduct.rateType = new List<String>();
        // payload.financialProduct.financialProductCategory = new GOL_JSON2ApexFinancialQuoteWrapper.FinancialProductCategory();
        // payload.financialProduct.financialProductCategory.code = '';
        // payload.financialProduct.financialProductCategory.name = '';
        // payload.financialProduct.financialProductCategory.description = '';
        
        //Products
        payload.products = new GOL_JSON2ApexFinancialQuoteWrapper.Products();
        payload.products.inputFields = new GOL_JSON2ApexFinancialQuoteWrapper.InputFields();
        payload.products.inputFields.downPaymentGrossAmountRange = new GOL_JSON2ApexFinancialQuoteWrapper.AmountRange();
        payload.products.inputFields.downPaymentGrossAmountRange.selectedValue = 0;
        payload.products.inputFields.downPaymentNetAmountRange = new GOL_JSON2ApexFinancialQuoteWrapper.AmountRange();
        payload.products.inputFields.downPaymentNetAmountRange.selectedValue = 0;
        payload.products.units = new GOL_JSON2ApexFinancialQuoteWrapper.Units();
        payload.products.units.currencyCode = '';
        payload.products.units.durationTimeUnit = '';

        // Map CPI and Non-CPI Products
        payload.products.cpiProducts = new GOL_JSON2ApexFinancialQuoteWrapper.Product();
        payload.products.cpiProducts.financialProductId = '';
        payload.products.cpiProducts.name = '';
        payload.products.cpiProducts.description = '';
        payload.products.cpiProducts.id = '';
        
        payload.products.nonCpiProducts = new GOL_JSON2ApexFinancialQuoteWrapper.Product();
        payload.products.nonCpiProducts.financialProductId = '';
        payload.products.nonCpiProducts.name = '';
        payload.products.nonCpiProducts.description = '';
        payload.products.nonCpiProducts.id = '';
        
        return payload;
    }
}