package com.mycompany.myapp.web.rest;

import static com.mycompany.myapp.domain.LibroAsserts.*;
import static com.mycompany.myapp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Libro;
import com.mycompany.myapp.repository.LibroRepository;
import com.mycompany.myapp.repository.UserRepository;
import com.mycompany.myapp.repository.search.LibroSearchRepository;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import org.assertj.core.util.IterableUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Streamable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link LibroResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class LibroResourceIT {

    private static final Integer DEFAULT_ISBN = 1;
    private static final Integer UPDATED_ISBN = 2;

    private static final Float DEFAULT_PRECIO = 1F;
    private static final Float UPDATED_PRECIO = 2F;

    private static final String DEFAULT_NOMBRE_AUTOR = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE_AUTOR = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/libros";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/libros/_search";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private LibroRepository libroRepositoryMock;

    @Autowired
    private LibroSearchRepository libroSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restLibroMockMvc;

    private Libro libro;

    private Libro insertedLibro;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Libro createEntity() {
        return new Libro().isbn(DEFAULT_ISBN).precio(DEFAULT_PRECIO).nombreAutor(DEFAULT_NOMBRE_AUTOR);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Libro createUpdatedEntity() {
        return new Libro().isbn(UPDATED_ISBN).precio(UPDATED_PRECIO).nombreAutor(UPDATED_NOMBRE_AUTOR);
    }

    @BeforeEach
    public void initTest() {
        libro = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedLibro != null) {
            libroRepository.delete(insertedLibro);
            libroSearchRepository.delete(insertedLibro);
            insertedLibro = null;
        }
    }

    @Test
    @Transactional
    void createLibro() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());
        // Create the Libro
        var returnedLibro = om.readValue(
            restLibroMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(libro)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Libro.class
        );

        // Validate the Libro in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertLibroUpdatableFieldsEquals(returnedLibro, getPersistedLibro(returnedLibro));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedLibro = returnedLibro;
    }

    @Test
    @Transactional
    void createLibroWithExistingId() throws Exception {
        // Create the Libro with an existing ID
        libro.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restLibroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(libro)))
            .andExpect(status().isBadRequest());

        // Validate the Libro in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void getAllLibros() throws Exception {
        // Initialize the database
        insertedLibro = libroRepository.saveAndFlush(libro);

        // Get all the libroList
        restLibroMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(libro.getId().intValue())))
            .andExpect(jsonPath("$.[*].isbn").value(hasItem(DEFAULT_ISBN)))
            .andExpect(jsonPath("$.[*].precio").value(hasItem(DEFAULT_PRECIO.doubleValue())))
            .andExpect(jsonPath("$.[*].nombreAutor").value(hasItem(DEFAULT_NOMBRE_AUTOR)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllLibrosWithEagerRelationshipsIsEnabled() throws Exception {
        when(libroRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restLibroMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(libroRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllLibrosWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(libroRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restLibroMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(libroRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getLibro() throws Exception {
        // Initialize the database
        insertedLibro = libroRepository.saveAndFlush(libro);

        // Get the libro
        restLibroMockMvc
            .perform(get(ENTITY_API_URL_ID, libro.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(libro.getId().intValue()))
            .andExpect(jsonPath("$.isbn").value(DEFAULT_ISBN))
            .andExpect(jsonPath("$.precio").value(DEFAULT_PRECIO.doubleValue()))
            .andExpect(jsonPath("$.nombreAutor").value(DEFAULT_NOMBRE_AUTOR));
    }

    @Test
    @Transactional
    void getNonExistingLibro() throws Exception {
        // Get the libro
        restLibroMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingLibro() throws Exception {
        // Initialize the database
        insertedLibro = libroRepository.saveAndFlush(libro);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        libroSearchRepository.save(libro);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());

        // Update the libro
        Libro updatedLibro = libroRepository.findById(libro.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedLibro are not directly saved in db
        em.detach(updatedLibro);
        updatedLibro.isbn(UPDATED_ISBN).precio(UPDATED_PRECIO).nombreAutor(UPDATED_NOMBRE_AUTOR);

        restLibroMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedLibro.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedLibro))
            )
            .andExpect(status().isOk());

        // Validate the Libro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedLibroToMatchAllProperties(updatedLibro);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<Libro> libroSearchList = Streamable.of(libroSearchRepository.findAll()).toList();
                Libro testLibroSearch = libroSearchList.get(searchDatabaseSizeAfter - 1);

                assertLibroAllPropertiesEquals(testLibroSearch, updatedLibro);
            });
    }

    @Test
    @Transactional
    void putNonExistingLibro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());
        libro.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLibroMockMvc
            .perform(put(ENTITY_API_URL_ID, libro.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(libro)))
            .andExpect(status().isBadRequest());

        // Validate the Libro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithIdMismatchLibro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());
        libro.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLibroMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(libro))
            )
            .andExpect(status().isBadRequest());

        // Validate the Libro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamLibro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());
        libro.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLibroMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(libro)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Libro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void partialUpdateLibroWithPatch() throws Exception {
        // Initialize the database
        insertedLibro = libroRepository.saveAndFlush(libro);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the libro using partial update
        Libro partialUpdatedLibro = new Libro();
        partialUpdatedLibro.setId(libro.getId());

        restLibroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLibro.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLibro))
            )
            .andExpect(status().isOk());

        // Validate the Libro in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLibroUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedLibro, libro), getPersistedLibro(libro));
    }

    @Test
    @Transactional
    void fullUpdateLibroWithPatch() throws Exception {
        // Initialize the database
        insertedLibro = libroRepository.saveAndFlush(libro);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the libro using partial update
        Libro partialUpdatedLibro = new Libro();
        partialUpdatedLibro.setId(libro.getId());

        partialUpdatedLibro.isbn(UPDATED_ISBN).precio(UPDATED_PRECIO).nombreAutor(UPDATED_NOMBRE_AUTOR);

        restLibroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLibro.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLibro))
            )
            .andExpect(status().isOk());

        // Validate the Libro in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLibroUpdatableFieldsEquals(partialUpdatedLibro, getPersistedLibro(partialUpdatedLibro));
    }

    @Test
    @Transactional
    void patchNonExistingLibro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());
        libro.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLibroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, libro.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(libro))
            )
            .andExpect(status().isBadRequest());

        // Validate the Libro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithIdMismatchLibro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());
        libro.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLibroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(libro))
            )
            .andExpect(status().isBadRequest());

        // Validate the Libro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamLibro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());
        libro.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLibroMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(libro)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Libro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void deleteLibro() throws Exception {
        // Initialize the database
        insertedLibro = libroRepository.saveAndFlush(libro);
        libroRepository.save(libro);
        libroSearchRepository.save(libro);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(libroSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the libro
        restLibroMockMvc
            .perform(delete(ENTITY_API_URL_ID, libro.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(libroSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    @Transactional
    void searchLibro() throws Exception {
        // Initialize the database
        insertedLibro = libroRepository.saveAndFlush(libro);
        libroSearchRepository.save(libro);

        // Search the libro
        restLibroMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + libro.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(libro.getId().intValue())))
            .andExpect(jsonPath("$.[*].isbn").value(hasItem(DEFAULT_ISBN)))
            .andExpect(jsonPath("$.[*].precio").value(hasItem(DEFAULT_PRECIO.doubleValue())))
            .andExpect(jsonPath("$.[*].nombreAutor").value(hasItem(DEFAULT_NOMBRE_AUTOR)));
    }

    @Test
    @Transactional
    void createLibroWithDuplicateISBN() throws Exception {
        // Initialize the database with a libro
        insertedLibro = libroRepository.saveAndFlush(libro);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // Create another libro with the same ISBN
        Libro duplicateLibro = new Libro()
            .isbn(DEFAULT_ISBN)
            .precio(50.0F)
            .nombreAutor("Otro Autor");

        // Attempt to create the duplicate libro, should fail
        restLibroMockMvc
            .perform(post(ENTITY_API_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsBytes(duplicateLibro)))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.message").value("error.isbnexists"))
            .andExpect(jsonPath("$.title").value("Bad Request"));

        // Validate the database still contains just one libro
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void findLibroByISBN() throws Exception {
        // Initialize the database
        insertedLibro = libroRepository.saveAndFlush(libro);

        // Get the libro by ISBN
        restLibroMockMvc.perform(get(ENTITY_API_URL + "/isbn/{isbn}", DEFAULT_ISBN))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.isbn").value(DEFAULT_ISBN))
            .andExpect(jsonPath("$.precio").value(DEFAULT_PRECIO.doubleValue()))
            .andExpect(jsonPath("$.nombreAutor").value(DEFAULT_NOMBRE_AUTOR));
    }

    protected long getRepositoryCount() {
        return libroRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Libro getPersistedLibro(Libro libro) {
        return libroRepository.findById(libro.getId()).orElseThrow();
    }

    protected void assertPersistedLibroToMatchAllProperties(Libro expectedLibro) {
        assertLibroAllPropertiesEquals(expectedLibro, getPersistedLibro(expectedLibro));
    }

    protected void assertPersistedLibroToMatchUpdatableProperties(Libro expectedLibro) {
        assertLibroAllUpdatablePropertiesEquals(expectedLibro, getPersistedLibro(expectedLibro));
    }
}
