
// @ts-ignore
import { Libro } from '../../support/models/libro.model';

describe('Libro create and search e2e test', () => {
  const uniqueISBN = Math.floor(Math.random() * 900000) + 100000;

  beforeEach(() => {
    cy.login('admin', 'admin');
  });

  it('should create and then find libro by ISBN', () => {
    const newLibro: Libro = {
      id: null,
      isbn: uniqueISBN,
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
      const createdLibro = response.body;
      cy.log('Libro created:', createdLibro);

      // Buscar el libro usando el endpoint de getAllLibros
      cy.authenticatedRequest({
        method: 'GET',
        url: '/api/libros'
      }).then((searchResponse) => {
        expect(searchResponse.status).to.eq(200);
        const foundLibro = searchResponse.body.find((libro: Libro) => libro.isbn === uniqueISBN);
        expect(foundLibro).to.not.be.undefined;
        expect(foundLibro.isbn).to.eq(uniqueISBN);
        expect(foundLibro.nombreAutor).to.eq(newLibro.nombreAutor);
      });
    });
  });
});
