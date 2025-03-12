import { LightningElement, api, track, wire} from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { publish, MessageContext } from 'lightning/messageService';
import TAB_CHANGE_MESSAGE_CHANNEL from '@salesforce/messageChannel/SummaryScreenTabChange__c';
import GOL_F1_SUMMARY from '@salesforce/label/c.GOL_F1_SUMMARY';
import GOL_F1_ACCESSORIES from '@salesforce/label/c.GOL_F1_ACCESSORIES';
import GOL_F1_ADD_ONS from '@salesforce/label/c.GOL_F1_ADD_ONS';
import GOL_F1_EXTRAS from '@salesforce/label/c.GOL_F1_EXTRAS';
import GOL_F1_TRADE_IN from '@salesforce/label/c.GOL_F1_TRADE_IN';
import GOL_F1_FINANCING from '@salesforce/label/c.GOL_F1_FINANCING';
import GOL_F1_ADMINISTRATION from '@salesforce/label/c.GOL_F1_ADMINISTRATION';
import GOL_F1_FULL_FINANCING from '@salesforce/label/c.GOL_F1_FULL_FINANCING';

export default class Gol_TabSetComponent extends LightningElement {
  @api quoteId;
  @api retUrl;
  @api readOnly;
  @api showFinancingTab;        //GOL-2142
  @api ShowFullFinanceTab;      //GOL-3483
  @track tabItems = [];         //GOL-2142
  // currentPageReference = null; 

  @wire(MessageContext)
  messageContext;


  @wire(CurrentPageReference)
  currentPageReference;

  connectedCallback() {
    this.tabSetItemshandler();        //GOL-2142
    console.log('current ref : ' + JSON.stringify(this.currentPageReference));     
    console.log(window.location.href);
    console.log(`c__quoteId = ${this.currentPageReference.state.defaulttab}`); 
    this.defaulttab = this.currentPageReference.state.defaulttab;
    console.log('default Tab : ' + this.defaulttab);
    
    if (this.defaulttab === undefined) {
      this.defaulttab = 'tab-default-Summary';
    }
    this.tabItems.forEach(tab => {
      if(tab.TabId === this.defaulttab){
        tab.IsActive = true;
        tab.ItemClass = 'slds-tabs_default__item slds-is-active';
        tab.ContentClass = 'slds-tabs_default__content slds-show';
      } else{
        tab.IsActive = false;
        tab.ItemClass = 'slds-tabs_default__item';
        tab.ContentClass = 'slds-tabs_default__content slds-hide';
      }
    });
  }

  //pass input variables to the flow when component is loaded
  get summaryTabinputVariables() {
    return [
      {
        name: 'quoteId',
        type: 'String',
        value: this.quoteId
      },
      {
        name: 'readOnly',
        type: 'Boolean',
        value: this.readOnly
      },
      {
        name: 'retUrl',
        type: 'String',
        value: this.retUrl
      }
    ];
  }

