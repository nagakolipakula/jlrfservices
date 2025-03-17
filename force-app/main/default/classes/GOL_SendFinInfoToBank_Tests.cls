@isTest
public with sharing class GOL_SendFinInfoToBank_Tests {
    @isTest
    static void isSuccess() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseSuccess());

        LMS_FinanceInformation__c financeInfo = [SELECT Id FROM LMS_FinanceInformation__c LIMIT 1];

        Test.startTest();
        GOL_SendFinInfoToBank.sendFinanceContextRequestAsync(financeInfo.Id);
        Test.stopTest();

        LMS_FinanceInformation__c updatedRecord = [SELECT LMS_FIN_SysLink__c FROM LMS_FinanceInformation__c WHERE Id = :financeInfo.Id];
        System.assertNotEquals(null, updatedRecord.LMS_FIN_SysLink__c, 'Field should be updated');
        System.assertEquals('https://webautotest.cetelem.es/jlr?token=1506621930093', updatedRecord.LMS_FIN_SysLink__c,
                            'LMS_FIN_SysLink__c should match the expected URL from response');
    }

    @isTest
    static void isFailure() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseError());

        LMS_FinanceInformation__c financeInfo = [SELECT Id, LMS_FIN_SysLink__c FROM LMS_FinanceInformation__c LIMIT 1];

        Test.startTest();
        GOL_SendFinInfoToBank.sendFinanceContextRequestAsync(financeInfo.Id);
        Test.stopTest();

        LMS_FinanceInformation__c updatedRecord = [SELECT LMS_FIN_SysLink__c FROM LMS_FinanceInformation__c WHERE Id = :financeInfo.Id];
        System.assertEquals(null, updatedRecord.LMS_FIN_SysLink__c, 'Field should not be updated when the callout fails');

        LMS_Exception__c loggedError = [SELECT LMS_EXC_Message__c FROM LMS_Exception__c LIMIT 1];
        System.assert(loggedError.LMS_EXC_Message__c.contains('Callout failed'), 'Callout failure should be logged in LMS_Exception__c');
    }

    @isTest
    static void isSuccessWithNoRouteOutUrl() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseNoRouteOutUrl());

        LMS_FinanceInformation__c financeInfo = [SELECT Id, LMS_FIN_SysLink__c FROM LMS_FinanceInformation__c LIMIT 1];

        Test.startTest();
        GOL_SendFinInfoToBank.sendFinanceContextRequestAsync(financeInfo.Id);
        Test.stopTest();

        LMS_FinanceInformation__c updatedRecord = [SELECT LMS_FIN_SysLink__c FROM LMS_FinanceInformation__c WHERE Id = :financeInfo.Id];
        System.assertEquals(null, updatedRecord.LMS_FIN_SysLink__c, 'Field should remain null when no routeOut.url is provided');

        LMS_Exception__c loggedError = [SELECT LMS_EXC_Message__c FROM LMS_Exception__c LIMIT 1];
        System.assert(loggedError.LMS_EXC_Message__c.contains('No valid system link URL in response'), 'Missing routeOut URL should be logged');
    }

    @isTest
    static void invalidFinanceRecord() {
        Test.startTest();
        GOL_SendFinInfoToBank.sendFinanceContextRequestAsync(null);
        Test.stopTest();

        List<LMS_Exception__c> loggedErrors = [SELECT LMS_EXC_Message__c FROM LMS_Exception__c];
        System.assert(loggedErrors.size() > 0, 'An exception should be logged in LMS_Exception__c for an invalid finance record.');
        System.assert(loggedErrors[0].LMS_EXC_Message__c.contains('Finance record not found'), 
                    'Invalid finance record should be logged in LMS_Exception__c');
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
        
        Account indAcc = ERPT_DataFactory.createAccount('Test Italy Individual Account','LMS_ACC_Individual');
        indAcc.LMS_ACC_NSC_Reference__c = 'IT';
        indAcc.Type = 'Virtual';
        insert indAcc;     
        
        LMS_Showroom__c shwroom = ERPT_DataFactory.createShowroom();
        shwroom.LMS_SWR_Retailer__c = retAcc.Id;
        insert shwroom;
        
        Opportunity newOpp = ERPT_DataFactory.createOpportunityWithAccount('Test Opp', indAcc);
        insert newOpp;
        
        LMS_Quote__C quote = LMS_DataFactory.createQuote(newOpp.Id);
        quote.LMS_QUO_ShowroomId__c = shwroom.Id;
        quote.LMS_QUO_Status__c = LMS_QuoteHelper.STATUS_DRAFT;
        quote.LMS_QUO_ExpirationDate__c = System.today() + 1;
        quote.EPRT_QUO_External_ID__c = 'ab01s236-0101-7010-0145-RSabdeuABABC';
        insert quote;

        LMS_FiscalPlan__c newFiscalPlan = ERPT_DataFactory.createFiscalPlan('Test Fiscal Plan');
        newFiscalPlan.LMS_FPL_Market__c = 'IT';
        newFiscalPlan.LMS_FPL_Valid__c = true;
        newFiscalPlan.LMS_FPL_LastFiscalDate__c = Date.today().addDays(1);
        insert newFiscalPlan;  

        LMS_FinanceInformation__c financeInfo = new LMS_FinanceInformation__c(
            LMS_FIN_Quote__c = quote.Id,
            LMS_FIN_Lead__c = newOpp.Id,
            GOL_Type_Of_Use__c = 'PRIVATE',
            GOL_Channel__c = 'POS',
            GOL_Person_Type__c = 'PHYSICAL',
            LMS_FIN_SysLink__c = null
        );
        insert financeInfo;
    }

    private class MockHttpResponseSuccess implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody(
                    '{"frontToolId": "1",'
                        + '"routeOut": {'
                        + '"url": "https://webautotest.cetelem.es/jlr?token=1506621930093",'
                        + '"httpVerb": "POST"'
                        + '},'
                        + '"quoteId": "ab01s236-0101-7010-0145-RSabdeuABABC",'
                        + '"fId": "a1RUD000000aFjh2AE"}');
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

    private class MockHttpResponseNoRouteOutUrl implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"frontToolId": "1",'
                        + '"routeOut": {'
                        + '"httpVerb": "POST"'
                        + '},'
                        + '"quoteId": "ab01s236-0101-7010-0145-RSabdeuABABC",'
                        + '"fId": "a1RUD000000aFjh2AE"}');
            return res;
        }
    }
}