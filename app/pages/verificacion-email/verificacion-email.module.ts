import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificacionEmailPageRoutingModule } from './verificacion-email-routing.module';

import { VerificacionEmailPage } from './verificacion-email.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificacionEmailPageRoutingModule
  ],
  declarations: [VerificacionEmailPage]
})
export class VerificacionEmailPageModule {}
