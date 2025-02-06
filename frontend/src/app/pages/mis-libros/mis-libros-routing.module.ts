import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisLibrosPage } from './mis-libros.page';

const routes: Routes = [
  {
    path: '',
    component: MisLibrosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisLibrosPageRoutingModule {}
