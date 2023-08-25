import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  constructor(private toastController: ToastController) { }

  async presentToast(mensaje: string, duration: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duration,
    });
    await toast.present();
  }

}
