import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PistasPageRoutingModule } from './pistas-routing.module';

import { PistasPage } from './pistas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PistasPageRoutingModule
  ],
  declarations: [PistasPage]
})
export class PistasPageModule {}
