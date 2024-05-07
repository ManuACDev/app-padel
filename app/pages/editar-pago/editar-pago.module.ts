import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarPagoPageRoutingModule } from './editar-pago-routing.module';

import { EditarPagoPage } from './editar-pago.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarPagoPageRoutingModule
  ],
  declarations: [EditarPagoPage]
})
export class EditarPagoPageModule {}
