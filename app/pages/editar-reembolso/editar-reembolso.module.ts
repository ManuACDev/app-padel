import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarReembolsoPageRoutingModule } from './editar-reembolso-routing.module';

import { EditarReembolsoPage } from './editar-reembolso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarReembolsoPageRoutingModule
  ],
  declarations: [EditarReembolsoPage]
})
export class EditarReembolsoPageModule {}
