import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarDuplicadosPageRoutingModule } from './editar-duplicados-routing.module';

import { EditarDuplicadosPage } from './editar-duplicados.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarDuplicadosPageRoutingModule
  ],
  declarations: [EditarDuplicadosPage]
})
export class EditarDuplicadosPageModule {}
