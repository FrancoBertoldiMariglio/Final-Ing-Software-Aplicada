import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { ILibro, NewLibro } from '../libro.model';

export type PartialUpdateLibro = Partial<ILibro> & Pick<ILibro, 'id'>;

export type EntityResponseType = HttpResponse<ILibro>;
export type EntityArrayResponseType = HttpResponse<ILibro[]>;

@Injectable({ providedIn: 'root' })
export class LibroService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/libros');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/libros/_search');

  create(libro: NewLibro): Observable<EntityResponseType> {
    return this.http.post<ILibro>(this.resourceUrl, libro, { observe: 'response' });
  }

  update(libro: ILibro): Observable<EntityResponseType> {
    return this.http.put<ILibro>(`${this.resourceUrl}/${this.getLibroIdentifier(libro)}`, libro, { observe: 'response' });
  }

  partialUpdate(libro: PartialUpdateLibro): Observable<EntityResponseType> {
    return this.http.patch<ILibro>(`${this.resourceUrl}/${this.getLibroIdentifier(libro)}`, libro, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ILibro>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ILibro[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ILibro[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<ILibro[]>()], asapScheduler)));
  }

  getLibroIdentifier(libro: Pick<ILibro, 'id'>): number {
    return libro.id;
  }

  compareLibro(o1: Pick<ILibro, 'id'> | null, o2: Pick<ILibro, 'id'> | null): boolean {
    return o1 && o2 ? this.getLibroIdentifier(o1) === this.getLibroIdentifier(o2) : o1 === o2;
  }

  addLibroToCollectionIfMissing<Type extends Pick<ILibro, 'id'>>(
    libroCollection: Type[],
    ...librosToCheck: (Type | null | undefined)[]
  ): Type[] {
    const libros: Type[] = librosToCheck.filter(isPresent);
    if (libros.length > 0) {
      const libroCollectionIdentifiers = libroCollection.map(libroItem => this.getLibroIdentifier(libroItem));
      const librosToAdd = libros.filter(libroItem => {
        const libroIdentifier = this.getLibroIdentifier(libroItem);
        if (libroCollectionIdentifiers.includes(libroIdentifier)) {
          return false;
        }
        libroCollectionIdentifiers.push(libroIdentifier);
        return true;
      });
      return [...librosToAdd, ...libroCollection];
    }
    return libroCollection;
  }
}
