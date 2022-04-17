package org.algoritmed.algoritmedtelegram01.rest;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.algoritmed.algoritmedtelegram01.mcrdb.ExecuteSqlBlock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class DbRest01 {
	protected static final Logger logger = LoggerFactory.getLogger(DbRest01.class);

	@GetMapping("/r/url_sql_read_db1")
	public @ResponseBody Map<String, Object> url_sql_read_db1(@RequestParam(value = "sql", required = true) String sql,
			HttpServletRequest request) {
		Map<String, Object> map = executeSqlBlock.sqlParamToMap(request);
		// Map m = new HashMap();
		// m.put("k", "v");
		// m.put("sql", sql);
		// System.out.println(map);
		logger.info("\n--57-- /r/url_sql_read_db1" + " SQL = " + sql.length()
		// + "\n" + data
		);
		// System.out.println(sql);
		List<Map<String, Object>> list = executeSqlBlock.qForList(sql, map);
		map.put("list", list);
		return map;
	}

	// @Transactional
	@PostMapping("/r/url_sql_read_db1")
	public @ResponseBody Map<String, Object> url_sql_read_db1(@RequestBody Map<String, Object> data,
			HttpServletRequest request, Principal principal) {
		logger.info("\n--35---Post-- " + "/r/url_sql_read_db1" + " SQL = \n" + data.get("sql")
		// + "\n" + data
		);
		executeSqlBlock.executeSql(data);
		data.remove("sql");
		return data;
	}

	@GetMapping("/dbrest01")
	public @ResponseBody Map<String, Object> getDbRest01() {
		return executeSqlBlock.getDbRest01();
	}

	protected @Autowired ExecuteSqlBlock executeSqlBlock;

}
