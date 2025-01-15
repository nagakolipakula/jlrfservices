import { LightningElement, api } from 'lwc';

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
    }

    get isEuro() {
        return this.unit === '€';
    }

    handleInputChange(event) {
        let value = parseFloat(event.target.value, 10);
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
        if (this.unit === '€') {
            return `${(this.sliderValue || 0).toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}`;
        }
        if (this.unit === 'km') {
            return `${Math.round(this.sliderValue || 0).toLocaleString('en-US')} ${this.unit}`;
        }
        return `${Math.round(this.sliderValue || 0).toLocaleString('en-US')}`;
    }

    get formattedMaxValue() {
        if (this.maxValue === undefined || this.maxValue === null) {
            console.error('maxValue is not defined:', this.maxValue);
            return '';
        }
        if (this.unit === 'km') {
            return `${this.maxValue.toLocaleString('en-US')} ${this.unit}`;
        }
        if (this.unit === '€') {
            return `${this.maxValue.toLocaleString('en-US')} ${this.unit}`;
        }
        return `${this.maxValue.toLocaleString('en-US')} months`;
    }

    get formattedMinValue() {
        if (this.minValue === undefined || this.minValue === null) {
            console.error('minValue is not defined:', this.minValue);
            return '';
        }
        if (this.unit === 'km' || this.unit === 'months') {
            return `${this.minValue.toLocaleString('en-US')} ${this.unit}`;
        }
        if (this.unit === '€') {
            return `${this.unit} ${this.minValue.toLocaleString('en-US')}`;
        }
        return `${this.minValue.toLocaleString('en-US')} months`;
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