  //GOL-2142 start
  tabSetItemshandler() {
    let nextTabIndex = 5;
    this.tabItems.push(
      {
        Title: GOL_F1_SUMMARY,
        HeaderFlowName: "GOL_Screen_Flow_Summary_Tab_Header_Car_Image",
        FlowName: "GOL_Screen_Flow_Summary_Tab",
        ItemClass: 'slds-tabs_default__item slds-is-active',
        ContentClass: 'slds-tabs_default__content slds-show',
        TabItemStyle: '',
        TabIndex: 0,
        IsActive: true,
        TabId: 'tab-default-Summary',
        IsFinanceTab:false,
        IsTradeInTab:false
      },
      {
        Title: GOL_F1_ACCESSORIES,
        HeaderFlowName: "",
        FlowName: "GOL_Screen_Flow_Accessories_Tab",
        ItemClass: 'slds-tabs_default__item',
        ContentClass: 'slds-tabs_default__content slds-hide',
        TabItemStyle: '',
        TabIndex: 1,
        IsActive: false,
        TabId: 'tab-default-Accessories',
        IsFinanceTab:false,
        IsTradeInTab:false
      },
      {
        Title: GOL_F1_ADD_ONS,
        HeaderFlowName: "",
        FlowName: "GOL_Screen_Flow_AddOnsTab",
        ItemClass: 'slds-tabs_default__item',
        ContentClass: 'slds-tabs_default__content slds-hide',
        TabItemStyle: '',
        TabIndex: 2,
        IsActive: false,
        TabId: 'tab-default-AddOns',
        IsFinanceTab:false,
        IsTradeInTab:false
      },
      {
        Title: GOL_F1_EXTRAS,
        HeaderFlowName: "",
        FlowName: "GOL_Screen_Flow_Extras_Tab",
        ItemClass: 'slds-tabs_default__item',
        ContentClass: 'slds-tabs_default__content slds-hide',
        TabItemStyle: '',
        TabIndex: 3,
        IsActive: false,
        TabId: 'tab-default-Extras',
        IsFinanceTab:false,
        IsTradeInTab:false
      },
      {
        Title: GOL_F1_TRADE_IN,
        HeaderFlowName: "",
        FlowName: "W_I_Trade_In",
        ItemClass: 'slds-tabs_default__item',
        ContentClass: 'slds-tabs_default__content slds-hide',
        TabItemStyle: '',
        TabIndex: 4,
        IsActive: false,
        TabId: 'tab-default-TradeIn',
        IsFinanceTab:false,
        IsTradeInTab:false
      });

      if (this.showFinancingTab) {
          this.tabItems.push({
          Title: GOL_F1_FINANCING,
          HeaderFlowName: "",
          FlowName: "",
          ItemClass: 'slds-tabs_default__item',
          ContentClass: 'slds-tabs_default__content slds-hide',
          TabItemStyle: '',
          TabIndex: nextTabIndex,
          IsActive: false,
          TabId: 'tab-default-Financing',
          IsFinanceTab:true,
          IsTradeInTab:false
        });
        nextTabIndex++;
      }
      if(this.ShowFullFinanceTab){
        this.tabItems.push({
          Title: GOL_F1_FULL_FINANCING,
          HeaderFlowName: "",
          FlowName: "GOL_Screen_Flow_Finance_Tab",
          ItemClass: 'slds-tabs_default__item',
          ContentClass: 'slds-tabs_default__content slds-hide',
          TabItemStyle: '',
          TabIndex: nextTabIndex,
          IsActive: false,
          TabId: 'tab-default-full-Financing',
          IsFinanceTab:false,
          IsTradeInTab:false
        });
        nextTabIndex++;
      }
      this.tabItems.push({
        Title: GOL_F1_ADMINISTRATION,
        HeaderFlowName: "",
        FlowName: "W_G_Screen_Flow_Administration_Tab",
        ItemClass: 'slds-tabs_default__item',
        ContentClass: 'slds-tabs_default__content slds-hide',
        TabItemStyle : 'margin-left: auto;margin-right:20px',
        TabIndex: nextTabIndex,
        IsActive: false,
        TabId: 'tab-default-Administration',
        IsFinanceTab:false,
        IsTradeInTab:false
      });
  }
  //GOL-2142 ends

  handleTabClick(event) {
    const selectedTabId = event.currentTarget.dataset.tab;
    if(selectedTabId == 'tab-default-Summary') {
      const message = {
        data: {
          tabInfo : 'Summary Tab Clicked'
        },
      };
      publish(this.messageContext, TAB_CHANGE_MESSAGE_CHANNEL, message);
    }
    this.tabItems.forEach(tab => {
      if(tab.TabId === selectedTabId) {
        // this.defaulttab = tab.TabId;
        tab.IsActive = true;
        tab.ItemClass = 'slds-tabs_default__item slds-is-active';
        tab.ContentClass = 'slds-tabs_default__content slds-show';
      } else {
        // this.defaulttab = 'tab-default-Summary';
        tab.IsActive = false;
        tab.ItemClass = 'slds-tabs_default__item';
        tab.ContentClass = 'slds-tabs_default__content slds-hide';
      }
    });
  }

  handleStatusChange(event) {
      //executes when finish event is triggered in the lightning flow
    if(event.detail.status === 'FINISHED'){
        /*const outputVariables = event.detail.outputVariables;
        for(let i = 0; i < outputVariables.length; i++) {
              const outputVar = outputVariables[i];
              if(outputVar.name == 'Summary'){
                console.log('Summary from flow >> ' + outputVar.value);
              }
              if(outputVar.name == 'Summary'){
                console.log('Summary from flow >> ' + outputVar.value);
              }
        } */
    }
  }
}