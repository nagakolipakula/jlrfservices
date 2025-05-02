@isTest
private class GOL_FinanceUpdateRetailerDiscountQLITest {

    static LMS_DataFactory.QuoteWithRelationsWrap testData;
    static LMS_QuoteLineItem__c qli;

    @testSetup
    static void setup() {
        LMS_DataFactory.initEnvironment();

            testData = LMS_DataFactory.initQuoteWithObjects(
            'testuser_' + Datetime.now().getTime(),
            'NSC Test',
            'Prospect Test',
            'Test Opp',
            LMS_Constants.USR_JOB_ROLE_EXECUTIVE
        );

        LMS_Showroom__c sr = LMS_DataFactory.createShowroom();
        insert sr;

        System.runAs(testData.portalUser) {
            testData.quote.LMS_QUO_Status__c = LMS_QuoteHelper.STATUS_DRAFT;
            testData.quote.LMS_QUO_SalesCountry__c = 'FR';
            testData.quote.LMS_QUO_ShowroomId__c = sr.Id;
            update testData.quote;

            qli = LMS_DataFactory.fetchQuoteLineItem(testData.quote.Id, 100000, 1, null);
            insert qli;
        }
    }

    @isTest
    static void testUpdateRetailerDiscount() {
        Test.startTest();

        GOL_FinanceUpdateRetailerDiscountQLI.RequestQLIWrapper wrapper = new GOL_FinanceUpdateRetailerDiscountQLI.RequestQLIWrapper();
        wrapper.quoteLineItemId = qli.Id;
        wrapper.retailerdiscountpercent = 5.0;
        wrapper.retailerdiscountAmount = 200.0;
        wrapper.retailerdiscountNetAmount2 = 150.0;
        wrapper.retailerdiscountamountInclVal = 180.0;

        String result = GOL_FinanceUpdateRetailerDiscountQLI.updateRetailerDiscount(wrapper);
        Test.stopTest();

        LMS_QuoteLineItem__c updated = [
            SELECT LMS_QLI_DiscountPercent__c, LMS_QLI_DiscountAmount__c,
                   LMS_QLI_DiscountNetAmount2__c, LMS_QLI_TaxAdjust__c
            FROM LMS_QuoteLineItem__c
            WHERE Id = :qli.Id
        ];

        System.assertEquals(5.0, updated.LMS_QLI_DiscountPercent__c);
        System.assertEquals(200.0, updated.LMS_QLI_DiscountAmount__c);
        System.assertEquals(150.0, updated.LMS_QLI_DiscountNetAmount2__c);
        System.assertEquals(180.0, updated.LMS_QLI_TaxAdjust__c);
        System.assertEquals('success', result);
    }

    @isTest
    static void testUpdateRetailerDiscount_NullWrapper() {
        Test.startTest();
        String result = GOL_FinanceUpdateRetailerDiscountQLI.updateRetailerDiscount(null);
        Test.stopTest();
        System.assert(result.contains('Invalid input'));
    }

    @isTest
    static void testUpdateRetailerDiscount_InvalidId() {
        GOL_FinanceUpdateRetailerDiscountQLI.RequestQLIWrapper wrapper = new GOL_FinanceUpdateRetailerDiscountQLI.RequestQLIWrapper();
        wrapper.quoteLineItemId = null;
        wrapper.retailerdiscountpercent = 5.0;

        Test.startTest();
        String result = GOL_FinanceUpdateRetailerDiscountQLI.updateRetailerDiscount(wrapper);
        Test.stopTest();
        System.assert(result.contains('Invalid input'));
    }
}