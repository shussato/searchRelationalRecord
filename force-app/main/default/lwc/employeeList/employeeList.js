import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import EMPLOYEE_UPDATE_MESSAGE from '@salesforce/messageChannel/EmployeeUpdate__c';
import CreatingHistoryModal from 'c/creatingHistoryModal';

const columns = [
  { label: '従業員ID', fieldName: 'Id', type: 'button', sortable: true, typeAttributes: { label: { fieldName: 'EmployeeId__c' },
                                                                                                     target: '_blank',
                                                                                                     variant: 'base',
                                                                                                     name: 'urlRedirect'
                                                                                        } 
  },
  { label: '名前', fieldName: 'Name', sortable: true },
  { label: '部署', fieldName: 'Department__c', sortable: true },
  { label: '入社日', fieldName: 'HireDate__c', type: 'date', sortable: true },
  { label: 'メール', fieldName: 'Mail__c', type: 'email', sortable: true },
  { label: '総受験料', fieldName: 'CertificationTotalFee__c', type: 'currency', sortable: true },
];

export default class EmployeeList extends NavigationMixin(LightningElement) {
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

  sortedBy;
  sortedDirection;

  isModalOpen = false;

  @wire(MessageContext) messageContext;

  constructor() {
    super();
    this.sortedBy = 'Id';
    this.sortedDirection = 'asc';
  }

  connectedCallback() {
    this.subscription = subscribe(
      this.messageContext, 
      EMPLOYEE_UPDATE_MESSAGE,
      message => {
        this.employees = [...message.employees];
        
        this.totalRecord = this.employees.length;
        this.totalPage = Math.ceil(this.totalRecord / this.pageSize);
        this.page = 0;
        this.pageNext();
        
        this.allSelectedRows = [];
        this.sortRows(this.sortedBy, this.sortedDirection);
        // console.log('Datatable height:', this.template.querySelector('.slds-table_header-fixed_container').clientHeight);
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

  get firstShowRowNumber() {
    return this.startingRecord + 1;
  }

  get selectedRowsFirst() {
    return this.showedEmployees
      .filter(employee => this.allSelectedRows.includes(employee))
      .map(employee => employee.Id);
  }

  handleRowAction(e) {
    const actionName = e.detail.action.name;
    const row = e.detail.row;

    switch(actionName){
      case 'urlRedirect':
        this.showRowDetails(row);
        break;
      default:
    }
  }

  showRowDetails(row) {
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: row.Id,
        objectApiName: 'Employee__c',
        actionName: 'view'
      }
    });
  }

  handleOnSort(e) {
    this.sortedBy = e.detail.fieldName;
    this.sortedDirection = e.detail.sortDirection;
    this.sortRows(this.sortedBy, this.sortedDirection);
    console.log(this.sortedBy, this.sortedDirection);
  }

  sortRows(field, direction) {
    let sortingEmployees = [...this.employees];
    let isAsc = () => {
      if (direction == 'asc') {
        return 1;
      }
      return -1;
    };

    // ボタン化した項目はラベル項目を指定しないと正しくソートできない
    if (field == 'Id') {
      field = 'EmployeeId__c';
    }

    sortingEmployees.sort((a, b) => {
      a = a[field];
      b = b[field];

      if (a > b) {
        return isAsc() * 1;
      }
      return isAsc() * -1;
    });

    // 元の配列をすべてソートする（ページネーション対応のため）
    this.employees = [...sortingEmployees];
    this.showedEmployees = [...this.employees.slice(this.startingRecord, this.endingRecord)];
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

  showModal() {
    console.log('------SelectedEmployees------\n', JSON.parse(JSON.stringify(this.allSelectedRows)));
    CreatingHistoryModal.open({ employees: this.allSelectedRows }).then(result => {
      console.log(JSON.parse(JSON.stringify(result)));
    });
  }


  // Datatableのページネーション
  pageNext() {
    this.page++;
    this.changePage(this.page);
  }

  pagePrevious() {
    this.page--;
    this.changePage(this.page);
  }

  changePage(page) {
    this.startingRecord = (page - 1) * this.pageSize;

    if (page * this.pageSize > this.totalRecord) {
      this.endingRecord = this.totalRecord;
    } else {
      this.endingRecord = page * this.pageSize;
    }

    this.showedEmployees = [...this.employees.slice(this.startingRecord, this.endingRecord)];
  }
}