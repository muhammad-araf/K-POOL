package com.shupool.backend.repository;

import com.shupool.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByPassenger(com.shupool.backend.model.User passenger);
    List<Booking> findByRide(com.shupool.backend.model.Ride ride);
}
