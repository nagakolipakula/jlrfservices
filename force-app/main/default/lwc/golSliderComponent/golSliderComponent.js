import { LightningElement, api } from 'lwc';

export default class golSliderComponent extends LightningElement {
    @api labelName;
    @api labelFor;
    @api unit = '';
    @api minValue;
    @api maxValue;
    @api stepValue;

    _sliderValue = 0;

    @api
    get sliderValue() {
        return this._sliderValue;
    }

    set sliderValue(value) {
        this._sliderValue = value;
        this.updateSliderBackground();
    }

    handleInputChange(event) {
        const value = this.parseInputValue(event.target.value);
        if (this.isValueInRange(value)) {
            this.sliderValue = value;
            this.updateSliderBackground();
            this.dispatchChangeEvent();
        }
    }

    handleSliderChange(event) {
        this.sliderValue = Number(event.target.value);
        this.updateSliderBackground();
        this.dispatchChangeEvent();
    }

    get formattedSliderValue() {
        return `${(this.sliderValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${this.unit}`;
    }

    get formattedMaxValue() {
        return `${this.maxValue.toLocaleString('en-US')} ${this.unit}`;
    }

    get formattedMinValue() {
        return `${this.minValue.toLocaleString('en-US')} ${this.unit}`;
    }

    parseInputValue(input) {
        return Number(input.replace(/,/g, ''));
    }

    isValueInRange(value) {
        return value >= this.minValue && value <= this.maxValue;
    }

    updateSliderBackground() {
        const percentage = ((this.sliderValue - this.minValue) / (this.maxValue - this.minValue)) * 100;
        const slider = this.template.querySelector('.custom-slider');
        if (slider) {
            slider.style.background = `linear-gradient(to right, rgb(12 18 28 / 90%) ${percentage}%, rgb(12 18 28 / 20%) ${percentage}%)`;
        }
    }

    dispatchChangeEvent() {
        this.dispatchEvent(new CustomEvent('sliderchange', {
            detail: this.sliderValue
        }));
    }
}
