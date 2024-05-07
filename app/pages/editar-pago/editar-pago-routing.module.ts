import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarPagoPage } from './editar-pago.page';

const routes: Routes = [
  {
    path: '',
    component: EditarPagoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarPagoPageRoutingModule {}
