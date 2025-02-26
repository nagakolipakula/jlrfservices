public class GOL_SendInfoToBank {
    public String quoteId;
    public String typeOfUse;
    public String channel;
    public String personType;
    public Quote quote;
    public List<QuoteDetail> quoteDetails;
    public FinancialProduct financialProduct;
    public Products products;

    public class Quote {
        public Integer annualMileage;
        public Integer duration;
        public Decimal downPaymentGrossAmount;
        public Decimal dealerPriceNetAmount;
        public Decimal dealerPriceGrossAmount;
        public Decimal totalGrossAmount;
        public Decimal totalNetAmount;
        public Decimal installmentGrossAmount;
    }

    public class QuoteDetail {
        public String id;
        public String label;
        public Decimal value;
    }

    public class FinancialProduct {
        public String id;
        public String name;
        public String currencyCode;
        public List<String> rateType;
        public FinancialProductCategory financialProductCategory;
    }

    public class FinancialProductCategory {
        public String code;
        public String name;
        public String description;
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

    public String toJson() {
        return JSON.serialize(this);
    }

    public static GOL_SendInfoToBank fromJson(String jsonString) {
        return (GOL_SendInfoToBank) JSON.deserialize(jsonString, GOL_SendInfoToBank.class);
    }
}