package org.algoritmed.algoritmedtelegram01;

import java.util.HashMap;
import java.util.Map;

import org.algoritmed.algoritmedtelegram01.service.BotDb01;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

@Component
public class Bot01 extends TelegramLongPollingBot {
    protected static final Logger logger = LoggerFactory.getLogger(Bot01.class);

    protected @Autowired BotDb01 botDb01;

    // https://www.youtube.com/channel/UC8erhqSQsRQE4pWBt6OJrSA
    @Override
    public void onUpdateReceived(Update update) {
        // try {
        // logger.info("--26--"
        // + "\n BaseUrl: " + getBaseUrl()
        // + "\n BotUsername: " + getBotUsername()
        // + "\n Me (User): " + getMe()
        // + "\n WebhookInfo: " + getWebhookInfo()
        // + "\n hashCode: " + hashCode());
        // } catch (TelegramApiException e1) {
        // e1.printStackTrace();
        // }

        if (update.hasMessage()) {
            Message message = update.getMessage();
            // logger.info("--28--"
            // + "\n UpdateId: " + update.getUpdateId()
            // + "\n InlineQuery: " + update.getInlineQuery()
            // + "\n MyChatMember: " + update.getMyChatMember()
            // + "\n ChatMember: " + update.getChatMember());

            if (message.hasText()) {
                String text = message.getText();
                // logger.info("--33--" + text
                // + "\n MessageId - " + message.getMessageId()
                // + "\n Caption - " + message.getCaption()
                // + "\n ChatId - " + message.getChatId()
                // + "\n From - " + message.getFrom());
                Map messageData = new HashMap<>();
                Map<String, Object> fromUserMap = botDb01.patient01(message, messageData);
                SendMessage sm = null;
                if (0 == text.indexOf("/")) {
                    logger.info("" + text.indexOf("/"));
                    sm = botDb01.command01(message);
                }
                if (null == sm) {
                    sm = new SendMessage();
                    sm.setText("Отримав текст: " + text
                            + "\n"
                            + "Лінки наступних дій: /вперед , /run:Біжи, /go:Їди .");
                }
                sm.setChatId(message.getChatId().toString());
                try {
                    execute(sm);
                } catch (TelegramApiException e) {
                    e.printStackTrace();
                }

                try {
                    Thread.sleep(5000);
                    System.out.println("Hello World! after 5 sec");
                    SendMessage sm2 = new SendMessage();
                    sm2.setText("Додаткові дій другої хвилі: /other:Інші дії .");
                    sm2.setChatId(message.getChatId().toString());
                    execute(sm2);
                } catch (TelegramApiException e) {
                    e.printStackTrace();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    e.printStackTrace();
                }

            }
        }
    }

    private @Value("${telegram.bot01.username}") String username;
    private @Value("${telegram.bot01.token}") String token;

    @Override
    public String getBotUsername() {
        return username;
    }

    @Override
    public String getBotToken() {
        return token;
    }

}
