package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.BookingCreateRequest;
import com.farmverse.equipment.dto.request.BookingDecisionRequest;
import com.farmverse.equipment.dto.response.BookingResponse;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.enums.BookingStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingCreateRequest request);

    BookingResponse getBookingById(Long id);

    PagedResponse<BookingResponse> getAllBookings(Long equipmentId,
                                                   BookingStatus status,
                                                   String userId,
                                                   String farmId,
                                                   Pageable pageable);

    List<BookingResponse> getBookingsForCalendar(LocalDateTime start, LocalDateTime end);

    BookingResponse approveBooking(Long id, BookingDecisionRequest request);

    BookingResponse rejectBooking(Long id, BookingDecisionRequest request);

    BookingResponse cancelBooking(Long id, BookingDecisionRequest request);

    List<BookingResponse> getBookingsByEquipment(Long equipmentId);
}

