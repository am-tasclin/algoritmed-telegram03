package org.algoritmed.algoritmedtelegram01;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.script.Bindings;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.script.SimpleBindings;

import java.util.AbstractMap.SimpleEntry;

import org.algoritmed.algoritmedtelegram01.amdb.SqlCmd;
import org.mozilla.javascript.Context;

public class MainTest {
    public static void main(String[] args) {
        System.out.println("Hello Java World!\n");
        Timestamp ts = new Timestamp(Calendar.getInstance().getTime().getTime());
        System.out.println("Hello ts !\n" + ts);
        x05();
        Context ct = Context.enter();
    }

    private static void x05() {
        ScriptEngine engine = engineJS();
        String fp = "/home/roman/algoritmed-telegram/algoritmed-telegram02/src/main/resources/static/f/conf/sql_app.telegram.js";
        try {
            engine.eval(Files.newBufferedReader(Paths.get(fp), StandardCharsets.UTF_8));
            Map result = (Map) engine.eval("sql_app.careplan_action_reason_observation");
            System.out.println("Result returned by Javascript is: \n" + result.get("sql"));
            String result2 = (String) engine.eval("replaceSql(sql_app.careplan_action_reason_observation.sqlWithParent).replace(':parentId',"+123+")");
            System.out.println("Result-2 returned by Javascript is: \n" + result2);
        } catch (ScriptException | IOException e) {
            e.printStackTrace();
        }

    }

    private static void x04() throws ScriptException {
        ScriptEngine engine = engineJS();
        Bindings bindings = new SimpleBindings(Stream.of(new SimpleEntry<>("a", 10), new SimpleEntry<>("b", 20))
                .collect(Collectors.toMap(SimpleEntry::getKey, SimpleEntry::getValue)));
        Double eval = (Double) engine.eval("a + b", bindings);
        System.out.println(eval);
    }

    private static void x03() {
        ScriptEngine engine = engineJS();
        try {
            engine.eval("print('Hello, JS World')");
        } catch (ScriptException e) {
            e.printStackTrace();
        }
    }

    private static ScriptEngine engineJS() {
        return new ScriptEngineManager().getEngineByName("javascript");
        // return new ScriptEngineManager().getEngineByName("javascript");
    }

    private static void x02() {
        String from = "User(id=863820426, firstName=Roman, isBot=false, lastName=Mishchenko, Algoritmed, userName=romish183, languageCode=uk, canJoinGroups=null, canReadAllGroupMessages=null, supportInlineQueries=null)";
        Map<String, Object> userMap = SqlCmd.userFromTelegramToMap(from);
        System.out.println(from + "\n\n" + userMap);
    }

    private static void x01() {
        try {
            Thread.sleep(3000);
            System.out.println("Hello World! after 3 sec");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
        }
    }
}
