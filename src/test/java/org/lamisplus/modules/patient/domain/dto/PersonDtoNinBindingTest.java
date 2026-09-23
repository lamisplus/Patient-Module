package org.lamisplus.modules.patient.domain.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.module.paramnames.ParameterNamesModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class PersonDtoNinBindingTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new ParameterNamesModule());
        objectMapper.registerModule(new JavaTimeModule());
    }

    private String registrationPayload(String ninNumberJsonEntry) {
        return "{"
                + "\"active\":true,"
                + "\"firstName\":\"Ada\","
                + "\"surname\":\"Okoro\","
                + "\"dateOfBirth\":\"1990-04-12\","
                + "\"dateOfRegistration\":\"2026-09-23\","
                + "\"deceased\":false,"
                + "\"sexId\":1,"
                + ninNumberJsonEntry
                + "\"identifier\":[{\"assignerId\":1,\"type\":\"HospitalNumber\",\"value\":\"H/0001\"}],"
                + "\"contactPoint\":[],\"address\":[],\"contact\":[]"
                + "}";
    }

    @Test
    void bindsNinNumberFromRegistrationPayload() throws Exception {
        PersonDto dto = objectMapper.readValue(
                registrationPayload("\"ninNumber\":\"12345678901\","), PersonDto.class);

        assertEquals("12345678901", dto.getNinNumber());
        assertEquals("Ada", dto.getFirstName());
    }

    @Test
    void bindsEditedNinNumber() throws Exception {
        PersonDto dto = objectMapper.readValue(
                registrationPayload("\"ninNumber\":\"98765432109\","), PersonDto.class);

        assertEquals("98765432109", dto.getNinNumber());
    }

    @Test
    void bindsBlankNinNumberAsEmptyString() throws Exception {
        PersonDto dto = objectMapper.readValue(
                registrationPayload("\"ninNumber\":\"\","), PersonDto.class);

        assertEquals("", dto.getNinNumber());
    }

    @Test
    void bindsOmittedNinNumberAsNull() throws Exception {
        PersonDto dto = objectMapper.readValue(registrationPayload(""), PersonDto.class);

        assertNull(dto.getNinNumber());
    }
}
