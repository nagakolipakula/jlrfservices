@isTest
public with sharing class GOL_SendFinInfoToBank_Tests {

    @isTest
    static void isSuccess() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());

        LMS_FinanceInformation__c financeInfo = [SELECT Id FROM LMS_FinanceInformation__c LIMIT 1];

        Test.startTest();
        String response = GOL_SendFinInfoToBank.sendFinanceContextRequest(financeInfo.Id);
        Test.stopTest();

        System.assertNotEquals(null, response, 'Response should not be null');
        System.assert(response.contains('"quoteId"'), 'Response should contain quote externalId');
        
        LMS_FinanceInformation__c updatedRecord = [SELECT LMS_FIN_SysLink__c FROM LMS_FinanceInformation__c WHERE Id = :financeInfo.Id];
        System.assertNotEquals(null, updatedRecord.LMS_FIN_SysLink__c, 'LMS_FIN_SysLink__c should be updated');
    }

    @isTest
    static void invalidInput() {
        String response = GOL_SendFinInfoToBank.sendFinanceContextRequest(null);
        System.assertEquals('Finance record not found', response, 'Should return finance record not found message');
    }

    @isTest
    static void apiCalloutFailure() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseError());

        LMS_FinanceInformation__c financeInfo = [SELECT Id FROM LMS_FinanceInformation__c LIMIT 1];

        Test.startTest();
        String response = GOL_SendFinInfoToBank.sendFinanceContextRequest(financeInfo.Id);
        Test.stopTest();

        System.assert(response.contains('NOT_FOUND'), 'Response should contain error message');
    }

    // Mock successful HTTP response
    private class MockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"quoteId": "ab01s236-0101-7010-0145-RSabef4ABABC",'
                       + '"typeOfUse": "PROFESSIONAL",'
                       + '"channel": "POS",'
                       + '"personType": "LEGAL"'
                       + '}');
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

    @testSetup
    static void dataSetup() {
        LMS_TriggerHandler.turnOffTriggers = true;
        
        ERPT_Datafactory.initEnvironment();
        
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

        LMS_FinanceInformation__c financeInfo = new LMS_FinanceInformation__c(
            LMS_FIN_Quote__c = quote.Id,
            LMS_FIN_Lead__c = newOpp.Id,
            LMS_FIN_Term__c = 36,
            LMS_FIN_Deposit__c = 5000,
            LMS_FIN_Annual_Contract_Mileage__c = 15000,
            ERPT_FIN_TotalGrossAmt__c = 50000,
            ERPT_FIN_InstallmentIntGrossAmt__c = 1200,
            GOL_Type_Of_Use__c = 'PROFESSIONAL',
            GOL_Channel__c = 'POS',
            GOL_Person_Type__c = 'LEGAL'
        );
        insert financeInfo;
    }
}