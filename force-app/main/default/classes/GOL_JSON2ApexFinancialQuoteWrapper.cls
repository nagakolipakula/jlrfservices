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
    
    public GOL_JSON2ApexFinancialQuoteWrapper() {
        System.debug(LoggingLevel.DEBUG, 'GOL_JSON2ApexFinancialQuoteWrapper()');
        this.fixedCosts = new List<FixedCost>(); 
        this.cpiProducts = new List<CpiProducts>();
        this.nonCpiProducts = new List<NonCpiProducts>();
        this.quoteDetails = new List<QuoteDetail>();
        this.products = new Products();
        //this.financialProduct.services = new List<Services>();
        // this.financialProduct.services.validValues = new List<ValidValues>();
    }

    public class FinancialProduct {
        public String id;
        public String name;
        public String currencyCode;
        public List<String> rateType;
        public FinancialProductCategory financialProductCategory;
        public String provider;
        public String fullId;
        public String creditTimeUnit;
        public List<Services> services;
        //public List<Services> services;
    }

    public class Services {
		public String serviceId;	    //1
		public ServiceValue serviceValue;
		public String label;	    //Maintenance
	}

	public class ServiceValue {
		public String value;	    //MA_FORFAITRE
		public String label;	    //Maintenance (Assistance Plus incluse)
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
        //public Decimal monthlyCost;
    }

    public class NonCpiProducts {
        public String financialProductId;
        public String name;
        public String description;
        public String id;
        //public Decimal monthlyCost;
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

    // class Services {
	// 	public String serviceId;	
	// 	public String label;	
	// 	public List<ServiceValue> serviceValue;
	// }

    // class ServiceValue {
	// 	public String label;	
	// 	public String value;	
	// 	public Boolean excluded;	
	// }


    public static GOL_JSON2ApexFinancialQuoteWrapper parse(String json) {
        return (GOL_JSON2ApexFinancialQuoteWrapper) System.JSON.deserialize(json, GOL_JSON2ApexFinancialQuoteWrapper.class);
    }
}