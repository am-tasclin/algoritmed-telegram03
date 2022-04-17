package org.algoritmed.algoritmedtelegram01.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ExecuteJS {
    protected static final Logger logger = LoggerFactory.getLogger(ExecuteJS.class);

    private @Value("${algoritmed.approot}") String approot;
    private @Value("${algoritmed.sqlfile01}") String sqlfile;

    ScriptEngine engine = null;

    private ScriptEngine getEngine() {
        if (engine == null) {
            engine = new ScriptEngineManager().getEngineByName("javascript");
            try {
                engine.eval(Files.newBufferedReader(Paths.get(approot + sqlfile), StandardCharsets.UTF_8));
            } catch (ScriptException | IOException e) {
                e.printStackTrace();
            }

        }
        return engine;
    }

    public String executeJsFn(String s) {
        try {
            return (String) getEngine().eval(s);
        } catch (ScriptException e) {
            e.printStackTrace();
        }
        return null;
    }

}
