package org.algoritmed.algoritmedtelegram01.mcrdb;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ExecuteSqlBlock {
    protected static final Logger logger = LoggerFactory.getLogger(ExecuteSqlBlock.class);

    protected @Autowired NamedParameterJdbcTemplate dbParamJdbcTemplate;
    protected @Autowired JdbcTemplate dbJdbcTemplate;

    public Map<String, Object> getDbRest01() {
        String sql = "SELECT * FROM doc LIMIT 1";
        Map<String, Object> map = new HashMap<String, Object>();
        List<Map<String, Object>> queryForList = dbParamJdbcTemplate.queryForList(sql, map);
        map.put("o", queryForList.get(0));
        logger.info("-20- " + map);
        return map;
    }

    @Transactional
    public void executeSql(Map<String, Object> data) {
        // System.out.println(data);
        String sql = (String) data.get("sql");
        // System.out.println(sql);
        updateNewIds(sql, data);

        int i = 0;
        for (String sql_command : sql.split(";")) {
            System.err.println("--125-- i = " + i);
            String sql2 = sql_command.trim();
            System.err.println("--127-- sql2 = " + sql2);
            String first_word = sql2.split(" ")[0];
            if ("SELECT".equals(first_word)) {
                List<Map<String, Object>> list = dbParamJdbcTemplate.queryForList(sql2, data);
                data.put("list" + i, list);
            } else {
                int update = dbParamJdbcTemplate.update(sql2, data);
                data.put("update_" + i, update);
            }
            i++;
        }
    }

    private void updateNewIds(String sql, Map<String, Object> data) {
        String[] split_nextDbId = null;
        try {
            split_nextDbId = sql.split("nextDbId");
        } catch (Exception e) {
            System.err.println(sql);
            System.err.println(data);
            System.err.println(e);
            return;
        }
        System.err.println("-151- nextDbId cnt=" + split_nextDbId.length);
        if (split_nextDbId.length > 0) {
            HashMap<Integer, Integer> nextDbMap = new HashMap<>();
            for (int i = 1; i < split_nextDbId.length; i++) {
                String s1 = split_nextDbId[i];
                String s2 = s1.split(" ")[0];
                s2 = s2.replaceAll(",", "").replaceAll("\\)", "").replaceAll(";", "");
                s2 = s2.trim();
                System.out.println("s2 = " + s2);
                // System.out.println("s1 = "+s1);
                int nextDbKey = Integer.parseInt(s2);
                nextDbMap.put(nextDbKey, nextDbKey);
            }
            System.err.println(nextDbMap.keySet());
            System.err.println(nextDbMap.keySet().size());

            System.err.println("----81----");

            for (Integer key : nextDbMap.keySet())
                data.put("nextDbId" + key, nextDbId());

            if (data.containsKey("uuid") && data.get("uuid").equals("uuid"))
                data.put("uuid", UUID.randomUUID());
            System.err.println(data);
        }
    }

    /**
     * Генератор наступного ID единого для всієї БД.
     * 
     * @return Наступний ID единий для всієй БД.
     */
    protected Integer nextDbId() {
        // String sql_nextDbId = env.getProperty("sql_app.nextDbId");
        // Integer nextDbId = dbJdbcTemplate.queryForObject(sql_nextDbId,
        // Integer.class);
        String sql_nextDbId = "SELECT nextval('dbid')";
        Integer nextDbId = dbJdbcTemplate.queryForObject(sql_nextDbId, Integer.class);
        return nextDbId;
    }

    public Map<String, Object> sqlParamToMap(HttpServletRequest request) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        Map<String, Object> map = new HashMap<String, Object>();
        for (String key : parameterMap.keySet()) {
            String[] v = parameterMap.get(key);
            String val = v[0];
            map.put(key, val);
        }
        map.remove("sql");
        return map;
    }

    public List<Map<String, Object>> qForList(String sql, Map<String, Object> map) {
        List<Map<String, Object>> list = dbParamJdbcTemplate.queryForList(sql, map);
        return list;
    }
}
