public with sharing class EmployeeController {
  @AuraEnabled
  public static List<Employee__c> selectEmployee(String condition) {
    List<Employee__c> employees;
    if (condition.length() == 0) {
      employees = [SELECT EmployeeId__c, Name, Department__c, HireDate__c, Mail__c, CertificationTotalFee__c FROM Employee__c ORDER BY EmployeeId__c];
      
    } else {
      Set<Id> employeeIdSet = new Set<Id>();
      String query = 'SELECT EmployeeName__c FROM ExamHistory__c WHERE ' + condition + ' GROUP BY EmployeeName__c';
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

  @AuraEnabled
  public static List<ExamHistory__c> createExamHistory(List<Employee__c> employees, String stringPlan) {
    List<ExamHistory__c> histories = new List<ExamHistory__c>();
    List<Object> plans = (List<Object>)JSON.deserializeUntyped(stringPlan);

    for (Object plan : plans) {
      Map<String, Object> planMap = (Map<String, Object>)plan;

      for (Employee__c employee : employees) {
        ExamHistory__c history = new ExamHistory__c(Name=employee.Name + '_' + String.valueOf(planMap.get('date')),
                                                    EmployeeName__c=employee.Id,
                                                    CertificationName__c=String.valueOf(planMap.get('certification')),
                                                    ExamDate__c=Date.valueOf(String.valueOf(planMap.get('date'))),
                                                    Status__c='beforeApplication'
                                                    );

        histories.add(history);
      }
    }

    System.debug(histories);
    insert histories;
    return histories;
  }
}