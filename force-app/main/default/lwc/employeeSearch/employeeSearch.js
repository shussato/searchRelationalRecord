import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import EMPLOYEE_UPDATE_MESSAGE from '@salesforce/messageChannel/EmployeeUpdate__c';
import getCertificationMap from '@salesforce/apex/Utility.getCertificationMap';
import getPickListMap from '@salesforce/apex/Utility.getPickListMap';
import selectEmployee from '@salesforce/apex/EmployeeSearchController.selectEmployee';

export default class EmployeeSearch extends LightningElement {
  @wire(MessageContext) messageContext;

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

  conditionBlock = [];
  searchCondition = '';


  connectedCallback() {
    this.getMetadata();
    this.search();
  }


  getMetadata() {
    getCertificationMap().then(list => {
      this.certificationList = [{ label: '--未選択--', value: 'null' }, ...list];
    }).catch(error => {
      console.error(error);
    });

    getPickListMap({ objectApi: 'ExamHistory__c', pickListApi: 'Status__c' }).then(list => {
      this.statusList = [...list];
    }).catch(error => {
      console.error(error);
    });

    getPickListMap({ objectApi: 'ExamHistory__c', pickListApi: 'CertificationResult__c' }).then(list => {
      this.resultList = [...list, { label: '記載なし', value: 'null' }];
    }).catch(error => {
      console.error(error);
    });
  }
  

  search() {
    this.conditionBlock = [];
    this.searchCondition = '';

    if (this.selectedCertification && this.selectedCertification != 'null') {
      // シングルクォーテーション必須
      this.conditionBlock.push('CertificationName__r.Id = \'' + this.selectedCertification + '\'');
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

    this.searchCondition = this.conditionBlock.join(' AND ');
    console.log('------Condition------\n', this.searchCondition);

    selectEmployee({ condition: this.searchCondition }).then((list) => {
      this.discoveredEmployees = list;
      publish(this.messageContext, EMPLOYEE_UPDATE_MESSAGE, { employees: this.discoveredEmployees });
      console.log('------Employees------\n', this.discoveredEmployees);

    }).catch(error => {
      console.error(error);
    });
  }


  createIn(pickList) {
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