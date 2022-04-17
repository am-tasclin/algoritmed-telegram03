package org.algoritmed.algoritmedtelegram01.amdb;

import java.util.HashMap;
import java.util.Map;

public class SqlCmd {
    public static String seek_patient_from_telegram = "SELECT parent, iu.* FROM doc, integer_u iu \n "
        +" WHERE doc_id=integer_u_id AND group_id=373924 AND value=:id ";
    public static String insert_patient_from_telegram = ""
            + "INSERT INTO doc (doc_id, parent, reference) VALUES (:nextDbId1, 373922, 372116 ); \n"//lastName
            + " INSERT INTO string (string_id, value) VALUES (:nextDbId1, :lastName ); \n"
            + "INSERT INTO doc (doc_id, parent, reference) VALUES (:nextDbId2, :nextDbId1, 372117 ); \n"//firstName
            + " INSERT INTO string (string_id, value) VALUES (:nextDbId2, :firstName ); \n"
            + "INSERT INTO doc (doc_id, parent, reference, reference2) VALUES (:nextDbId3, 373825, 373423, :nextDbId1 ); \n"//Patient
            + "INSERT INTO doc (doc_id, parent, reference, reference2) VALUES (:nextDbId4, :nextDbId3, 373931, 373922 ); \n"//ID: telegram person ID
            + " INSERT INTO integer_u (integer_u_id, group_id, value) VALUES (:nextDbId4, 373924, :id ); \n"
            + "INSERT INTO doc (doc_id, parent, reference, reference2) VALUES (:nextDbId5, 373952,  368896, :nextDbId3 ); \n"//EpisodeOfCare
            + "INSERT INTO doc (doc_id, parent, reference, reference2) VALUES (:nextDbId6, :nextDbId5,  368894, 368679 ); \n"//EpisodeOfCare.period.start
            + " INSERT INTO timestamp (timestamp_id, value) VALUES (:nextDbId6, :eocPeriodStart ); \n"
            ;

    // public static String userToMap(String userStr) {
    public static Map<String, Object> userFromTelegramToMap(String from) {
        String lastK = null;
        Map<String, Object> userMap = new HashMap<>();
        String[] fromSplit = from.replace("User(", "").replace(")", "").split(",");
        for (String k_v : fromSplit) {
            String[] kvS = k_v.split("=");
            if (kvS.length == 2) {
                lastK = kvS[0].trim();
                userMap.put(lastK, kvS[1]);
            } else if (lastK != null)
                userMap.put(lastK, userMap.get(lastK) + "," + kvS[0]);// coma restore
        }
        int id = Integer.parseInt(userMap.get("id").toString());
        userMap.put("id", id);
        return userMap;
    }

}
