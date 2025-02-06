import { ILibro, NewLibro } from './libro.model';

export const sampleWithRequiredData: ILibro = {
  id: 8879,
};

export const sampleWithPartialData: ILibro = {
  id: 1740,
  precio: 45.67,
  nombreAutor: 'fooey',
};

export const sampleWithFullData: ILibro = {
  id: 18069,
  isbn: 7718,
  precio: 11072.78,
  nombreAutor: 'lisp circumvent',
};

export const sampleWithNewData: NewLibro = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
