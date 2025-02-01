import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import LibroResolve from './route/libro-routing-resolve.service';

const libroRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/libro.component').then(m => m.LibroComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/libro-detail.component').then(m => m.LibroDetailComponent),
    resolve: {
      libro: LibroResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/libro-update.component').then(m => m.LibroUpdateComponent),
    resolve: {
      libro: LibroResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/libro-update.component').then(m => m.LibroUpdateComponent),
    resolve: {
      libro: LibroResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default libroRoute;
