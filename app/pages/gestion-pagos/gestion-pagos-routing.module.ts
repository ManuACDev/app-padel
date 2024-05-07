import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionPagosPage } from './gestion-pagos.page';

const routes: Routes = [
  {
    path: '',
    component: GestionPagosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionPagosPageRoutingModule {}
