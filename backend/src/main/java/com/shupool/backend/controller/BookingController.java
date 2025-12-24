package com.shupool.backend.controller;

import com.shupool.backend.model.Booking;
import com.shupool.backend.model.Ride;
import com.shupool.backend.model.RideStatus;
import com.shupool.backend.model.User;
import com.shupool.backend.repository.BookingRepository;
import com.shupool.backend.repository.RideRepository;
import com.shupool.backend.repository.UserRepository;
import com.shupool.backend.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    @Autowired
    BookingRepository bookingRepository;
    
    @Autowired
    RideRepository rideRepository;
    
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    JwtUtils jwtUtils;
    
    @PostMapping("/book/{rideId}")
    public ResponseEntity<?> bookRide(@PathVariable String rideId, @RequestHeader("Authorization") String token, @RequestParam int seats) {
        String jwt = token.substring(7);
        String email = jwtUtils.getUserNameFromJwtToken(jwt);
        User passenger = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        
        if (ride.getStatus() != RideStatus.OPEN) {
            return ResponseEntity.badRequest().body("Ride is not open for booking");
        }
        
        if (ride.getSeatsAvailable() < seats) {
            return ResponseEntity.badRequest().body("Not enough seats available");
        }
        
        // Create Booking
        Booking booking = Booking.builder()
                .passenger(passenger)
                .ride(ride)
                .seatsBooked(seats)
                .bookingTime(LocalDateTime.now())
                .status("CONFIRMED")
                .build();
        
        bookingRepository.save(booking);
        
        // Update Ride seats
        ride.setSeatsAvailable(ride.getSeatsAvailable() - seats);
        if (ride.getSeatsAvailable() == 0) {
            ride.setStatus(RideStatus.FULL);
        }
        rideRepository.save(ride);
        
        return ResponseEntity.ok("Ride booked successfully");
    }
    
    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String email = jwtUtils.getUserNameFromJwtToken(jwt);
        User passenger = userRepository.findByEmail(email).orElseThrow();
        
        return bookingRepository.findByPassenger(passenger);
    }

    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingId, @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String email = jwtUtils.getUserNameFromJwtToken(jwt);
        User passenger = userRepository.findByEmail(email).orElseThrow();
        
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getPassenger().getId().equals(passenger.getId())) {
             return ResponseEntity.badRequest().body("Not authorized to cancel this booking");
        }
        
        if ("CANCELLED".equals(booking.getStatus())) {
             return ResponseEntity.badRequest().body("Booking already cancelled");
        }
        
        // Restore seats
        Ride ride = booking.getRide();
        ride.setSeatsAvailable(ride.getSeatsAvailable() + booking.getSeatsBooked());
        if (ride.getStatus() == RideStatus.FULL) {
            ride.setStatus(RideStatus.OPEN);
        }
        rideRepository.save(ride);
        
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
        
        return ResponseEntity.ok("Booking cancelled successfully");
    }

    @GetMapping("/ride/{rideId}")
    @PreAuthorize("hasAuthority('DRIVER') or hasAuthority('ADMIN')")
    public ResponseEntity<?> getBookingsForRide(@PathVariable String rideId, @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String email = jwtUtils.getUserNameFromJwtToken(jwt);
        User driver = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(driver.getId())) {
             return ResponseEntity.badRequest().body("Not authorized to view bookings for this ride");
        }

        List<Booking> bookings = bookingRepository.findByRide(ride);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/details/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getBookingById(@PathVariable String id, @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String email = jwtUtils.getUserNameFromJwtToken(jwt);
        User passenger = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));

        // Allow if user is the passenger OR the driver of the ride
        boolean isPassenger = booking.getPassenger().getId().equals(passenger.getId());
        boolean isDriver = booking.getRide().getDriver().getId().equals(passenger.getId());

        if (!isPassenger && !isDriver) {
             return ResponseEntity.badRequest().body("Not authorized to view this booking");
        }

        return ResponseEntity.ok(booking);
    }
}
