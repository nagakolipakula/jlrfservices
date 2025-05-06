public with sharing class GOL_JSON2ApexFinancialQuoteWrapper {

    public FinancialProduct financialProduct;
    public Quote quote;
    public List<QuoteDetail> quoteDetails;
    public List<FixedCost> fixedCosts;
    public LegalDocument legalDocument;
    public String typeOfUse;
    public String channel;
    public String personType;
    public List<CpiProducts> cpiProducts;
    public List<NonCpiProducts> nonCpiProducts;
    public String quoteId;
    public Products products;
    public String ageRange;
    public String zipCode;  
    
    public GOL_JSON2ApexFinancialQuoteWrapper() {
        System.debug(LoggingLevel.DEBUG, 'GOL_JSON2ApexFinancialQuoteWrapper()');
        /*this.fixedCosts = new List<FixedCost>(); 
        this.cpiProducts = new List<CpiProducts>();
        this.nonCpiProducts = new List<NonCpiProducts>();
        this.quoteDetails = new List<QuoteDetail>();
        this.products = new Products();
        this.financialProduct.services = new List<Services>();*/
    }

    public class FinancialProduct {
        public String id;
        public String name;
        public String description; //GOL-4251
        public String currencyCode;
        public List<String> rateType;
        public FinancialProductCategory financialProductCategory;
        public String provider;
        public String fullId;
        public String creditTimeUnit;
        public List<Services> services;
    }

    public class Services {
		public String serviceId;	   
		public ServiceValue serviceValue;
		public String label;	
	}

	public class ServiceValue {
		public String value;	
		public String label;	 
		public boolean excluded;
	}

    public class FinancialProductCategory {
        public String code;
        public String name;
        public String description;
    }

    public class Quote {
        public Integer annualMileage;
        public Decimal downPaymentGrossAmount;
        public Integer duration;
        public Decimal installmentGrossAmount;
        public Decimal totalGrossAmount;
        //GOL-3208
        public Date endingValidityDate;
        public Decimal aprcRate;
        public Decimal totalInterestGrossAmount;
        public Decimal totalFinancedGrossAmount;
        public Decimal toBeFinancedGrossAmount;
        public Decimal nominalRate;
        public Decimal jlrTotalCostOfCredit;
        public Decimal jlrMonthlyInstallments;
        public Decimal jlrLastMonthlyInstallment;
        public Decimal jlrFirstMonthlyInstallment;
        public Decimal jlrFinancedAmount;
        public Decimal installmentLastGrossAmount;
        public Decimal installmentFirstGrossAmount;
        public Decimal installmentAndInterestTotalGrossAmount;
        public Decimal installmentInterestGrossAmount;
        public Decimal effectiveRate;
        //GOL-3208
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

    public class CpiProducts {
        public String financialProductId;
        public String name;
        public String description;
        public String id;
        public Boolean checked;
        public Decimal monthlyCost;
    }

    public class NonCpiProducts {
        public String financialProductId;
        public String name;
        public String description;
        public String id;
        public Boolean checked;
        public Decimal monthlyCost;
    }

    public class Products {
        public InputFields inputFields;
        public Units units;
        public Product cpiProducts;
        public Product nonCpiProducts;
    }

    public class InputFields {
        public AmountRange downPaymentGrossAmountRange;
        public AmountRange downPaymentNetAmountRange;
    }

    public class AmountRange {
        public Decimal selectedValue;
    }

    public class Units {
        public String currencyCode;
        public String durationTimeUnit;
    }

    public class Product {
        public String financialProductId;
        public String name;
        public String description;
        public String id;
    }

    public static GOL_JSON2ApexFinancialQuoteWrapper parse(String json) {
        return (GOL_JSON2ApexFinancialQuoteWrapper) System.JSON.deserialize(json, GOL_JSON2ApexFinancialQuoteWrapper.class);
    }
}