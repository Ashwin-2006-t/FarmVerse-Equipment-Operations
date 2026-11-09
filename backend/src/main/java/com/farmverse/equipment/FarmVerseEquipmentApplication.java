package com.farmverse.equipment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FarmVerseEquipmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmVerseEquipmentApplication.class, args);
    }
}

