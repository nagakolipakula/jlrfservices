public with sharing class GOL_JSON2ApexFinancialQuoteWrapper {

    public FinancialProduct financialProduct;
    public Quote quote;
    public List<QuoteDetail> quoteDetails;
    public List<FixedCost> fixedCosts;
    public LegalDocument legalDocument;

    public class FinancialProduct {
        public String name;
        public String description;
        public String mileageUnit;
        public List<String> baremeCodes;
        public String currencyCode;
        // public String rateType;
        public String creditTimeUnit;
        public String provider;
        public String fullId;
    }

    public class Quote {
        public Integer annualMileage;
        public Decimal downPaymentGrossAmount;
        public Integer duration;
        public Decimal installmentGrossAmount;
        public Decimal totalGrossAmount;
    }

    public class QuoteDetail {
        public String id;
        public String label;
        public String value;
    }

    public class FixedCost {
        public String name;
        public Decimal grossAmount;
        public String currencyCode;
        public String costType;
    }

    public class LegalDocument {
        public String title;
        public String body;
    }

    public static GOL_JSON2ApexFinancialQuoteWrapper parse(String json) {
		return (GOL_JSON2ApexFinancialQuoteWrapper) System.JSON.deserialize(json, GOL_JSON2ApexFinancialQuoteWrapper.class);
	}
}