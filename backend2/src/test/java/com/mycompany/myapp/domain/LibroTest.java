package com.mycompany.myapp.domain;

import static com.mycompany.myapp.domain.LibroTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class LibroTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Libro.class);
        Libro libro1 = getLibroSample1();
        Libro libro2 = new Libro();
        assertThat(libro1).isNotEqualTo(libro2);

        libro2.setId(libro1.getId());
        assertThat(libro1).isEqualTo(libro2);

        libro2 = getLibroSample2();
        assertThat(libro1).isNotEqualTo(libro2);
    }
}
