public with sharing class ExamHistoryTriggerHandler {
  public void afterInsert(List<ExamHistory__c> histories) {
    TriggerUtility.addTotalFee(histories);
  }

  public void afterUpdate(List<ExamHistory__c> histories) {
    TriggerUtility.addTotalFee(histories);
  }

  public void afterDelete(List<ExamHistory__c> histories) {
    TriggerUtility.addTotalFee(histories);
  }
}