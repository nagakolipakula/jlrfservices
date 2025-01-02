import { LightningElement, track } from 'lwc';
 
export default class SliderComponent extends LightningElement {
    @track sliderValue = 0;
    minValue = 0;
    maxValue = 100000;
 
    handleInputChange(event) {
        let value = Number(event.target.value.replace(/,/g, ''));
        if (value >= this.minValue && value <= this.maxValue) {
            this.sliderValue = value;
        }
    }

    get formattedSliderValue() {
        return this.sliderValue.toLocaleString('en-US');
    }

    get formattedMaxValue() {
        return this.maxValue.toLocaleString('en-US');
    }
 
    handleSliderChange(event) {
        this.sliderValue = Number(event.target.value);
        const percentage = ((this.sliderValue - this.minValue) / (this.maxValue - this.minValue)) * 100;
        const slider = this.template.querySelector('.custom-slider');
        slider.style.background = `linear-gradient(to right, rgb(12 18 28 / 90%) ${percentage}%, rgb(12 18 28 / 20%) ${percentage}%)`;
    }
}