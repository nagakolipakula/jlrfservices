import { LightningElement, track } from 'lwc';
 
export default class SliderComponent extends LightningElement {
    @track sliderValue = 0;
    minValue = 0;
    maxValue = 100000;
 
    handleInputChange(event) {
        let value = Number(event.target.value);
        if (value >= this.minValue && value <= this.maxValue) {
            this.sliderValue = value;
        }
    }
 
    handleSliderChange(event) {
        this.sliderValue = event.target.value;
    }
}