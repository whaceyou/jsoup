package com.ace.config;

import com.ace.config.bean.Person;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * @author admin
 */
@Configuration
@ComponentScan(basePackages = {"com.ace"})
public class MainConfig {


    public Person person(){

        return new Person();
    }



}
