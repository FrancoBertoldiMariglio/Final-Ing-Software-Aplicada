describe('Libro create and search e2e test', () => {
  beforeEach(() => {
    cy.login('admin', 'admin');
  });

  it('should create and then find libro by ISBN', () => {
    const newLibro = {
      id: null,
      isbn: 54321,
      precio: 39.99,
      nombreAutor: 'Jorge Luis Borges',
      users: []
    };

    // Crear libro
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/libros',
      body: newLibro
    }).then((response) => {
      expect(response.status).to.eq(201);

      // Buscar el libro creado por ISBN
      cy.authenticatedRequest({
        method: 'GET',
        url: `/api/libros/isbn/${newLibro.isbn}`
      }).then((searchResponse) => {
        expect(searchResponse.status).to.eq(200);
        expect(searchResponse.body.isbn).to.eq(newLibro.isbn);
        expect(searchResponse.body.nombreAutor).to.eq(newLibro.nombreAutor);
      });
    });
  });
});
