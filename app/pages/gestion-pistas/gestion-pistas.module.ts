import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionPistasPageRoutingModule } from './gestion-pistas-routing.module';

import { GestionPistasPage } from './gestion-pistas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionPistasPageRoutingModule
  ],
  declarations: [GestionPistasPage]
})
export class GestionPistasPageModule {}
