import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getCertificationMap from '@salesforce/apex/QueryFieldController.getCertificationMap';
import createExamHistory from '@salesforce/apex/EmployeeController.createExamHistory';

export default class CreatingHistoryModal extends LightningModal {
  @api employees;
  certifications;
  @track selectableCertifications = [];
  @track certificationPlans = [];

  connectedCallback() {
    getCertificationMap().then(list => {
      this.certifications = [...list];
      this.selectableCertifications.push(list);
      this.certificationPlans.push({ certification: null, date: null });

    }).catch(error => {
      console.error(error);
    });
  }

  get isOnePlan() {
    return this.certificationPlans.length == 1;
  }

  get isNotCreatable() {
    for (const plan of this.certificationPlans) {
      if (plan.certification == null || plan.date == null) {
        return true;
      }
    }
    return false;
  }

  closeModal() {
    this.close('Modal closed');
  }

  handleCertificationChange(e) {
    const index = e.target.dataset.index;
    const value = e.detail.value;
    console.log('index:', index);
    console.log('Certification:', value);

    this.certificationPlans[index].certification = value;

    this.selectableCertifications = [...this.updatePicklists(this.selectableCertifications, this.certificationPlans)];
  }

  handleDateChange(e) {
    const index = e.target.dataset.index;
    const value = e.detail.value;
    console.log('index:', index);
    console.log('Date:', value);

    this.certificationPlans[index].date = value;
  }

  updatePicklists(oldPicklists, plans) {
    const selectedCertifications = plans.map(plan => plan.certification);

    let newPicklists = [];
    for (let i = 0; i < oldPicklists.length; i++) {
      let picklist = this.certifications.filter(certification => {
        return !selectedCertifications.includes(certification.value) || selectedCertifications[i] == certification.value;
      });
      newPicklists.push(picklist);
    }

    return newPicklists;
  }

  addPlan() {
    console.log('add plan');
    this.certificationPlans.push({ certification: null, date: null });

    let picklist = this.certifications.filter(certification => {
      return !this.certificationPlans.map(plan => plan.certification).includes(certification.value);
    });
    this.selectableCertifications.push(picklist);
  }

  deletePlan(e) {
    const index = e.target.dataset.index;
    console.log('delete plan index:', index);

    this.certificationPlans.splice(index, 1);
    this.selectableCertifications.splice(index, 1);

    this.selectableCertifications = [...this.updatePicklists(this.selectableCertifications, this.certificationPlans)];

    // 値を再設定しないと画面に反映されない
    let htmlCertifications = this.template.querySelectorAll('lightning-combobox');
    let htmlDates = this.template.querySelectorAll('lightning-input');

    for (let i = 0; i < htmlCertifications.length; i++) {
      htmlCertifications[i].value = this.certificationPlans[i].certification;
      htmlDates[i].value = this.certificationPlans[i].date;
    }

  }

  setPlans() {
    console.log('Employees', JSON.parse(JSON.stringify(this.employees)));
    console.log('Plans', JSON.parse(JSON.stringify(this.certificationPlans)));

    createExamHistory({ employees: this.employees, stringPlan: JSON.stringify(this.certificationPlans) }).then(list => {
      if (list.length) {
        const toastEvent = new ShowToastEvent({
          title: '受験履歴が作成されました',
          variant: 'success'
        });
        this.dispatchEvent(toastEvent);

        console.log('Created histories', list);
        this.closeModal();
      }
    })
  }
}