@isTest
public with sharing class GOL_GetUpdatedFinanceQuote_Tests {

    @isTest
    static void isSuccess() {
        Test.setMock(HttpCalloutMock.class, new MockCalloutSuccess());

        LMS_FinanceInformation__c finance = [SELECT Id, LMS_FIN_Quote__c FROM LMS_FinanceInformation__c LIMIT 1];

        Test.startTest();
        List<GOL_GetUpdatedFinanceQuote.Response> responses = GOL_GetUpdatedFinanceQuote.updateFinanceQuotes(
            finance.LMS_FIN_Quote__c,
            new List<Id>{ finance.Id }
        );
        Test.stopTest();

        System.assertEquals(1, responses.size());
        System.assert(responses[0].isSuccess);
        System.assertEquals(finance.Id, responses[0].financeQuoteId);
    }

    @isTest
    static void isSuccessWithMoreThanOneFinInfoRecords() {
        Test.setMock(HttpCalloutMock.class, new MockCalloutSuccess());

        LMS_Quote__c quote = [SELECT Id FROM LMS_Quote__c LIMIT 1];

        LMS_FinanceInformation__c firstFinInfoRecord = [SELECT LMS_FIN_Term__c, LMS_FIN_Deposit__c, LMS_FIN_Annual_Contract_Mileage__c,
                                                LMS_FIN_ProdName__c, LMS_FIN_FinanceInstitution__c, LMS_FIN_Finance_Reference__c,
                                                CurrencyIsoCode, ERPT_FIN_CreditTimeUoM__c, GOL_Channel__c, GOL_Person_Type__c,
                                                GOL_Type_Of_Use__c, GOL_Zip_Postal_Code__c, LMS_FIN_Quote__c, LMS_FIN_Lead__c
                                        FROM LMS_FinanceInformation__c
                                        LIMIT 1];

        LMS_FinanceInformation__c secondFinInfoRecord = firstFinInfoRecord.clone(false, true, false, false);
        secondFinInfoRecord.LMS_FIN_Lead__c = firstFinInfoRecord.LMS_FIN_Lead__c;
        insert secondFinInfoRecord;
                                        

        ERPT_FinanceItem__c item2 = new ERPT_FinanceItem__c(
            ERPT_FII_FinanceInformation__c = secondFinInfoRecord.Id,
            RecordTypeId = Schema.SObjectType.ERPT_FinanceItem__c.getRecordTypeInfosByDeveloperName().get('ERPT_FII_FixedCost').getRecordTypeId(),
            ERPT_FII_ExternalRef__c = 'CPI_002',
            ERPT_FII_financialProductRef__c = 'FIN_PROD_002',
            ERPT_FII_FullName__c = 'Test Product 2',
            ERPT_FII_Description__c = 'Description 2'
        );
        insert item2;

        List<LMS_FinanceInformation__c> records = [SELECT Id FROM LMS_FinanceInformation__c WHERE LMS_FIN_Quote__c = :quote.Id];

        Test.startTest();
        List<GOL_GetUpdatedFinanceQuote.Response> responses = GOL_GetUpdatedFinanceQuote.updateFinanceQuotes(
            quote.Id,
            new List<Id>{ records[0].Id, records[1].Id }
        );
        Test.stopTest();

        System.assertEquals(2, responses.size(), 'Expected two responses');
        for (GOL_GetUpdatedFinanceQuote.Response resp : responses) {
            System.assert(resp.isSuccess, 'Each response should be success');
            System.assertNotEquals(null, resp.financeQuoteId, 'Each response should have a financeQuoteId');
        }
    }

    @isTest
    static void onWrongQuoteId() {
        LMS_FinanceInformation__c finance = [SELECT Id FROM LMS_FinanceInformation__c LIMIT 1];

        Id wrongQuoteId = 'a00000000000000AAA';

        Test.startTest();
        List<GOL_GetUpdatedFinanceQuote.Response> responses = GOL_GetUpdatedFinanceQuote.updateFinanceQuotes(
            wrongQuoteId,
            new List<Id>{ finance.Id }
        );
        Test.stopTest();

        System.assertEquals(1, responses.size());
        System.assert(!responses[0].isSuccess);
        System.assert(responses[0].message.contains('Mismatched quoteId'));
    }

    @isTest
    static void onApiError() {
        Test.setMock(HttpCalloutMock.class, new MockCalloutError());

        LMS_FinanceInformation__c finance = [SELECT Id, LMS_FIN_Quote__c FROM LMS_FinanceInformation__c LIMIT 1];

        Test.startTest();
        List<GOL_GetUpdatedFinanceQuote.Response> responses = GOL_GetUpdatedFinanceQuote.updateFinanceQuotes(
            finance.LMS_FIN_Quote__c,
            new List<Id>{ finance.Id }
        );
        Test.stopTest();

        System.assertEquals(1, responses.size());
        System.assert(!responses[0].isSuccess);
        System.assert(responses[0].message.contains('API Error'));

        List<LMS_Exception__c> exceptions = [
            SELECT LMS_EXC_Message__c FROM LMS_Exception__c WHERE LMS_EXC_Type__c = 'GOL_GetUpdatedFinanceQuote'
        ];
        System.assert(!exceptions.isEmpty(), 'Expected exception log on API error');
        System.assert(exceptions[0].LMS_EXC_Message__c.contains(finance.Id));
    }

    @isTest
    static void isFailure() {
        Test.setMock(HttpCalloutMock.class, new MockCalloutThrows());

        LMS_FinanceInformation__c finance = [SELECT Id, LMS_FIN_Quote__c FROM LMS_FinanceInformation__c LIMIT 1];

        Test.startTest();
        List<GOL_GetUpdatedFinanceQuote.Response> responses = GOL_GetUpdatedFinanceQuote.updateFinanceQuotes(
            finance.LMS_FIN_Quote__c,
            new List<Id>{ finance.Id }
        );
        Test.stopTest();

        System.assertEquals(1, responses.size());
        System.assert(!responses[0].isSuccess);
        System.assert(responses[0].message.contains('Callout Exception'));

        List<LMS_Exception__c> exceptions = [
            SELECT LMS_EXC_Message__c, LMS_EXC_StackTrace__c FROM LMS_Exception__c WHERE LMS_EXC_Type__c = 'GOL_GetUpdatedFinanceQuote'
        ];
        System.assert(!exceptions.isEmpty(), 'Expected exception log from thrown error');
    }

    //Test data prep
    @testSetup
    static void dataSetup(){
        
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
            RecordTypeId = Schema.SObjectType.LMS_FinanceInformation__c.getRecordTypeInfosByDeveloperName().get(GOL_Constants.LMS_FIN_CENTRAL_FINANCING_RT).getRecordTypeId(),
            LMS_FIN_Quote__c = quote.Id,
            LMS_FIN_Lead__c = newOpp.Id,
            GOL_Type_Of_Use__c = 'PRIVATE',
            GOL_Channel__c = 'POS',
            GOL_Person_Type__c = 'PHYSICAL',
            LMS_FIN_SysLink__c = null,
            LMS_FIN_Status__c = null
        );
        insert financeInfo;

        ERPT_FinanceItem__c finItem = new ERPT_FinanceItem__c(
            ERPT_FII_FinanceInformation__c  = financeInfo.Id,
            RecordTypeId = Schema.SObjectType.ERPT_FinanceItem__c.getRecordTypeInfosByDeveloperName()
                .get('ERPT_FII_FixedCost').getRecordTypeId(),
            ERPT_FII_ExternalRef__c = 'CPI001',
            ERPT_FII_financialProductRef__c = 'FP001',
            ERPT_FII_FullName__c = 'Insurance',
            ERPT_FII_Description__c = 'CPI Basic'
        );
        insert finItem;
    }
    
    //Http Region helpers
    private class MockCalloutSuccess implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{' +
                '"quote": {"duration": 48, "downPaymentGrossAmount": 2000, "annualMileage": 18000},' +
                '"channel": "Web", "personType": "Corporate", "typeOfUse": "Commercial",' +
                '"financialProduct": {"name": "Lease Updated"}' +
            '}');
            return res;
        }
    }

    private class MockCalloutError implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            res.setBody('{"error":"Server error"}');
            return res;
        }
    }

    private class MockCalloutThrows implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            throw new CalloutException('Simulated callout failure');
        }
    }    
}