import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionReembolsosPageRoutingModule } from './gestion-reembolsos-routing.module';

import { GestionReembolsosPage } from './gestion-reembolsos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionReembolsosPageRoutingModule
  ],
  declarations: [GestionReembolsosPage]
})
export class GestionReembolsosPageModule {}
