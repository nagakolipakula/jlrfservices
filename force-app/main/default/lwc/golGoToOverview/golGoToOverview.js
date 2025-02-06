import { LightningElement } from 'lwc';
import GOL_Go_To_Overview from '@salesforce/label/c.GOL_Go_To_Overview';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';

export default class golGoToOverview extends LightningElement {
    label = {
        GOL_Go_To_Overview
    }

    handleGoToOverviewClick() {
        console.log('Go to Overview clicked');
        const flowNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(flowNavigationEvent);
    }
}