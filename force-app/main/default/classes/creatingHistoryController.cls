public with sharing class creatingHistoryController {
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