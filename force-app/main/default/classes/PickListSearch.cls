public with sharing class PickListSearch {
  @AuraEnabled
  public static List<Map<String, String>> getPickList(String objectApi, String pickListApi) {
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
}