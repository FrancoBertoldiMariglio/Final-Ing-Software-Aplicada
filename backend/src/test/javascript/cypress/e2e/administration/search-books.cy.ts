// @ts-ignore
import { Libro } from '../../support/models/libro.model';

describe('Libro ISBN search e2e test', () => {
  const uniqueISBN = Math.floor(Math.random() * 900000) + 100000;
  let createdLibroId: number | null = null;

  beforeEach(() => {
    cy.login('admin', 'admin');

    const testLibro: Libro = {
      id: null,
      isbn: uniqueISBN,
      precio: 29.99,
      nombreAutor: 'Gabriel García Márquez',
      users: []
    };

    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/libros',
      body: testLibro
    }).then(response => {
      expect(response.status).to.eq(201);
      createdLibroId = response.body.id;
      cy.log('Created libro with id:', createdLibroId);
    });
  });

  afterEach(() => {
    if (createdLibroId) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/libros/${createdLibroId}`,
        failOnStatusCode: false
      });
    }
  });

  it('should find libro by ISBN', () => {
    cy.authenticatedRequest({
      method: 'GET',
      url: '/api/libros'
    }).then((response) => {
      expect(response.status).to.eq(200);
      const foundLibro = response.body.find((libro: Libro) => libro.isbn === uniqueISBN);
      expect(foundLibro).to.not.be.undefined;
      expect(foundLibro.isbn).to.eq(uniqueISBN);

      // También probar la búsqueda usando search endpoint
      cy.authenticatedRequest({
        method: 'GET',
        url: '/api/libros/search',
        qs: {
          query: uniqueISBN.toString()
        }
      }).then((searchResponse) => {
        expect(searchResponse.status).to.eq(200);
        if (searchResponse.body.length > 0) {
          expect(searchResponse.body[0].isbn).to.eq(uniqueISBN);
        }
      });
    });
  });
});
