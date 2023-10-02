public with sharing class Utility {
  @AuraEnabled
  public static List<Map<String, String>> getPickListMap(String objectApi, String pickListApi) {
    // String objectApi = 'ExamHistory__c';
    // String pickListApi = 'Status__c';

    DescribeSObjectResult objectResult = Schema.getGlobalDescribe().get(objectApi).getDescribe();
    DescribeFieldResult fieldResult = objectResult.fields.getMap().get(pickListApi).getDescribe();
    System.debug(fieldResult);

    List<Map<String, String>> selectOptions = new List<Map<String, String>>();

    String dataType = String.valueOf(fieldResult.getType());
    if (dataType == 'PICKLIST') {
      for (PicklistEntry entry : fieldResult.getPicklistValues()) {
        selectOptions.add(new Map<String, String>{'label' => entry.getLabel(), 'value' => entry.getValue()});
      }
    }

    System.debug(selectOptions);
    return selectOptions;
  }


  @AuraEnabled
  public static List<Map<String, String>> getCertificationMap() {

    List<Map<String, String>> selectOptions = new List<Map<String, String>>();
    for (Certification__c record : [SELECT Name FROM Certification__c ORDER BY CertificationCode__c]) {
      selectOptions.add(new Map<String, String>{'label' => record.Name, 'value' => record.Id});
      System.debug(record);
    }

    System.debug(selectOptions);
    return selectOptions;
  }
}