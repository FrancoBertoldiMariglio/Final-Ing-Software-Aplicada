package com.mycompany.myapp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class LibroTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Libro getLibroSample1() {
        return new Libro().id(1L).isbn(1).nombreAutor("nombreAutor1");
    }

    public static Libro getLibroSample2() {
        return new Libro().id(2L).isbn(2).nombreAutor("nombreAutor2");
    }

    public static Libro getLibroRandomSampleGenerator() {
        return new Libro().id(longCount.incrementAndGet()).isbn(intCount.incrementAndGet()).nombreAutor(UUID.randomUUID().toString());
    }
}
