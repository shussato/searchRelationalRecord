import { LightningElement, api, wire, track } from 'lwc';
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
  selectedRows = [];
  allSelectedRows = [];
  columns = columns;

  page;
  pageSize = 5;
  startingRecord;
  endingRecord;
  totalPage;
  totalRecord;

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
        
        this.allSelectedRows = [];
      }
    )
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  get haveNoRows() {
    if (this.allSelectedRows.length) {
      return false;
    }
    return true;
  }

  get isFirstPage() {
    return this.page === 1;
  }

  get isLastPage() {
    return this.page === this.totalPage;
  }

  get selectedRowsFirst() {
    return this.showedEmployees
      .filter(employee => this.allSelectedRows.includes(employee))
      .map(employee => employee.Id);
  }


  handleRowSelection(e) {
    console.log(e.detail);
    this.selectedRows = e.detail.selectedRows;

    const config = e.detail.config;
    if (config.action == 'rowSelect' || config.action == 'selectAllRows') {
      // 重複を排除して配列に追加
      this.allSelectedRows = [...new Set([...this.allSelectedRows, ...this.selectedRows])];

    } else if (config.action == 'rowDeselect') {
      this.allSelectedRows = this.allSelectedRows.filter(row => {
        return row.Id != config.value;
      });

    } else if (config.action == 'deselectAllRows') {
      this.allSelectedRows = this.allSelectedRows.filter(row => {
        return !this.showedEmployees.includes(row);
      });
    }

    // console.log(JSON.parse(JSON.stringify(this.allSelectedRows)));
  }

  showModal = () => {
    // Jsonを経由しないとなぜか配列が表示されない
    // 「要素数が0なのに個々の要素が存在する」という状態になる
    console.log('------SelectedEmployees------\n', JSON.parse(JSON.stringify(this.allSelectedRows)));
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

  changePage = page => {
    this.startingRecord = (page - 1) * this.pageSize;

    if (page * this.pageSize > this.totalRecord) {
      this.endingRecord = this.totalRecord;
    } else {
      this.endingRecord = page * this.pageSize;
    }

    this.showedEmployees = [...this.employees.slice(this.startingRecord, this.endingRecord)];
    this.startingRecord++;
  }
}