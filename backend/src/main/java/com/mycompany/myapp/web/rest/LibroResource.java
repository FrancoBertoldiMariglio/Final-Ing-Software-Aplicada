package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Libro;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.repository.LibroRepository;
import com.mycompany.myapp.repository.UserRepository;
import com.mycompany.myapp.repository.search.LibroSearchRepository;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import com.mycompany.myapp.web.rest.errors.ElasticsearchExceptionMapper;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.Libro}.
 */
@RestController
@RequestMapping("/api/libros")
@Transactional
public class LibroResource {

    private static final Logger LOG = LoggerFactory.getLogger(LibroResource.class);

    private static final String ENTITY_NAME = "libro";
    private final UserRepository userRepository;

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LibroRepository libroRepository;

    private final LibroSearchRepository libroSearchRepository;

    public LibroResource(
        LibroRepository libroRepository,
        LibroSearchRepository libroSearchRepository,
        UserRepository userRepository
    ) {
        this.libroRepository = libroRepository;
        this.libroSearchRepository = libroSearchRepository;
        this.userRepository = userRepository;
    }

    /**
     * {@code POST  /libros} : Create a new libro.
     *
     * @param libro the libro to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new libro, or with status {@code 400 (Bad Request)} if the libro has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Libro> createLibro(@RequestBody Libro libro) throws URISyntaxException {
        LOG.debug("REST request to save Libro : {}", libro);
        if (libro.getId() != null) {
            throw new BadRequestAlertException("A new libro cannot already have an ID", ENTITY_NAME, "idexists");
        }
        if (libroRepository.findByIsbn(libro.getIsbn()).isPresent()) {
            throw new BadRequestAlertException("A libro with this ISBN already exists", ENTITY_NAME, "isbnexists");
        }
        libro = libroRepository.save(libro);
        return ResponseEntity.created(new URI("/api/libros/" + libro.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, libro.getId().toString()))
            .body(libro);
    }

    /**
     * {@code PUT  /libros/:id} : Updates an existing libro.
     *
     * @param id the id of the libro to save.
     * @param libro the libro to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated libro,
     * or with status {@code 400 (Bad Request)} if the libro is not valid,
     * or with status {@code 500 (Internal Server Error)} if the libro couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Libro> updateLibro(@PathVariable(value = "id", required = false) final Long id, @RequestBody Libro libro)
        throws URISyntaxException {
        LOG.debug("REST request to update Libro : {}, {}", id, libro);
        if (libro.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, libro.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!libroRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        libro = libroRepository.save(libro);
        libroSearchRepository.index(libro);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, libro.getId().toString()))
            .body(libro);
    }

    /**
     * {@code PATCH  /libros/:id} : Partial updates given fields of an existing libro, field will ignore if it is null
     *
     * @param id the id of the libro to save.
     * @param libro the libro to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated libro,
     * or with status {@code 400 (Bad Request)} if the libro is not valid,
     * or with status {@code 404 (Not Found)} if the libro is not found,
     * or with status {@code 500 (Internal Server Error)} if the libro couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Libro> partialUpdateLibro(@PathVariable(value = "id", required = false) final Long id, @RequestBody Libro libro)
        throws URISyntaxException {
        LOG.debug("REST request to partial update Libro partially : {}, {}", id, libro);
        if (libro.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, libro.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!libroRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Libro> result = libroRepository
            .findById(libro.getId())
            .map(existingLibro -> {
                if (libro.getIsbn() != null) {
                    existingLibro.setIsbn(libro.getIsbn());
                }
                if (libro.getPrecio() != null) {
                    existingLibro.setPrecio(libro.getPrecio());
                }
                if (libro.getNombreAutor() != null) {
                    existingLibro.setNombreAutor(libro.getNombreAutor());
                }

                return existingLibro;
            })
            .map(libroRepository::save)
            .map(savedLibro -> {
                libroSearchRepository.index(savedLibro);
                return savedLibro;
            });

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, libro.getId().toString())
        );
    }

    /**
     * {@code GET  /libros} : get all the libros.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of libros in body.
     */
    @GetMapping("")
    public List<Libro> getAllLibros(@RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload) {
        LOG.debug("REST request to get all Libros");
        if (eagerload) {
            return libroRepository.findAllWithEagerRelationships();
        } else {
            return libroRepository.findAll();
        }
    }

    /**
     * {@code GET  /libros/:id} : get the "id" libro.
     *
     * @param id the id of the libro to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the libro, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Libro> getLibro(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Libro : {}", id);
        Optional<Libro> libro = libroRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(libro);
    }

    /**
     * {@code DELETE  /libros/:id} : delete the "id" libro.
     *
     * @param id the id of the libro to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLibro(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Libro : {}", id);
        libroRepository.deleteById(id);
        libroSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /libros/_search?query=:query} : search for the libro corresponding
     * to the query.
     *
     * @param query the query of the libro search.
     * @return the result of the search.
     */
    @GetMapping("/search")
    public List<Libro> searchLibros(@RequestParam("query") String query) {
        LOG.debug("REST request to search Libros for query {}", query);
        try {
            return StreamSupport.stream(libroSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }

    @PostMapping("/isbn/{isbn}")
    public ResponseEntity<Libro> asociarLibroAUsuario(
        @PathVariable Integer isbn,
        @RequestParam Long userId
    ) {
        LOG.debug("REST request to associate Libro with ISBN: {} to User: {}", isbn, userId);

        Optional<Libro> libroOpt = libroRepository.findByIsbn(isbn);
        Optional<User> userOpt = userRepository.findById(userId);

        if (libroOpt.isPresent() && userOpt.isPresent()) {
            Libro libro = libroOpt.get();
            User user = userOpt.get();
            libro.addUsers(user);
            libroRepository.save(libro);
            return ResponseEntity.ok().body(libro);
        }

        return ResponseEntity.notFound().build();
    }
    /**
     * {@code GET  /libros/usuario/:userId} : get all libros for a specific user.
     *
     * @param userId the id of the user to get books for
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of libros in body.
     */
    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<Libro>> getLibrosByUsuario(@PathVariable Long userId) {
        LOG.debug("REST request to get Libros for User : {}", userId);
        List<Libro> libros = libroRepository.findByUserId(userId);
        return ResponseEntity.ok().body(libros);
    }
}
