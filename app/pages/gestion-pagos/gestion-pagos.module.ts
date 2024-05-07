import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionPagosPageRoutingModule } from './gestion-pagos-routing.module';

import { GestionPagosPage } from './gestion-pagos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionPagosPageRoutingModule
  ],
  declarations: [GestionPagosPage]
})
export class GestionPagosPageModule {}
