import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarDuplicadosPage } from './editar-duplicados.page';

const routes: Routes = [
  {
    path: '',
    component: EditarDuplicadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarDuplicadosPageRoutingModule {}
