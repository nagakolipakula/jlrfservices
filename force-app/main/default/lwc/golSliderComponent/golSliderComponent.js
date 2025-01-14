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
        console.log('child slider connectedCallback call');
        console.log('this._sliderValue MS==> '+this._sliderValue);
        console.log('this.sliderValue MS==> '+this.sliderValue);
    //     console.log('ConnectedCallback triggered');
    //     // Delay the background update to ensure the DOM is ready
    //     setTimeout(() => {
            this.updateSliderBackground();
    //     }, 0); // Delay by 0 ms to allow for the next event loop
    }
    renderedCallback(){
        console.log('child slider renderedCallback call');
        console.log('this._sliderValue renderedCallback MS==> '+this._sliderValue);
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
        return `${this.maxValue.toLocaleString('en-US')}`;
    }

    get formattedMinValue() {
        if (this.minValue === undefined || this.minValue === null) {
            console.error('minValue is not defined:', this.minValue);
            return '';
        }
        if (this.unit === 'km') {
            return `${this.minValue.toLocaleString('en-US')} ${this.unit}`;
        }
        if (this.unit === '€') {
            return `${this.unit} ${this.minValue.toLocaleString('en-US')}`;
        }
        return `${this.minValue.toLocaleString('en-US')}`;
    }

    // parseInputValue(input) {
    //     return Number(input.replace(/,/g, ''));
    // }

    // isValueInRange(value) {
    //     return value >= this.minValue && value <= this.maxValue;
    // }

    updateSliderBackground() {
        Promise.resolve().then(() => {
            const percentage = ((this.sliderValue - this.minValue) / (this.maxValue - this.minValue)) * 100;
            const slider = this.template.querySelector('.custom-slider');
            if (slider) {
                console.log('Slider background updated with percentage:', percentage);
                slider.style.background = `linear-gradient(to right, rgb(12 18 28 / 90%) ${percentage}%, rgb(12 18 28 / 20%) ${percentage}%)`;
            }
        });
    }

    // dispatchChangeEvent() {
    //     this.dispatchEvent(new CustomEvent('sliderchange', {
    //         detail: this.sliderValue
    //     }));
    // }
}