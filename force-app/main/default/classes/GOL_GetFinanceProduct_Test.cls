@isTest
public class GOL_GetFinanceProduct_Test {

    @isTest
    static void isSuccess() {
        // Arrange
        GOL_GetFinanceProduct.Request request = new GOL_GetFinanceProduct.Request();
        request.quoteExternalId = 'f19d03cb-4e61-44c9-a0s26000007WP6VAAW';
        request.typeOfUse = 'PRIVATE';
        request.channel = 'ONLINE';
        request.personType = 'PHYSICAL';
        
        List<GOL_GetFinanceProduct.Request> lstRequestData = new List<GOL_GetFinanceProduct.Request>{request};

        String mockResponseBody = '[{"provider": "BNPP","typeOfUse": "PRIVATE","channel": "ONLINE","personType": "PHYSICAL","name": "Lening op afbetaling met laatste verhoogde maandelijkse aflossing","description": "Lening op afbetaling met laatste verhoogde maandelijkse aflossing","id": "3#040#STD47","units": {"currencyCode": "EUR","creditTimeUnit": "MONTH","mileageUnit": "KILOMETERS"}},{"provider": "BNPP","typeOfUse": "PRIVATE","channel": "ONLINE","personType": "PHYSICAL","name": "Lening op afbetaling","description": "Lening op afbetaling","id": "1#040#STD41","units": {"currencyCode": "EUR","creditTimeUnit": "MONTH","mileageUnit": "KILOMETERS"}}]';
        
        HttpResponse mockResponse = new HttpResponse();
        mockResponse.setStatusCode(200);
        mockResponse.setBody(mockResponseBody);
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator(mockResponse));

        // Act
        Test.startTest();
        List<GOL_GetFinanceProduct.Response> lstResponse = GOL_GetFinanceProduct.getProduct(lstRequestData);
        Test.stopTest();

        // Assert
        System.assertEquals(1, lstResponse.size(), 'There should be exactly one response.');
        System.assert(lstResponse[0].isSuccess, 'API call should be successful.');
        System.assert(lstResponse[0].responseBody.contains('Lening op afbetaling met laatste verhoogde maandelijkse aflossing'), 'Response should contain first product.');
        System.assert(lstResponse[0].responseBody.contains('Lening op afbetaling'), 'Response should contain second product.');
    }

    @isTest
    static void isFailureWith500Error() {
        // Arrange
        GOL_GetFinanceProduct.Request request = new GOL_GetFinanceProduct.Request();
        request.quoteExternalId = 'f19d03cb-4e61-44c9-a0s26000007WP6VAAW';
        request.typeOfUse = 'PRIVATE';
        request.channel = 'ONLINE';
        request.personType = 'PHYSICAL';

        List<GOL_GetFinanceProduct.Request> lstRequestData = new List<GOL_GetFinanceProduct.Request>{request};

        HttpResponse mockResponse = new HttpResponse();
        mockResponse.setStatusCode(500);
        mockResponse.setBody('{"message": "Internal Server Error"}');
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator(mockResponse));

        // Act
        Test.startTest();
        List<GOL_GetFinanceProduct.Response> lstResponse = GOL_GetFinanceProduct.getProduct(lstRequestData);
        Test.stopTest();

        // Assert
        System.assertEquals(1, lstResponse.size(), 'There should be exactly one response.');
        System.assert(!lstResponse[0].isSuccess, 'API should fail due to server error.');
        System.assertEquals('Internal Server Error', lstResponse[0].errorMessage, 'Error message should match API response.');

        LMS_Exception__c loggedError = [SELECT LMS_EXC_Message__c FROM LMS_Exception__c WHERE LMS_EXC_Type__c = 'GOL_GetFinanceProduct.getProduct' LIMIT 1];
        System.assertNotEquals(null, loggedError, 'An exception should be logged for API failure.');
        System.assert(loggedError.LMS_EXC_Message__c.contains('Internal Server Error'), 'Exception log should contain error message.');
    }

    @isTest
    static void invalidInput() {
        // Arrange
        GOL_GetFinanceProduct.Request request = new GOL_GetFinanceProduct.Request();
        request.quoteExternalId = 'abcd1234';
        request.typeOfUse = '';
        request.channel = '';
        request.personType = '';
        List<GOL_GetFinanceProduct.Request> lstRequestData = new List<GOL_GetFinanceProduct.Request>{request};

        HttpResponse mockResponse = new HttpResponse();
        mockResponse.setStatusCode(400);
        mockResponse.setBody('{"code": "400", "message": "Required query parameter typeOfUse not specified"}');
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator(mockResponse));

        // Act
        Test.startTest();
        List<GOL_GetFinanceProduct.Response> lstResponse = GOL_GetFinanceProduct.getProduct(lstRequestData);
        Test.stopTest();
        
        // Assert
        System.assertEquals(1, lstResponse.size(), 'There should be exactly one response.');
        System.assert(!lstResponse[0].isSuccess, 'API should fail due to invalid input.');
        System.assertEquals('Invalid input: query parameters are missing', lstResponse[0].errorMessage, 'Error message should match expected.');

        LMS_Exception__c loggedError = [SELECT LMS_EXC_Message__c FROM LMS_Exception__c WHERE LMS_EXC_Type__c = 'GOL_GetFinanceProduct.getProduct' LIMIT 1];
        System.assertNotEquals(null, loggedError, 'An exception should be logged for invalid input.');
        System.assert(loggedError.LMS_EXC_Message__c.contains('Invalid input: query parameters are missing'), 'Exception log should contain validation error message.');
    }

    @isTest
    static void testGetProductInvalidQuoteId() {
        // Arrange 
        GOL_GetFinanceProduct.Request request = new GOL_GetFinanceProduct.Request();
        request.quoteExternalId = 'invalid-quote-id';
        request.typeOfUse = 'PRIVATE';
        request.channel = 'ONLINE';
        request.personType = 'PHYSICAL';
        
        List<GOL_GetFinanceProduct.Request> lstRequestData = new List<GOL_GetFinanceProduct.Request>{request};

        HttpResponse mockResponse = new HttpResponse();
        mockResponse.setStatusCode(404);
        mockResponse.setBody('{"code": "404", "message": "Quote does not exist"}');
        
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator(mockResponse));

        // Act
        Test.startTest();
        List<GOL_GetFinanceProduct.Response> lstResponse = GOL_GetFinanceProduct.getProduct(lstRequestData);
        Test.stopTest();

        // Assert
        System.assertEquals(1, lstResponse.size(), 'There should be exactly one response.');
        System.assert(!lstResponse[0].isSuccess, 'API should fail due to invalid quoteId.');
        System.assert(lstResponse[0].errorMessage.contains('Quote does not exist'), 'Error message should indicate that the quote does not exist.');

        LMS_Exception__c loggedError = [SELECT LMS_EXC_Message__c FROM LMS_Exception__c WHERE LMS_EXC_Type__c = 'GOL_GetFinanceProduct.getProduct' LIMIT 1];
        System.assertNotEquals(null, loggedError, 'An exception should be logged for an invalid quoteId.');
        System.assert(loggedError.LMS_EXC_Message__c.contains('Quote does not exist'), 'Exception log should contain the expected error message.');
    }

    //Http mock helpers
    private class MockHttpResponseGenerator implements HttpCalloutMock {
        private HttpResponse response;
        public MockHttpResponseGenerator(HttpResponse response) {
            this.response = response;
        }
        public HttpResponse respond(HttpRequest req) {
            return response;
        }
    }
}