trigger AddTotalFee on ExamHistory__c (before insert, before update, before delete) {

  List<ExamHistory__c> beforeLogs;
  List<ExamHistory__c> logs;

  if (Trigger.isInsert) {
    logs = Trigger.new.clone();

  } else if (Trigger.isUpdate) {
    beforeLogs = [SELECT Status__c FROM ExamHistory__c WHERE Id IN :Trigger.old];
    logs = Trigger.new.clone();

  } else {
    logs = Trigger.old.clone();
  }

  // 処理対象外のトリガレコードを省く
  if (Trigger.isInsert || Trigger.isDelete) {
    Integer count = 0;
    while (count < logs.size()) {

      // Status__cは申込前（beforeApplication）、申込済み（afterApplication）、受験済み（afterExam）の3種類
      if (!logs[count].Status__c.contains('after')) {
        logs.remove(count);
      } else {
        count++;
      }
    }
  } else {
    Integer count = 0;
    while (count < logs.size()) {

      String before = beforeLogs[count].Status__c;
      String after = logs[count].Status__c;
      if (before == after || (before.contains('after') && after.contains('after'))) {
        logs.remove(count);
        beforeLogs.remove(count);
      } else {
        count++;
      }
    }
  }

  // 親レコードの取得
  Set<Id> employeeIdSet = new Set<Id>();
  Set<Id> certificationIdSet = new Set<Id>();

  for (ExamHistory__c log : logs) {
    employeeIdSet.add(log.EmployeeName__c);
    certificationIdSet.add(log.CertificationName__c);
  }
  
  List<Employee__c> employees = [SELECT Name, CertificationTotalFee__c FROM Employee__c WHERE Id IN :employeeIdSet];
  List<Certification__c> certifications = [SELECT Name, CertificationFee__c FROM Certification__c WHERE Id IN :certificationIdSet];

  // nullだと計算不可能
  for (Employee__c employee : employees) {
    if (employee.CertificationTotalFee__c == null) {
      employee.CertificationTotalFee__c = 0;
    }
  }

  for (Integer i = 0; i < logs.size(); i++) {

    // ToDo：3重ループをなくしたい（逐一SOQL文を使えば可能だが、ガバナ制限に引っかかる可能性あり）
    for (Employee__c employee : employees) {
      if (employee.Id == logs[i].EmployeeName__c) {

        for (Certification__c certification : certifications) {
          if (certification.Id == logs[i].CertificationName__c) {

            if (Trigger.isInsert) {
              employee.CertificationTotalFee__c += certification.CertificationFee__c;
      
            } else if (Trigger.isUpdate) {
              String before = beforeLogs[i].Status__c;
              String after = logs[i].Status__c;
    
              if (before.equals('beforeApplication') && after.contains('after')) {
                employee.CertificationTotalFee__c += certification.CertificationFee__c;
    
              } else if (before.contains('after') && after.equals('beforeApplication')) {
                employee.CertificationTotalFee__c -= certification.CertificationFee__c;
              }
    
            } else {
              employee.CertificationTotalFee__c -= certification.CertificationFee__c;
            }
          }
        }
      }
    }
  }
  System.debug(employees);

  update employees;
}