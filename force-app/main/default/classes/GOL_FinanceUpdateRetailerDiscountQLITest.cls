@isTest
private class GOL_FinanceUpdateRetailerDiscountQLITest {

    static User salesUser;
    static User adminUser;
    static Account retailer;
    static Opportunity opp;
    static LMS_Quote__c quote;
    static LMS_QuoteLineItem__c qli;

    @testSetup
    static void setup() {
        createInitRecords();
    }

    private static void createInitRecords() {
        LMS_DataFactory.initEnvironment();

        // Create Contact
        Contact contact = LMS_DataFactory.createCommunityContact();
        contact.LastName = 'TestUser';
        insert contact;

        // Create Sales User
        String Username = 'testuser_' + Datetime.now().getTime() + '@lms.com';
        salesUser = LMS_DataFactory.createUserWithJobRole(Username, LMS_Constants.USR_JOB_ROLE_EXECUTIVE);
        salesUser.ContactId = contact.Id;
        insert salesUser;
        LMS_DataFactory.assignCommunityPermissions(salesUser, LMS_Constants.PERMISSIONS_BY_JOBROLE.get(LMS_Constants.USR_JOB_ROLE_EXECUTIVE));

        // Create Admin User
        adminUser = LMS_DataFactory.createUserWithProfile('admin@test.com', LMS_Constants.PROFILE_SYSTEM_ADMIN);
        adminUser.LMS_USR_TurnOffValidationRules__c = true;
        insert adminUser;

        // Create NSC Account
        Account nsc = LMS_DataFactory.createAccount('NSC Test', '111', '222', 'John', 'Doe', 'nsc@test.com', '12345', '67890', LMS_AccountHelper.RECORD_TYPE_SALES_COUNTRY);
        insert nsc;

        // Create Retailer Account
        retailer = LMS_DataFactory.createAccount('Retailer Test', '333', '444', 'Jane', 'Smith', 'retailer@test.com', '98765', '43210', LMS_AccountHelper.RECORD_TYPE_RETAILER);
        retailer.LMS_ACC_NSCImporter__c = nsc.Id;
        insert retailer;

        // Create Showroom
        LMS_Showroom__c showroom = LMS_DataFactory.createShowroom(retailer.Id);
        insert showroom;

        // Link User to Showroom
        LMS_User_at_Showroom__c userShowroomLink = LMS_DataFactory.createUserAtShowroom(salesUser.ContactId, showroom.Id);
        insert userShowroomLink;

        // Create Prospect Account
        Account prospect = LMS_DataFactory.createAccount('Prospect Test', '555', '666', 'Alice', 'Brown', 'prospect@test.com', '11111', '22222', LMS_AccountHelper.RECORD_TYPE_INDIVIDUAL);
        insert prospect;

        // Create Opportunity
        opp = LMS_DataFactory.createOpportunityWithAccount('Test Opp', prospect);
        opp.OwnerId = salesUser.Id;
        insert opp;

        // Create Quote with showroom context
        System.runAs(adminUser) {
            quote = LMS_DataFactory.createQuote(opp.Id);
            quote.LMS_QUO_ShowroomId__c = showroom.Id;
            quote.LMS_QUO_Status__c = LMS_QuoteHelper.STATUS_DRAFT;
            quote.LMS_QUO_SalesCountry__c = 'FR';
            insert quote;
        }

        // Create Quote Line Item
        qli = LMS_DataFactory.fetchQuoteLineItem(quote.Id, 100000, 1, null);
        insert qli;
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

        LMS_QuoteLineItem__c updatedQLI = [
            SELECT LMS_QLI_DiscountPercent__c, LMS_QLI_DiscountAmount__c,
                   LMS_QLI_DiscountNetAmount2__c, LMS_QLI_TaxAdjust__c
            FROM LMS_QuoteLineItem__c
            WHERE Id = :qli.Id
        ];

        System.assertEquals(5.0, updatedQLI.LMS_QLI_DiscountPercent__c);
        System.assertEquals(200.0, updatedQLI.LMS_QLI_DiscountAmount__c);
        System.assertEquals(150.0, updatedQLI.LMS_QLI_DiscountNetAmount2__c);
        System.assertEquals(180.0, updatedQLI.LMS_QLI_TaxAdjust__c);
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