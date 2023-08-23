import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import EMPLOYEE_UPDATE_MESSAGE from '@salesforce/messageChannel/EmployeeUpdate__c';

const columns = [
  { label: '従業員ID', fieldName: 'url', type: 'url', typeAttributes: { label: { fieldName: 'EmployeeId__c' }, tooltip: { fieldName: 'EmployeeId__c' } }, sortable: true },
  { label: '名前', fieldName: 'Name', sortable: true },
  { label: '部署', fieldName: 'Department__c', sortable: true },
  { label: '入社日', fieldName: 'HireDate__c', type: 'date', sortable: true },
  { label: 'メール', fieldName: 'Mail__c', type: 'email', sortable: true },
  { label: '総受験料', fieldName: 'CertificationTotalFee__c', type: 'currency', sortable: true },
];

export default class EmployeeList extends LightningElement {
  subscription = null;
  employees = [];
  columns = columns;

  @wire(MessageContext) messageContext;

  connectedCallback() {
    this.subscription = subscribe(
      this.messageContext, 
      EMPLOYEE_UPDATE_MESSAGE,
      message => {
        const messageEmployees = structuredClone(message.employees);
        
        for (const employee of messageEmployees) {
          employee.url = '/lightning/r/' + employee.Id + '/view';
        }
        this.employees = [...messageEmployees];
      }
    )
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }
}