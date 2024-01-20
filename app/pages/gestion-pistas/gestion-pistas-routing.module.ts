import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionPistasPage } from './gestion-pistas.page';

const routes: Routes = [
  {
    path: '',
    component: GestionPistasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionPistasPageRoutingModule {}
