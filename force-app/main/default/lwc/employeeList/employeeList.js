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
  showedEmployees = [];
  columns = columns;

  page;
  pageSize = 5;
  startingRecord;
  endingRecord;
  totalPage;
  totalRecord;
  isFirstPage;
  isLastPage;

  @wire(MessageContext) messageContext;

  connectedCallback() {
    this.subscription = subscribe(
      this.messageContext, 
      EMPLOYEE_UPDATE_MESSAGE,
      message => {
        // ディープコピーしないと新規プロパティを追加できない
        this.employees = structuredClone(message.employees);
        
        for (const employee of this.employees) {
          employee.url = '/lightning/r/' + employee.Id + '/view';
        }

        this.totalRecord = this.employees.length;
        this.totalPage = Math.ceil(this.totalRecord / this.pageSize);
        this.page = 0;
        this.pageNext();
        
      }
    )
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Datatableのページネーション
  pageNext = () => {
    this.page++;
    this.changePage(this.page);
  }

  pagePrevious = () => {
    this.page--;
    this.changePage(this.page);
  }

  changePage = (page) => {
    this.startingRecord = (page - 1) * this.pageSize;

    if (page * this.pageSize > this.totalRecord) {
      this.endingRecord = this.totalRecord;
    } else {
      this.endingRecord = page * this.pageSize;
    }

    this.isFirstPage = (page === 1);
    this.isLastPage = (page === this.totalPage);

    this.showedEmployees = [...this.employees.slice(this.startingRecord, this.endingRecord)];
    this.startingRecord++;
  }
}