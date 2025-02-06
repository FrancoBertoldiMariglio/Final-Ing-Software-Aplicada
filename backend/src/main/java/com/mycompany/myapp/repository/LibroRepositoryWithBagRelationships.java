package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Libro;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface LibroRepositoryWithBagRelationships {
    Optional<Libro> fetchBagRelationships(Optional<Libro> libro);

    List<Libro> fetchBagRelationships(List<Libro> libros);

    Page<Libro> fetchBagRelationships(Page<Libro> libros);
}
