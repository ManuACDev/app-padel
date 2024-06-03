import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionProductosPageRoutingModule } from './gestion-productos-routing.module';

import { GestionProductosPage } from './gestion-productos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionProductosPageRoutingModule
  ],
  declarations: [GestionProductosPage]
})
export class GestionProductosPageModule {}
