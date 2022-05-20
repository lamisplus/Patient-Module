package org.lamisplus.modules.patient.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.patient.controller.exception.NoRecordFoundException;
import org.lamisplus.modules.patient.domain.dto.VisitDto;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VisitService {
    private final PersonRepository personRepository;
    private final VisitRepository visitRepository;


    public VisitDto createVisit(VisitDto visitDto) {
        personRepository.findById (visitDto.getPersonId ()).orElseThrow (() -> new NoRecordFoundException ("No person found with id " + visitDto.getPersonId ()));
        Visit visit = convertDtoToEntity (visitDto);
        visit.setUuid (UUID.randomUUID ().toString ());
        visit.setArchived (0);
        return convertEntityToDto (visitRepository.save (visit));
    }

    public VisitDto updateVisit(Long id, VisitDto visitDto) {
        Visit existVisit = getExistVisit (id);
        Visit visit = convertDtoToEntity (visitDto);
        visit.setId (existVisit.getId ());
        visit.setArchived (0);
        return convertEntityToDto (visitRepository.save (visit));

    }

    public VisitDto getVisitById(Long id) {
        return convertEntityToDto (getExistVisit (id));
    }

    public List<VisitDto> getAllVisit() {
        return visitRepository
                .findAllByArchived (0)
                .stream ()
                .map (this::convertEntityToDto)
                .collect (Collectors.toList ());
    }

    public void archivedVisit(Long id) {
        Visit existVisit = getExistVisit (id);
        existVisit.setArchived (1);
        visitRepository.save (existVisit);
    }

    private Visit getExistVisit(Long id) {
        return visitRepository.findById (id).orElseThrow (() -> new NoRecordFoundException ("No visit was found with given Id " + id));
    }


    private Visit convertDtoToEntity(VisitDto visitDto) {
        Visit visit = new Visit ();
        BeanUtils.copyProperties (visitDto, visit);
        return visit;
    }

    private VisitDto convertEntityToDto(Visit visit) {
        VisitDto visitDto = new VisitDto ();
        BeanUtils.copyProperties (visit, visitDto);
        return visitDto;
    }
}