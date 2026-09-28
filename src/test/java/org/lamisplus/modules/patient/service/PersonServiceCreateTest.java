package org.lamisplus.modules.patient.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.lamisplus.modules.base.domain.repositories.ApplicationCodesetRepository;
import org.lamisplus.modules.base.domain.repositories.OrganisationUnitRepository;
import org.lamisplus.modules.base.service.MenuService;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.IdentifierDto;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.EncounterRepository;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PersonServiceCreateTest {

    private PersonRepository personRepository;
    private UserService userService;
    private MenuService menuService;
    private PersonService personService;

    @BeforeEach
    void setUp() {
        personRepository = mock(PersonRepository.class);
        userService = mock(UserService.class);
        menuService = mock(MenuService.class);

        personService = new PersonService(
                personRepository,
                mock(ApplicationCodesetRepository.class),
                mock(OrganisationUnitRepository.class),
                mock(VisitRepository.class),
                mock(VisitService.class),
                mock(EncounterRepository.class),
                userService,
                menuService);

        when(userService.getUserWithRoles()).thenReturn(Optional.empty());
        when(menuService.exist("BiometricModule")).thenReturn(false);
    }

    private PersonDto.PersonDtoBuilder basePersonDto() {
        return PersonDto.builder()
                .active(true)
                .firstName("Ada")
                .surname("Okoro")
                .dateOfBirth(LocalDate.of(1990, 4, 12))
                .dateOfRegistration(LocalDate.of(2026, 9, 28))
                .identifier(Collections.singletonList(
                        new IdentifierDto("HospitalNumber", "H/0001", 1L)));
    }

    private void respondWithPersistedPerson(Long assignedId) {
        when(personRepository.saveAndFlush(any(Person.class))).thenAnswer(invocation -> {
            Person submitted = invocation.getArgument(0);
            submitted.setId(assignedId);
            return submitted;
        });
    }

    @Test
    void persistsPatientAndReturnsGeneratedIdentity() {
        respondWithPersistedPerson(42L);

        PersonResponseDto response = personService.createPerson(basePersonDto().build());

        assertEquals(42L, response.getId());
        assertNotNull(response.getUuid());
        verify(personRepository).saveAndFlush(any(Person.class));
    }

    @Test
    void failsLoudlyWhenNoIdentityIsAssigned() {
        when(personRepository.saveAndFlush(any(Person.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        IllegalStateException thrown = assertThrows(IllegalStateException.class,
                () -> personService.createPerson(basePersonDto().build()));

        org.junit.jupiter.api.Assertions.assertTrue(
                thrown.getMessage().contains("was not persisted"), thrown.getMessage());
    }

    @Test
    void failsLoudlyWhenRepositoryReturnsNull() {
        when(personRepository.saveAndFlush(any(Person.class))).thenReturn(null);

        assertThrows(IllegalStateException.class,
                () -> personService.createPerson(basePersonDto().build()));
    }

    @Test
    void usesFlushingSaveSoFailuresSurfaceImmediately() {
        respondWithPersistedPerson(7L);

        personService.createPerson(basePersonDto().build());

        verify(personRepository).saveAndFlush(any(Person.class));
        verify(personRepository, never()).save(any(Person.class));
    }

    @Test
    void defaultsSourceToWebWhenAbsent() {
        respondWithPersistedPerson(1L);

        personService.createPerson(basePersonDto().build());

        verify(personRepository).saveAndFlush(org.mockito.ArgumentMatchers.argThat(
                person -> "Web".equals(person.getSource())));
    }

    @Test
    void retainsProvidedSource() {
        respondWithPersistedPerson(1L);

        personService.createPerson(basePersonDto().source("Mobile").build());

        verify(personRepository).saveAndFlush(org.mockito.ArgumentMatchers.argThat(
                person -> "Mobile".equals(person.getSource())));
    }

    @Test
    void carriesCoreBusinessFieldsOntoTheEntity() {
        respondWithPersistedPerson(1L);

        personService.createPerson(basePersonDto().build());

        verify(personRepository).saveAndFlush(org.mockito.ArgumentMatchers.argThat(person ->
                "H/0001".equals(person.getHospitalNumber())
                        && "AdaOkoro".equals(person.getFullName())
                        && person.getUuid() != null
                        && Integer.valueOf(0).equals(person.getArchived())));
    }

    @Test
    void toleratesMissingIdentifierList() {
        respondWithPersistedPerson(1L);

        PersonResponseDto response = personService.createPerson(
                basePersonDto().identifier(null).build());

        assertEquals(1L, response.getId());
    }
}
