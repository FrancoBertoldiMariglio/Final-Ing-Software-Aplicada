package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Libro;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for the Libro entity.
 *
 * When extending this class, extend LibroRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface LibroRepository extends LibroRepositoryWithBagRelationships, JpaRepository<Libro, Long> {
    default Optional<Libro> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<Libro> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<Libro> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }

    Optional<Libro> findByIsbn(Integer isbn);

    /**
     * Finds all books associated with a specific user.
     *
     * @param userId the ID of the user
     * @return list of books belonging to the user
     */
    @Query("SELECT l FROM Libro l JOIN l.users u WHERE u.id = :userId")
    List<Libro> findByUserId(@Param("userId") Long userId);
}
