@isTest
public class GOL_FinanceUpdateRetailerDiscountQLITest {

    @testSetup
    static void DataSetup() {
        // Turn off triggers
        LMS_TriggerHandler.turnOffTriggers = true;
        
        // Initialize environment
        ERPT_Datafactory.initEnvironment();

        // Inserting Integration Endpoint
        LMS_CST_IntegrationEndpoint__c accesstoken = new LMS_CST_IntegrationEndpoint__c(
            Name = GOL_Constants.FULL_FINANCE_GET_QUOTE_API,
            LMS_CST_EndpointAddress__c = 'v2/finance/quote',
            LMS_CST_Scope__c = 'SMART'
        );
        insert accesstoken;

        // Accounts Creation and insertion 
        Account acc = ERPT_DataFactory.createAccount('Test Italy Account', 'LMS_ACC_SalesCountry');
        acc.LMS_ACC_NSC_Reference__c = 'IT';
        insert acc;

        Account retAcc = ERPT_DataFactory.createAccount('Test Italy Retailer Account', 'LMS_ACC_Retailer');
        retAcc.LMS_ACC_NSC_Reference__c = 'IT';
        retAcc.Type = 'Virtual';
        insert retAcc;

        Account indAcc = ERPT_DataFactory.createAccount('Test Italy Individual Account', 'LMS_ACC_Individual');
        indAcc.LMS_ACC_NSC_Reference__c = 'IT';
        indAcc.Type = 'Virtual';
        insert indAcc;

        // Showroom Creation and insertion 
        LMS_Showroom__c shwroom = ERPT_DataFactory.createShowroom();
        shwroom.LMS_SWR_Retailer__c = retAcc.Id;
        insert shwroom;

        // Opportunity Creation and insertion 
        Opportunity newOpp = ERPT_DataFactory.createOpportunityWithAccount('Test Opp', indAcc);
        insert newOpp;

        // Quote Creation and insertion 
        LMS_Quote__C quote = LMS_DataFactory.createQuote(newOpp.Id);
        quote.LMS_QUO_ShowroomId__c = shwroom.Id;
        quote.LMS_QUO_Status__c = LMS_QuoteHelper.STATUS_DRAFT;
        quote.LMS_QUO_ExpirationDate__c = System.today() + 1;
        quote.EPRT_QUO_External_ID__c = 'AGJGDFD975443DD';
        insert quote;

        // fiscal plan Creation and insertion  
        LMS_FiscalPlan__c newFiscalPlan = ERPT_DataFactory.createFiscalPlan('Test Fiscal Plan');
        newFiscalPlan.LMS_FPL_Market__c = 'IT';
        newFiscalPlan.LMS_FPL_Valid__c = true;
        newFiscalPlan.LMS_FPL_LastFiscalDate__c = Date.today().addDays(1);
        insert newFiscalPlan;
        
        // LMS_QuoteLineItem__c test record creation
        LMS_QuoteLineItem__c qli = new LMS_QuoteLineItem__c(
            LMS_QLI_DiscountPercent__c = 0.0, // Initializing with default values
            LMS_QLI_DiscountAmount__c = 0.0,
            LMS_QLI_DiscountNetAmount2__c = 0.0,
            LMS_QLI_TaxAdjust__c = 0.0
        );
        insert qli;  // Inserting test record
    }
    @isTest
    static void testUpdateRetailerDiscountWithSetup() {
        // LMS_QuoteLineItem__c test record
        LMS_QuoteLineItem__c qli = [SELECT Id FROM LMS_QuoteLineItem__c LIMIT 1];
        // Preparing request data wrapper
        GOL_FinanceUpdateRetailerDiscountQLI.RequestQLIWrapper requestDataWrapper = new GOL_FinanceUpdateRetailerDiscountQLI.RequestQLIWrapper();
        requestDataWrapper.quoteLineItemId = qli.Id;
        requestDataWrapper.retailerdiscountpercent = 10.0;
        requestDataWrapper.retailerdiscountAmount = 100.0;
        requestDataWrapper.retailerdiscountNetAmount2 = 90.0;
        requestDataWrapper.retailerdiscountamountInclVal = 95.0;

        // Test the updateRetailerDiscount method
        Test.startTest();
        String result = GOL_FinanceUpdateRetailerDiscountQLI.updateRetailerDiscount(requestDataWrapper);
        Test.stopTest();

        // Verify the updates
        qli = [SELECT LMS_QLI_DiscountPercent__c, LMS_QLI_DiscountAmount__c, LMS_QLI_DiscountNetAmount2__c, LMS_QLI_TaxAdjust__c FROM LMS_QuoteLineItem__c WHERE Id = :qli.Id];
        System.assertEquals(10.0, qli.LMS_QLI_DiscountPercent__c);
        System.assertEquals(100.0, qli.LMS_QLI_DiscountAmount__c);
        System.assertEquals(90.0, qli.LMS_QLI_DiscountNetAmount2__c);
        System.assertEquals(95.0, qli.LMS_QLI_TaxAdjust__c);
        
        System.assertEquals('success', result);
    }

	@isTest
	static void testInvalidDataException() {
        // Test with invalid QuoteLineItem ID)
        GOL_FinanceUpdateRetailerDiscountQLI.RequestQLIWrapper invalidRequestWrapper = new GOL_FinanceUpdateRetailerDiscountQLI.RequestQLIWrapper();
        invalidRequestWrapper.quoteLineItemId = null;

        Test.startTest();
        String result = GOL_FinanceUpdateRetailerDiscountQLI.updateRetailerDiscount(invalidRequestWrapper);
        Test.stopTest();

        // Assert that an error message is returned
        System.assert(result.contains('INVALID'));
    }
    
    @isTest
    static void testUpdateRetailerDiscountNullData() {
        // Test handling null request data
        Test.startTest();
        String result = GOL_FinanceUpdateRetailerDiscountQLI.updateRetailerDiscount(null);
        Test.stopTest();
        
        // Assert that no success message is returned
        System.assert(!result.equals('success'));
        System.assert(result.contains('null') || result.contains('INVALID'));
    }
}