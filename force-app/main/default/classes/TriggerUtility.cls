public with sharing class TriggerUtility {
  public static void addTotalFee(List<ExamHistory__c> triggeredHistories) {
    
    // トリガされた受験履歴に関連する従業員を取得
    Map<Id, Employee__c> employeeMap = getRelatedEmployeeMap(triggeredHistories);

    // 関連する従業員の全受験履歴を取得
    List<ExamHistory__c> histories = [SELECT Status__c, EmployeeName__c, CertificationName__c FROM ExamHistory__c WHERE EmployeeName__c IN :employeeMap.keySet()];

    // 受験履歴に関連する資格を取得
    Map<Id, Certification__c> certificationMap = getRelatedCertificationMap(histories);

    // 最初に総受験料を¥0に初期化
    for (Employee__c employee : employeeMap.values()) {
      employee.CertificationTotalFee__c = 0;
    }

    for (ExamHistory__c history : histories) {
      Employee__c employee = employeeMap.get(history.EmployeeName__c);
      Certification__c certification = certificationMap.get(history.CertificationName__c);

      if (history.Status__c.contains('after')) {
        employee.CertificationTotalFee__c += certification.CertificationFee__c;
      }
    }

    update employeeMap.values();
  }


  public static Map<Id, Employee__c> getRelatedEmployeeMap(List<ExamHistory__c> histories) {
    Set<Id> employeeIdSet = new Set<Id>();
    for (ExamHistory__c history : histories) {
      employeeIdSet.add(history.EmployeeName__c);
    }

    return new Map<Id, Employee__c>([SELECT Name, CertificationTotalFee__c FROM Employee__c WHERE Id IN :employeeIdSet]);
  }


  public static Map<Id, Certification__c> getRelatedCertificationMap(List<ExamHistory__c> histories) {
    Set<Id> certificationIdSet = new Set<Id>();
    for (ExamHistory__c history : histories) {
      certificationIdSet.add(history.CertificationName__c);
    }

    return new Map<Id, Certification__c>([SELECT Name, CertificationFee__c FROM Certification__c WHERE Id IN :certificationIdSet]);
  }
}