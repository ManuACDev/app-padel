import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerificacionEmailPage } from './verificacion-email.page';

const routes: Routes = [
  {
    path: '',
    component: VerificacionEmailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificacionEmailPageRoutingModule {}
