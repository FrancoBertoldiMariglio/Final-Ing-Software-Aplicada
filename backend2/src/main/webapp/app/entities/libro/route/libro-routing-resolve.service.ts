import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ILibro } from '../libro.model';
import { LibroService } from '../service/libro.service';

const libroResolve = (route: ActivatedRouteSnapshot): Observable<null | ILibro> => {
  const id = route.params.id;
  if (id) {
    return inject(LibroService)
      .find(id)
      .pipe(
        mergeMap((libro: HttpResponse<ILibro>) => {
          if (libro.body) {
            return of(libro.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default libroResolve;
