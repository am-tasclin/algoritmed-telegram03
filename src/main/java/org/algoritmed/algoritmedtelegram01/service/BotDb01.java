package org.algoritmed.algoritmedtelegram01.service;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.script.SimpleBindings;
import java.util.AbstractMap.SimpleEntry;

import org.algoritmed.algoritmedtelegram01.amdb.SqlCmd;
import org.algoritmed.algoritmedtelegram01.mcrdb.ExecuteSqlBlock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.User;

@Component
public class BotDb01 {
    protected static final Logger logger = LoggerFactory.getLogger(BotDb01.class);

    private String questionList(int parentId) {
        String sql = executeJS.executeJsFn("replaceSql(sql_app.careplan_action_reason_observation.sqlWithParent)");
        Map map = new SimpleBindings(Stream.of(new SimpleEntry<>("sql", sql), new SimpleEntry<>("parentId", parentId))
                .collect(Collectors.toMap(SimpleEntry::getKey, SimpleEntry::getValue)));
        executeSqlBlock.executeSql(map);
        int i = 0;
        String s = "Опитувальник:";
        for (Map m : (List<Map>) map.get("list0"))
            s += "\n\n" + ++i + ") /o_" + m.get("row_id") + ":" + m.get("observation");
        return s;
    }

    public SendMessage start(Message message) {
        String s = questionList(373843);
        logger.info("--49--"
                + "\n s: " + s);
        SendMessage sm = new SendMessage();
        sm.setText(s);
        return sm;
    }

    public SendMessage command01(Message message) {
        SendMessage sm = null;
        String text = message.getText(),
                text1 = text.substring(1);
        // logger.info("--23--\n"
        //         // + "\ntext:" + text
        //         + "\n text1:" + text1
        //         + "\n text1:" + ("start" == text1)
        //         + "\n text1:" + text1.equals("start")
        // // + "\n " + text.indexOf("/")
        // );
        if ("start".equals(text1)) {
            sm = start(message);
        }
        return sm;
    }

    public Map<String, Object> patient01(Message message, Map messageData) {
        User from = message.getFrom();

        Map<String, Object> fromUserMap = SqlCmd.userFromTelegramToMap(from.toString());
        // String sql = executeJS
        // .executeJsFn("replaceSql(sql_app.careplan_action_reason_observation.sqlWithParent).replace(':parentId',"
        // + 123 + ")");
        // logger.info("--34--"
        // + "\n From.lastName:" + fromUserMap.get("lastName")
        // + "\n From.id:" + fromUserMap.get("id")
        // + "\n From: " + fromUserMap
        // + "\n sql: " + sql);
        fromUserMap.put("sql", SqlCmd.seek_patient_from_telegram);
        executeSqlBlock.executeSql(fromUserMap);
        logger.info("--34--" + fromUserMap);
        List l = (List) fromUserMap.get("list0");
        if (l.size() > 0) {
            System.err.println("--38-- вже записаний");
        } else {
            Timestamp eocPeriodStart = new Timestamp(Calendar.getInstance().getTime().getTime());
            fromUserMap.put("eocPeriodStart", eocPeriodStart);
            fromUserMap.put("sql", SqlCmd.insert_patient_from_telegram);
            executeSqlBlock.executeSql(fromUserMap);
        }
        return fromUserMap;
    }

    private String replaceField(String sql, String fieldName, Map map) {
        return sql.replace(":" + fieldName, "\"" + map.get(fieldName) + "\"");
    }

    protected @Autowired ExecuteSqlBlock executeSqlBlock;
    protected @Autowired ExecuteJS executeJS;

}
