import { LightningElement } from 'lwc';

export default class sliderComponent extends LightningElement {
    sliderValue = 0;
    minValue = 0;
    maxValue = 100000;

    handleInputChange(event) {
        const value = this.parseInputValue(event.target.value);
        if (this.isValueInRange(value)) {
            this.sliderValue = value;
            this.updateSliderBackground();
        }
    }

    handleSliderChange(event) {
        this.sliderValue = Number(event.target.value);
        this.updateSliderBackground();
    }

    get formattedSliderValue() {
        return (this.sliderValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get formattedMaxValue() {
        return this.maxValue.toLocaleString('en-US');
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
        slider.style.background = `linear-gradient(to right, rgb(12 18 28 / 90%) ${percentage}%, rgb(12 18 28 / 20%) ${percentage}%)`;
    }
}