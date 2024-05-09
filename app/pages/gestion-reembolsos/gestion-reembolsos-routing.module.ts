import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionReembolsosPage } from './gestion-reembolsos.page';

const routes: Routes = [
  {
    path: '',
    component: GestionReembolsosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionReembolsosPageRoutingModule {}
