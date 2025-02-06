describe('Libro edit and verify e2e test', () => {
  const initialLibro = {
    id: null,
    isbn: 11111,
    precio: 25.99,
    nombreAutor: 'Initial Author',
    users: []
  };

  beforeEach(() => {
    cy.login('admin', 'admin');

    // Crear libro inicial
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/libros',
      body: initialLibro
    });
  });

  it('should edit libro and verify by ISBN', () => {
    cy.visit('/libro');

    // Buscar y editar
    cy.get(`[data-cy="edit-${initialLibro.isbn}"]`).click();

    const updatedAutor = 'Updated Author Name';
    cy.get('[data-cy="nombreAutor"]').clear().type(updatedAutor);
    cy.get('[data-cy="entityCreateSaveButton"]').click();

    // Verificar cambios usando el endpoint de ISBN
    cy.authenticatedRequest({
      method: 'GET',
      url: `/api/libros/isbn/${initialLibro.isbn}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.isbn).to.eq(initialLibro.isbn);
      expect(response.body.nombreAutor).to.eq(updatedAutor);
    });
  });
});
