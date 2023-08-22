import { LightningElement, api, wire } from 'lwc';
import getCertificationMap from '@salesforce/apex/QueryFieldController.getCertificationMap';
import getPickListMap from '@salesforce/apex/QueryFieldController.getPickListMap';
import selectEmployee from '@salesforce/apex/EmployeeController.selectEmployee';

const columns = [
  { label: '従業員ID', fieldName: 'EmployeeId__c', sortable: true },
  { label: '名前', fieldName: 'Name', sortable: true },
  { label: '部署', fieldName: 'Department__c', sortable: true },
  { label: '入社日', fieldName: 'HireDate__c', type: 'date', sortable: true },
  { label: 'メール', fieldName: 'Mail__c', type: 'email', sortable: true },
  { label: '総受験料', fieldName: 'CertificationTotalFee__c', type: 'currency', sortable: true },
];

export default class EmployeeSearch extends LightningElement {
  selectedCertification;
  // selectedCertifications = [];
  selectedStatus = [];
  selectedResults = [];
  selectedDateBefore;
  selectedDateAfter;

  certificationList = [];
  statusList = [];
  resultList = [];

  discoveredEmployees = [];
  columns = columns;

  conditionBlock = [];
  searchCondition = '';


  connectedCallback() {
    this.getMetadata();
    this.search();
  }


  getMetadata = () => {
    getCertificationMap().then(list => {
      this.certificationList = [{label: '--未選択--', value: 'null'}, ...list];
    }).catch(error => {
      console.error(error);
    });

    getPickListMap({ objectApi: 'ExamHistory__c', pickListApi: 'Status__c' }).then(list => {
      this.statusList = [...list];
    }).catch(error => {
      console.error(error);
    });

    getPickListMap({ objectApi: 'ExamHistory__c', pickListApi: 'CertificationResult__c' }).then(list => {
      this.resultList = [...list, {label: '記載なし', value: 'null'}];
    }).catch(error => {
      console.error(error);
    });
  }
  

  search = () => {
    this.conditionBlock = [];
    this.searchCondition = '';

    if (this.selectedCertification && this.selectedCertification != 'null') {
      // シングルクォーテーション必須
      this.conditionBlock.push('CertificationName__r.Name = \'' + this.selectedCertification + '\'');
    }
    if (this.selectedStatus.length) {
      this.conditionBlock.push('Status__c' + this.createIn(this.selectedStatus));
    }
    if (this.selectedResults.length) {
      this.conditionBlock.push('CertificationResult__c' + this.createIn(this.selectedResults));
    }
    if (this.selectedDateAfter) {
      this.conditionBlock.push('ExamDate__c > ' + this.selectedDateAfter);
    }
    if (this.selectedDateBefore) {
      this.conditionBlock.push('ExamDate__c < ' + this.selectedDateBefore);
    }

    // console.log(this.conditionBlock[0]);
    if (this.conditionBlock.length) {
      this.searchCondition += this.conditionBlock[0];
    }
    for (let i = 1; i < this.conditionBlock.length; i++) {
      this.searchCondition += (' AND ' + this.conditionBlock[i]);
    }

    console.log('------Condition------\n', this.searchCondition);

    selectEmployee({condition: this.searchCondition}).then((list) => {
      this.discoveredEmployees = list;
      console.log('------Employee------\n', this.discoveredEmployees);

    }).catch(error => {
      console.error(error);
    });
  }


  createIn = (pickList) => {
    let condition = ' IN (';
    for (let i = 0; i < pickList.length; i++) {
      if (pickList[i] == 'null') {
        condition += ('\'\'');
      } else {
        condition += ('\'' + pickList[i] + '\'');
      }
      if (i < pickList.length - 1) {
        condition += ', ';
      }
    }
    condition += ')';

    return condition;
  }
  

  handleCertificationChange(e) {
    this.selectedCertification = e.detail.value;
    console.log('資格：', this.selectedCertification);
  }

  handleStatusChange(e) {
    this.selectedStatus = e.detail.value;
    console.log('ステータス：', this.selectedStatus);
  }

  handleResultChange(e) {
    this.selectedResults = e.detail.value;
    console.log('合否：', this.selectedResults);
  }

  handleDateBeforeChange(e) {
    this.selectedDateBefore = e.detail.value;
    console.log('終了日：', this.selectedDateBefore);
  }

  handleDateAfterChange(e) {
    this.selectedDateAfter = e.detail.value;
    console.log('開始日：', this.selectedDateAfter);
  }
}