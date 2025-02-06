import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('Libro e2e test', () => {
  const libroPageUrl = '/libro';
  const libroPageUrlPattern = new RegExp('/libro(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const libroSample = {};

  let libro;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/libros+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/libros').as('postEntityRequest');
    cy.intercept('DELETE', '/api/libros/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (libro) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/libros/${libro.id}`,
      }).then(() => {
        libro = undefined;
      });
    }
  });

  it('Libros menu should load Libros page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('libro');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Libro').should('exist');
    cy.url().should('match', libroPageUrlPattern);
  });

  describe('Libro page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(libroPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Libro page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/libro/new$'));
        cy.getEntityCreateUpdateHeading('Libro');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', libroPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/libros',
          body: libroSample,
        }).then(({ body }) => {
          libro = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/libros+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [libro],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(libroPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Libro page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('libro');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', libroPageUrlPattern);
      });

      it('edit button click should load edit Libro page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Libro');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', libroPageUrlPattern);
      });

      it('edit button click should load edit Libro page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Libro');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', libroPageUrlPattern);
      });

      it('last delete button click should delete instance of Libro', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('libro').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', libroPageUrlPattern);

        libro = undefined;
      });
    });
  });

  describe('new Libro page', () => {
    beforeEach(() => {
      cy.visit(`${libroPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Libro');
    });

    it('should create an instance of Libro', () => {
      cy.get(`[data-cy="isbn"]`).type('11144');
      cy.get(`[data-cy="isbn"]`).should('have.value', '11144');

      cy.get(`[data-cy="precio"]`).type('17587.35');
      cy.get(`[data-cy="precio"]`).should('have.value', '17587.35');

      cy.get(`[data-cy="nombreAutor"]`).type('mostly when fluid');
      cy.get(`[data-cy="nombreAutor"]`).should('have.value', 'mostly when fluid');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        libro = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', libroPageUrlPattern);
    });
  });
});
