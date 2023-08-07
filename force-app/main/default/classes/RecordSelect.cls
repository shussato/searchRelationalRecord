public with sharing class RecordSelect {
  @AuraEnabled
  public static List<Employee__c> selectRecord(String condition) {
    List<Employee__c> employees;
    if (condition.length() == 0) {
      // query = 'SELECT EmployeeName__c FROM ExamHistory__c GROUP BY EmployeeName__c';
      employees = [SELECT EmployeeId__c, Name, Department__c, HireDate__c, Mail__c, CertificationTotalFee__c FROM Employee__c ORDER BY EmployeeId__c];
      
    } else {
      String query = 'SELECT EmployeeName__c FROM ExamHistory__c WHERE ' + condition + ' GROUP BY EmployeeName__c';
      Set<Id> employeeIdSet = new Set<Id>();
      for (AggregateResult employee : Database.query(query)) {
        // Object -> String -> Id
        employeeIdSet.add(Id.valueOf(String.valueOf(employee.get('EmployeeName__c'))));
      }
      // System.debug(employeeIdSet);
      employees = [SELECT EmployeeId__c, Name, Department__c, HireDate__c, Mail__c, CertificationTotalFee__c FROM Employee__c WHERE Id IN :employeeIdSet ORDER BY EmployeeId__c];
    }
    
    System.debug(employees);
    return employees;
  }
}