package org.algoritmed.algoritmedtelegram01;

import java.sql.SQLException;

import org.h2.tools.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AlgoritmedTelegram01Application {

	public static void main(String[] args) {
		SpringApplication.run(AlgoritmedTelegram01Application.class, args);
	}

	@Bean
	public void startTCPServer() {
		System.out.println("\n --16-- : startTCPServer");
		try {
			Server h2Server = Server.createTcpServer().start();
			if (h2Server.isRunning(true)) {
				System.out.println(h2Server.getStatus());
			} else {
				throw new RuntimeException("Could not start H2 server.");
			}
		} catch (SQLException e) {
			// e.printStackTrace();
			throw new RuntimeException("Failed to start H2 server: ", e);
		}
	}
}
