import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarReservaPageRoutingModule } from './editar-reserva-routing.module';

import { EditarReservaPage } from './editar-reserva.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarReservaPageRoutingModule
  ],
  declarations: [EditarReservaPage]
})
export class EditarReservaPageModule {}
