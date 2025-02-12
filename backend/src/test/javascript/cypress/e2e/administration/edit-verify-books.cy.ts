// @ts-ignore
import { Libro } from '../../support/models/libro.model';

describe('Libro edit and verify e2e test', () => {
  const uniqueISBN = Math.floor(Math.random() * 900000) + 100000;
  let createdLibroId: number | null = null;

  beforeEach(() => {
    cy.login('admin', 'admin');

    const initialLibro: Libro = {
      id: null,
      isbn: uniqueISBN,
      precio: 25.99,
      nombreAutor: 'Initial Author',
      users: []
    };

    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/libros',
      body: initialLibro
    }).then((response) => {
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

  it('should edit libro and verify by ISBN', () => {
    expect(createdLibroId).to.not.be.null;
    const updatedAutor = 'Updated Author Name';

    cy.authenticatedRequest({
      method: 'PUT',
      url: `/api/libros/${createdLibroId}`,
      body: {
        id: createdLibroId,
        isbn: uniqueISBN,
        precio: 25.99,
        nombreAutor: updatedAutor,
        users: []
      } as Libro
    }).then((updateResponse) => {
      expect(updateResponse.status).to.eq(200);
      cy.log('Updated libro:', updateResponse.body);

      // Verificar usando el endpoint getAllLibros
      cy.authenticatedRequest({
        method: 'GET',
        url: '/api/libros'
      }).then((response) => {
        expect(response.status).to.eq(200);
        const foundLibro = response.body.find((libro: Libro) => libro.isbn === uniqueISBN);
        expect(foundLibro).to.not.be.undefined;
        expect(foundLibro.isbn).to.eq(uniqueISBN);
        expect(foundLibro.nombreAutor).to.eq(updatedAutor);
      });
    });
  });
});
