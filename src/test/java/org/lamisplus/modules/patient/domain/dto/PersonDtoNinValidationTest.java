package org.lamisplus.modules.patient.domain.dto;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PersonDtoNinValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private Set<ConstraintViolation<PersonDto>> validateNin(String ninNumber) {
        PersonDto dto = PersonDto.builder()
                .firstName("Ada")
                .surname("Okoro")
                .ninNumber(ninNumber)
                .build();
        return validator.validate(dto);
    }

    @Test
    void acceptsNullNinNumber() {
        assertTrue(validateNin(null).isEmpty());
    }

    @Test
    void acceptsEmptyNinNumber() {
        assertTrue(validateNin("").isEmpty());
    }

    @Test
    void acceptsElevenDigitNinNumber() {
        assertTrue(validateNin("12345678901").isEmpty());
    }

    @Test
    void rejectsShortNinNumber() {
        Set<ConstraintViolation<PersonDto>> violations = validateNin("12345");

        assertEquals(1, violations.size());
        assertEquals("NIN must be 11 digits", violations.iterator().next().getMessage());
        assertEquals("ninNumber", violations.iterator().next().getPropertyPath().toString());
    }

    @Test
    void rejectsLongNinNumber() {
        assertEquals(1, validateNin("123456789012").size());
    }

    @Test
    void rejectsNonNumericNinNumber() {
        assertEquals(1, validateNin("1234567890a").size());
    }
}
