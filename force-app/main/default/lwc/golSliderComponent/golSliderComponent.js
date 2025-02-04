import { LightningElement, api } from 'lwc';
import LOCALE from "@salesforce/i18n/locale";

export default class golSliderComponent extends LightningElement {
    @api labelName;
    @api labelFor;
    @api unit = '';
    @api minValue;
    @api maxValue;
    _sliderValue = 0;

    @api
    get sliderValue() {
        return this._sliderValue;
    }

    set sliderValue(value) {
        console.log('set sliderValue ==> '+value);
        this._sliderValue = value;
        this.updateSliderBackground();
    }

    connectedCallback() {
        this.updateSliderBackground();
    }

    renderedCallback(){
        setTimeout(() => {
            this.updateSliderBackground();
        }, 100);
        const inputBox = this.template.querySelector('.input-box');
        if (inputBox) {
            inputBox.addEventListener('mouseover', () => {
                inputBox.style.border = '2px solid rgba(12, 18, 28, 0.8)';
            });
            inputBox.addEventListener('mouseout', () => {
                inputBox.style.border = '2px solid rgba(12, 18, 28, 0.3)';
            });
        }
    }

    get isEuro() {
        return this.unit === '€';
    }

    get rangeUnits() {
        return this.unit === 'km';
    }

    get isDownpayment() {
        return (
            this.labelName === '1er loyer' || 
            this.labelName === 'Apport'
        );
    }

    get isPercentage() {
        return this.unit === '%';
    }

    handleInputChange(event) {
        let value = parseFloat(event.target.value, 10);
        if(value < this.minValue){
            this.sliderValue = this.sliderValue + 1;
            value = this.minValue;
        }
        if(value > this.maxValue){
            this.sliderValue = this.sliderValue - 1;
            value = this.maxValue;
        }
        if (value >= this.minValue && value <= this.maxValue) {
            this.sliderValue = value;
            this.updateSliderBackground();
            this.dispatchEvent(
                new CustomEvent('sliderchange', {
                    detail: { id: this.labelFor, value: this._sliderValue }
                })
            );
        }
    }

    handleSliderChange(event) {
        const value = parseFloat(event.target.value);
        this._sliderValue = value;
        this.updateSliderBackground();
        this.dispatchEvent(
            new CustomEvent('sliderchange', {
                detail: { id: this.labelFor, value: this._sliderValue }
            })
        );
    }
   
    get formattedSliderValue() {
        console.log('MS formattedSliderValue sliderValue==> '+this.sliderValue);
        if (this.unit === '€') {            
            return `${(this.sliderValue || 0).toLocaleString(LOCALE, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}`;
        }

        if (this.unit === 'km') {
            //return `${Math.round(this.sliderValue || 0)}`;
            return `${Math.floor(this.sliderValue || 0).toLocaleString(LOCALE)}`;
        }

        if (this.isPercentage) {
            return `${Math.floor(this.sliderValue || 0)} %`;
        }
        return `${Math.round(this.sliderValue || 0)}`;
    }

    get formattedMaxValue() {
        if (this.maxValue === undefined || this.maxValue === null) {
            console.error('maxValue is not defined:', this.maxValue);
            return '';
        }
        if (this.unit === 'km') {
            //return `${this.maxValue} ${this.unit}`;
            return `${Math.floor(this.maxValue || 0).toLocaleString(LOCALE)} ${this.unit}`;
        }
        if (this.unit === '€') {
            //return `${this.maxValue} ${this.unit}`;
            return `${(this.maxValue || 0).toLocaleString(LOCALE, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })} ${this.unit}`;

        }
        if (this.isPercentage) {
            return `${this.maxValue} %`;
        }
        return `${this.maxValue} months`;
    }

    get formattedMinValue() {
        if (this.minValue === undefined || this.minValue === null) {
            console.error('minValue is not defined:', this.minValue);
            return '';
        }
        if (this.unit === 'km' || this.unit === 'months') {
            //return `${this.minValue} ${this.unit}`;
            return `${Math.floor(this.minValue || 0).toLocaleString(LOCALE)} ${this.unit}`;
        }
        if (this.unit === '€') {
            //return `${this.unit} ${this.minValue}`;
            return `${this.unit} ${(this.minValue || 0).toLocaleString(LOCALE, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}`;
        }
        if (this.isPercentage) {
            return `${this.minValue} %`;
        }
        return `${this.minValue} months`;
    }

    updateSliderBackground() {
        Promise.resolve().then(() => {
            const percentage = ((this.sliderValue - this.minValue) / (this.maxValue - this.minValue)) * 100;
            const slider = this.template.querySelector('.custom-slider');
            if (slider) {
                // console.log('Slider background updated with percentage:', percentage);
                slider.style.background = `linear-gradient(to right, rgb(12 18 28 / 90%) ${percentage}%, rgb(12 18 28 / 20%) ${percentage}%)`;
            }
        });
    }
}