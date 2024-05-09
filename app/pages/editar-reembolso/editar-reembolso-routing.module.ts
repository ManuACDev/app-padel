import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarReembolsoPage } from './editar-reembolso.page';

const routes: Routes = [
  {
    path: '',
    component: EditarReembolsoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarReembolsoPageRoutingModule {}
