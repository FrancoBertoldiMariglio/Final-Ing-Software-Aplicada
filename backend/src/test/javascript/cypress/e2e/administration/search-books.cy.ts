describe('Libro ISBN search e2e test', () => {
  const testLibro = {
    id: null,
    isbn: 12345,
    precio: 29.99,
    nombreAutor: 'Gabriel García Márquez',
    users: []
  };

  beforeEach(() => {
    cy.login('admin', 'admin');

    // Limpiar libros existentes con el mismo ISBN
    cy.authenticatedRequest({
      method: 'GET',
      url: `/api/libros/isbn/${testLibro.isbn}`,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        // Si existe el libro, lo eliminamos
        cy.authenticatedRequest({
          method: 'DELETE',
          url: `/api/libros/${response.body.id}`
        });
      }

      // Crear un nuevo libro para pruebas
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/libros',
        body: testLibro
      });
    });
  });

  it('should find libro by ISBN', () => {
    // Buscar por ISBN usando la API
    cy.authenticatedRequest({
      method: 'GET',
      url: `/api/libros/isbn/${testLibro.isbn}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.isbn).to.eq(testLibro.isbn);
      expect(response.body.nombreAutor).to.eq(testLibro.nombreAutor);
    });

    // Verificar en la interfaz de usuario
    cy.visit('/libro');

    // Asumiendo que tienes un campo de búsqueda y un botón
    cy.get('[data-cy="entityTable"]').should('exist');
    cy.get('[data-cy="entityTable"]').should('contain', testLibro.isbn);
    cy.get('[data-cy="entityTable"]').should('contain', testLibro.nombreAutor);
  });

  it('should return 404 for non-existent ISBN', () => {
    const nonExistentIsbn = 99999;

    // Asegurarse de que el ISBN no existe
    cy.authenticatedRequest({
      method: 'GET',
      url: `/api/libros/isbn/${nonExistentIsbn}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  // Test adicional para validar la creación con ISBN duplicado
  it('should not allow duplicate ISBN', () => {
    const duplicateLibro = {
      ...testLibro,
      nombreAutor: 'Otro Autor'
    };

    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/libros',
      body: duplicateLibro,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.eq('error.isbnexists');
    });
  });
});
