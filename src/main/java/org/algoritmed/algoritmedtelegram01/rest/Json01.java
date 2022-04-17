package org.algoritmed.algoritmedtelegram01.rest;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class Json01 {
    protected static final Logger logger = LoggerFactory.getLogger(Json01.class);

    @GetMapping("/json01")
    public @ResponseBody Map<String, Object> getJson01() {
        Map<String, Object> m = new HashMap<String, Object>();
        m.put("k", "value");
        m.put("key", 11);
        logger.info("-- " + m);
        return m;
    }
}
