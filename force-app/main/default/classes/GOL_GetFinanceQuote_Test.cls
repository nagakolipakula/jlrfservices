@isTest
public with sharing class GOL_GetFinanceQuote_Test {

    @testSetup
    static void dataSetup(){
        
        LMS_TriggerHandler.turnOffTriggers = true;
        
        ERPT_Datafactory.initEnvironment();

        LMS_CST_IntegrationEndpoint__c   accesstoken =  new LMS_CST_IntegrationEndpoint__c(
            Name = GOL_Constants.FULL_FINANCE_GET_QUOTE_API,
            LMS_CST_EndpointAddress__c = 'v2/finance/quote',
            LMS_CST_Scope__c = 'SMART');
        insert accesstoken;

        Account acc = ERPT_DataFactory.createAccount('Test Italy Account','LMS_ACC_SalesCountry');
        acc.LMS_ACC_NSC_Reference__c = 'IT';
        insert acc;
        
        Account retAcc = ERPT_DataFactory.createAccount('Test Italy Retailer Account','LMS_ACC_Retailer');
        retAcc.LMS_ACC_NSC_Reference__c = 'IT';
        retAcc.Type = 'Virtual';
        insert retAcc;    
        
        Account indAcc = ERPT_DataFactory.createAccount('Test Italy Indvidual Account','LMS_ACC_Individual');
        indAcc.LMS_ACC_NSC_Reference__c = 'IT';
        indAcc.Type = 'Virtual';
        insert indAcc;     
        
        LMS_Showroom__c shwroom = ERPT_DataFactory.createShowroom();
        shwroom.LMS_SWR_Retailer__c = retAcc.Id;
        insert shwroom;
        
        Opportunity newOpp = ERPT_DataFactory.createOpportunityWithAccount('Test Opp',indAcc);
        insert newOpp;
        
        LMS_Quote__C quote = LMS_DataFactory.createQuote(newOpp.Id);
        quote.LMS_QUO_ShowroomId__c = shwroom.Id;
        quote.LMS_QUO_Status__c = LMS_QuoteHelper.STATUS_DRAFT;
        quote.LMS_QUO_ExpirationDate__c = System.today() + 1;
        quote.EPRT_QUO_External_ID__c = 'AGJGDFD975443DD';
        insert quote;
        
        LMS_FiscalPlan__c newFiscalPlan =ERPT_DataFactory.createFiscalPlan('Test Fiscal Plan');
        newFiscalPlan.LMS_FPL_Market__c = 'IT';
        newFiscalPlan.LMS_FPL_Valid__c = true;
        newFiscalPlan.LMS_FPL_LastFiscalDate__c = Date.today().addDays(1);
        insert newFiscalPlan;  
    }

    @isTest
    static void testInvokeGetFinanceQuoteAPI_Success() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        LMS_Quote__c quote = [SELECT Id FROM LMS_Quote__c LIMIT 1];
       
        
        GOL_GetFinanceQuote.Request request = new GOL_GetFinanceQuote.Request();
        request.quoteId = quote.Id;
        request.quotePayload = '{"quoteId": "' + quote.Id + '", "amount": 50000}';
        
        List<GOL_GetFinanceQuote.Request> requestList = new List<GOL_GetFinanceQuote.Request>{request};
        
        Test.startTest();
        List<GOL_GetFinanceQuote.Response> responseList = GOL_GetFinanceQuote.invokeGetFinanceQuoteAPI(requestList);
        Test.stopTest();
        
        LMS_FinanceInformation__c financeInformation = [SELECT Id FROM LMS_FinanceInformation__c LIMIT 1];
        System.assertNotEquals(null, responseList);
        System.assertEquals(1, responseList.size());
        System.assertEquals(responseList[0].financeQuoteId, financeInformation.Id);
    }
    
    @isTest
    static void testInvokeGetFinanceQuoteAPI_InvalidInput() {
        GOL_GetFinanceQuote.Request request = new GOL_GetFinanceQuote.Request();
        List<GOL_GetFinanceQuote.Request> requestList = new List<GOL_GetFinanceQuote.Request>{request};
        
        List<GOL_GetFinanceQuote.Response> responseList = GOL_GetFinanceQuote.invokeGetFinanceQuoteAPI(requestList);
        
        System.assertNotEquals(null, responseList);
        System.assertEquals(1, responseList.size());
        System.assertEquals(false, responseList[0].isSuccess);
        System.assertEquals('Invalid input: quoteId or quotePayload is missing', responseList[0].message);
    }
    
    @isTest
    static void testInvokeGetFinanceQuoteAPI_APIError() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseError());
        LMS_Quote__c quote = [SELECT Id FROM LMS_Quote__c LIMIT 1];
        
        GOL_GetFinanceQuote.Request request = new GOL_GetFinanceQuote.Request();
        request.quoteId = quote.Id;
        request.quotePayload = '{"quoteId": "' + quote.Id + '", "amount": 50000}';
        
        List<GOL_GetFinanceQuote.Request> requestList = new List<GOL_GetFinanceQuote.Request>{request};
        
        Test.startTest();
        List<GOL_GetFinanceQuote.Response> responseList = GOL_GetFinanceQuote.invokeGetFinanceQuoteAPI(requestList);
        Test.stopTest();
        
        System.assertNotEquals(null, responseList);
        System.assertEquals(1, responseList.size());
        System.assertEquals(false, responseList[0].isSuccess);
        System.assert(responseList[0].message.contains('API Error'));
    }

    @isTest
    static void testGetInputFieldsMappingRecords() {
        Test.startTest();
        List<GOL_Record_vs_Input_Fields_Mapping__mdt> responseList = GOL_GetFinanceQuote.getInputFieldsMappingRecords();
        Test.stopTest();

       // System.assertNotEquals(null, responseList);
    }
    
    @isTest
    static void testGOL_JSON2ApexFinancialQuoteWrapper() {
        Test.startTest();
        GOL_JSON2ApexFinancialQuoteWrapper controller = new GOL_JSON2ApexFinancialQuoteWrapper(); 
        Test.stopTest();
    }

    private class MockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"Quote": {"duration": 36, "annualMileage": 15000, "totalGrossAmount": 50000, "installmentGrossAmount": 1200}, "FinancialProduct": {"name": "Lease", "fullId": "12345", "creditTimeUnit": "Months", "currencyCode": "USD" ,  "services": [ {"serviceId": "1","serviceValue": {"value": "MA_FORFAITRE","label": "Maintenance (Assistance Plus incluse)","excluded": false},"label": "Maintenance" }]}, "LegalDocument": {"title": "Finance Agreement", "body": "Terms and conditions..."}, '+ 
            ' "fixedCosts": [{"name": "Service Fee", "grossAmount": 500}] , "cpiProducts": [{"name": "CPIVV", "financialProductId": "7892" , "description": "LEASING Credito", "id": "CPIVV"}], "nonCpiProducts": [{"name": "CP", "financialProductId": "246" , "description": "LEASING Credito NON", "id": "CPI"}]}');
            return res;
        }
    }
    
    private class MockHttpResponseError implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            res.setBody('{"error": "Internal Server Error"}');
            return res;
        }
    }
}