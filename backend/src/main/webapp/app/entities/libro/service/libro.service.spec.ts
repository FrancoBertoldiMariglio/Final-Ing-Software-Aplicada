import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ILibro } from '../libro.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../libro.test-samples';

import { LibroService } from './libro.service';

const requireRestSample: ILibro = {
  ...sampleWithRequiredData,
};

describe('Libro Service', () => {
  let service: LibroService;
  let httpMock: HttpTestingController;
  let expectedResult: ILibro | ILibro[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(LibroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Libro', () => {
      const libro = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(libro).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Libro', () => {
      const libro = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(libro).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Libro', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Libro', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Libro', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Libro', () => {
      const queryObject: any = {
        page: 0,
        size: 20,
        query: '',
        sort: [],
      };
      service.search(queryObject).subscribe(() => expectedResult);

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(expectedResult).toBe(null);
    });

    describe('addLibroToCollectionIfMissing', () => {
      it('should add a Libro to an empty array', () => {
        const libro: ILibro = sampleWithRequiredData;
        expectedResult = service.addLibroToCollectionIfMissing([], libro);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(libro);
      });

      it('should not add a Libro to an array that contains it', () => {
        const libro: ILibro = sampleWithRequiredData;
        const libroCollection: ILibro[] = [
          {
            ...libro,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addLibroToCollectionIfMissing(libroCollection, libro);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Libro to an array that doesn't contain it", () => {
        const libro: ILibro = sampleWithRequiredData;
        const libroCollection: ILibro[] = [sampleWithPartialData];
        expectedResult = service.addLibroToCollectionIfMissing(libroCollection, libro);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(libro);
      });

      it('should add only unique Libro to an array', () => {
        const libroArray: ILibro[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const libroCollection: ILibro[] = [sampleWithRequiredData];
        expectedResult = service.addLibroToCollectionIfMissing(libroCollection, ...libroArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const libro: ILibro = sampleWithRequiredData;
        const libro2: ILibro = sampleWithPartialData;
        expectedResult = service.addLibroToCollectionIfMissing([], libro, libro2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(libro);
        expect(expectedResult).toContain(libro2);
      });

      it('should accept null and undefined values', () => {
        const libro: ILibro = sampleWithRequiredData;
        expectedResult = service.addLibroToCollectionIfMissing([], null, libro, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(libro);
      });

      it('should return initial array if no Libro is added', () => {
        const libroCollection: ILibro[] = [sampleWithRequiredData];
        expectedResult = service.addLibroToCollectionIfMissing(libroCollection, undefined, null);
        expect(expectedResult).toEqual(libroCollection);
      });
    });

    describe('compareLibro', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareLibro(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareLibro(entity1, entity2);
        const compareResult2 = service.compareLibro(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareLibro(entity1, entity2);
        const compareResult2 = service.compareLibro(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareLibro(entity1, entity2);
        const compareResult2 = service.compareLibro(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
