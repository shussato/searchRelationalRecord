import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getCertificationMap from '@salesforce/apex/QueryFieldController.getCertificationMap';
import createExamHistory from '@salesforce/apex/EmployeeController.createExamHistory';

export default class CreatingHistoryModal extends LightningModal {
  @api employees;
  certifications;
  @track certificationPlans = [];

  connectedCallback() {
    getCertificationMap().then(list => {
      this.certifications = [...list];

      const plan = {
        certification: null, 
        date: null
      };
      this.certificationPlans.push(plan);

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

  handleRemove(e) {
    console.log('delete employee index:', e.target.dataset.index);
    // this.employees.splice(e.target.dataset.index, 1);
  }

  handleCertificationChange(e) {
    const index = e.target.dataset.index;
    const value = e.detail.value;
    console.log('index:', index);
    console.log('Certification:', value);

    this.certificationPlans[index].certification = value;
  }

  handleDateChange(e) {
    const index = e.target.dataset.index;
    const value = e.detail.value;
    console.log('index:', index);
    console.log('Date:', value);

    this.certificationPlans[index].date = value;
  }

  addPlan() {
    console.log('add plan');
    const plan = {
      certification: null, 
      date: null
    };
    this.certificationPlans.push(plan);
  }

  deletePlan(e) {
    console.log('delete plan index:', e.target.dataset.index);
    this.certificationPlans.splice(e.target.dataset.index, 1);
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