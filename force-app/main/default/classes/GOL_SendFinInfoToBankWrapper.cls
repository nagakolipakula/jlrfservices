public with sharing class GOL_SendFinInfoToBankWrapper {

    // public FinancialProduct financialProduct;
    // public Quote quote;
    // public List<QuoteDetail> quoteDetails;
    // public List<FixedCost> fixedCosts;
    // public LegalDocument legalDocument;
    public String typeOfUse;
    public String channel;
    public String personType;
    public String quoteId;
    // public Products products;
    
    // public GOL_SendFinInfoToBankWrapper() {
    //     System.debug(LoggingLevel.DEBUG, 'GOL_SendFinInfoToBankWrapper()');
    //     this.financialProduct = new FinancialProduct();
    //     this.quote = new Quote();
    //     this.quoteDetails = new List<QuoteDetail>();
    //     this.fixedCosts = new List<FixedCost>();
    //     this.legalDocument = new LegalDocument();
    //     this.products = new Products();
    //     this.typeOfUse = '';
    //     this.channel = '';
    //     this.personType = '';
    //     this.quoteId = '';
    // }

    // public class FinancialProduct {
    //     public String id;
    //     public String name;
    //     public String currencyCode;
    //     public List<String> rateType;
    //     public FinancialProductCategory financialProductCategory;

    //     public FinancialProduct() {
    //         this.id = '';
    //         this.name = '';
    //         this.currencyCode = '';
    //         this.rateType = new List<String>();
    //         this.financialProductCategory = new FinancialProductCategory();
    //     }
    // }

    // public class FinancialProductCategory {
    //     public String code;
    //     public String name;
    //     public String description;

    //     public FinancialProductCategory() {
    //         this.code = '';
    //         this.name = '';
    //         this.description = '';
    //     }
    // }

    // public class Quote {
    //     public Integer annualMileage;
    //     public Decimal downPaymentGrossAmount;
    //     public Integer duration;
    //     public Decimal installmentGrossAmount;
    //     public Decimal totalGrossAmount;
    //     public Decimal dealerPriceNetAmount;
    //     public Decimal dealerPriceGrossAmount;
    //     public Decimal totalNetAmount;

    //     public Quote() {
    //         this.annualMileage = 0;
    //         this.downPaymentGrossAmount = 0;
    //         this.duration = 0;
    //         this.installmentGrossAmount = 0;
    //         this.totalGrossAmount = 0;
    //         this.dealerPriceNetAmount = 0;
    //         this.dealerPriceGrossAmount = 0;
    //         this.totalNetAmount = 0;
    //     }
    // }

    // public class QuoteDetail {
    //     public String id;
    //     public String label;
    //     public Decimal value;

    //     public QuoteDetail() {
    //         this.id = '';
    //         this.label = '';
    //         this.value = 0;
    //     }
    // }

    // public class FixedCost {
    //     public String name;
    //     public Decimal grossAmount;
    //     public String currencyCode;
    //     public String costType;

    //     public FixedCost() {
    //         this.name = '';
    //         this.grossAmount = 0;
    //         this.currencyCode = '';
    //         this.costType = '';
    //     }
    // }

    // public class LegalDocument {
    //     public String title;
    //     public String body;

    //     public LegalDocument() {
    //         this.title = '';
    //         this.body = '';
    //     }
    // }

    // public class Products {
    //     public InputFields inputFields;
    //     public Units units;
    //     public Product cpiProducts;
    //     public Product nonCpiProducts;

    //     public Products() {
    //         this.inputFields = new InputFields();
    //         this.units = new Units();
    //         this.cpiProducts = new Product();
    //         this.nonCpiProducts = new Product();
    //     }
    // }

    // public class InputFields {
    //     public AmountRange downPaymentGrossAmountRange;
    //     public AmountRange downPaymentNetAmountRange;

    //     public InputFields() {
    //         this.downPaymentGrossAmountRange = new AmountRange();
    //         this.downPaymentNetAmountRange = new AmountRange();
    //     }
    // }

    // public class AmountRange {
    //     public Decimal selectedValue;

    //     public AmountRange() {
    //         this.selectedValue = 0;
    //     }
    // }

    // public class Units {
    //     public String currencyCode;
    //     public String durationTimeUnit;

    //     public Units() {
    //         this.currencyCode = '';
    //         this.durationTimeUnit = '';
    //     }
    // }

    // public class Product {
    //     public String financialProductId;
    //     public String name;
    //     public String description;
    //     public String id;

    //     public Product() {
    //         this.financialProductId = '';
    //         this.name = '';
    //         this.description = '';
    //         this.id = '';
    //     }
    // }

    public static GOL_SendFinInfoToBankWrapper parse(String json) {
        return (GOL_SendFinInfoToBankWrapper) System.JSON.deserialize(json, GOL_SendFinInfoToBankWrapper.class);
    }
}