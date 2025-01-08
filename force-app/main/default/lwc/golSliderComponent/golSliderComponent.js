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

    get isEuro() {
        return this.unit === '€';
    }

    // set sliderValue(value) {
    //     this._sliderValue = value;
    //     this.updateSliderBackground();
    //     const slider = this.template.querySelector('.slider');
    //     if (slider) {
    //         slider.value = value;
    //     }
    // }

    handleInputChange(event) {
        let value = parseInt(event.target.value, 10);
        if (value >= this.minValue && value <= this.maxValue) {
          this._sliderValue = value;
          this.updateSliderBackground();
          this.dispatchEvent(
            new CustomEvent("sliderchange", {
              detail: this._sliderValue
            })
          );
        }
    }  

    handleSliderChange(event) {
        const value = event.target.value;
        this._sliderValue = value;
        this.updateSliderBackground();
        this.dispatchEvent(
          new CustomEvent("sliderchange", {
            detail: this._sliderValue
          })
        );
    }

    get formattedSliderValue() {
        return this.unit === 'km'
            ? `${(this.sliderValue || 0).toLocaleString('en-US')} ${this.unit}`
            : `${(this.sliderValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    get formattedMaxValue() {
        return this.unit === 'km'
            ? `${this.maxValue.toLocaleString('en-US')} ${this.unit}`
            : `${(this.maxValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${this.unit}`;
    }    

    get formattedMinValue() {
        if (this.unit === 'km') {
            return `${this.minValue.toLocaleString('en-US')} ${this.unit}`;
        }
        if (this.unit === '€') {
            return `${this.unit} ${this.minValue.toLocaleString('en-US')}`;
        }
        return `${this.minValue.toLocaleString('en-US')}`;
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

    // dispatchChangeEvent() {
    //     this.dispatchEvent(new CustomEvent('sliderchange', {
    //         detail: this.sliderValue
    //     }));
    // }
}