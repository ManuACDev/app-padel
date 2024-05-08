import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { Pago } from 'src/app/models/pago.model';
import { Reserva } from 'src/app/models/reserva.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-editar-pago',
  templateUrl: './editar-pago.page.html',
  styleUrls: ['./editar-pago.page.scss'],
})
export class EditarPagoPage implements OnInit {

  pago: Pago = null;
  reserva: Reserva = null;

  constructor(private route: ActivatedRoute, private actionSheetCtrl: ActionSheetController, private toast: InteractionService, private router: Router, private loadingCtrl: LoadingController, private firestore: FirestoreService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.pago = JSON.parse(params['pago']);
    });
  }

  async presentActionSheet(pago: Pago) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.borrarPago(pago);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
  
    await actionSheet.present();
  }

  async borrarPago(pago: Pago) {
    if (pago.active) {
      this.toast.presentToast("No se puede eliminar el recibo porque la reserva asociada aún está activa.", 1000);
    } else {
      const loading = await this.showLoading('Elimninando recibo...');
      try {
        const id = pago.id;
        const path = `Pagos`;
  
        await this.firestore.deleteDoc<Pago>(path, id).then(async () => {
          this.navegarComponente('gestion-pagos');
          this.toast.presentToast("Recibo eliminado correctamente.", 1000);
        }).catch(error => {
          console.error(error);
          this.toast.presentToast("Error al eliminar el recibo.", 1000);
        });
      } catch (error) {
        console.error(error);
        this.toast.presentToast("Error al eliminar el recibo.", 1000);
      } finally {
        loading.dismiss();
      } 
    }
  }

  async showLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
    });
    loading.present();
    return loading;
  }

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }

}
