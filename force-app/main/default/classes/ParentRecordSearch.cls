public with sharing class ParentRecordSearch {
  @AuraEnabled
  public static List<Map<String, String>> getParentRecord(String objectApi) {
    // String objectApi = 'Certification__c';
    String query = 'SELECT Name FROM ' + String.escapeSingleQuotes(objectApi);

    List<Map<String, String>> selectOptions = new List<Map<String, String>>();
    // 型を指定しないと項目が取得できない（sObjectだと不可能）
    if (objectApi == 'Certification__c') {
      List<Certification__c> records = Database.query(query);
      for (Certification__c record : records) {
        selectOptions.add(new Map<String, String>{'label' => record.Name, 'value' => record.Name});
        System.debug(record);
      }
    }
    System.debug(selectOptions);
    return selectOptions;
  }
}