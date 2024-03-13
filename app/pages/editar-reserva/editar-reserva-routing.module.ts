import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarReservaPage } from './editar-reserva.page';

const routes: Routes = [
  {
    path: '',
    component: EditarReservaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarReservaPageRoutingModule {}
