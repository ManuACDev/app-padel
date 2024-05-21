import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { Duplicado } from 'src/app/models/duplicado.model';
import { Pago } from 'src/app/models/pago.model';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { StripeService } from 'src/app/services/stripe.service';

@Component({
  selector: 'app-editar-duplicados',
  templateUrl: './editar-duplicados.page.html',
  styleUrls: ['./editar-duplicados.page.scss'],
})
export class EditarDuplicadosPage {

  duplicado: Duplicado = null;
  duplicadoOriginal: Duplicado = null;

  usuarios: User[] = [];
  reservasUsuarios: Reserva[] = [];
  pagos: Pago[] = [];
  pagosReservas: Pago[] = [];

  constructor(private route: ActivatedRoute, private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private toast: InteractionService, private router: Router, private loadingCtrl: LoadingController, private stripeService: StripeService) { }

  ionViewWillEnter () {
    this.route.queryParams.subscribe(params => {
      this.duplicado = JSON.parse(params['duplicado']);
    });
    this.obtenerUsuarios();
    setTimeout(() => {
      this.obtenerReservasUsuarios();
    }, 250);
    setTimeout(() => {
      this.obtenerPagosReservas();
    }, 400);
  }

  async obtenerUsuarios() {
    const uids: string[] = [];

    for (const reserva of this.duplicado.reservas) {
      const uid = reserva.uid;
      uids.push(uid);
    }

    this.usuarios = [];

    const path = `Usuarios`;
    const usuarios = await this.firestore.getCollection<User>(path);
    usuarios.subscribe(data => {
      this.usuarios = data.filter(usuario => uids.includes(usuario.uid));
    });
  }

  async obtenerReservasUsuarios() {
    this.reservasUsuarios = [];

    for (const usuario of this.usuarios) {  
      this.reservasUsuarios[usuario.uid] = [];    

      for (const reserva of this.duplicado.reservas) {
        if (reserva.uid === usuario.uid) {
          this.reservasUsuarios[usuario.uid].push(reserva);
        }
      }
      
    }    
  }

  async obtenerPagosReservas() {
    const payDocs = this.duplicado.reservas.map((reserva: Reserva) => reserva.paymentDoc);
    const path = `Pagos`;
    
    const pagos = await this.firestore.getCollection<Pago>(path);
    pagos.subscribe(data => {
      const filteredPagos = data.filter(pago => payDocs.includes(pago.id));
      for (const pago of filteredPagos) {
        this.pagosReservas[pago.id] = pago;
      }
    });
  }

  async presentActionSheet(reserva: Reserva, pago: Pago) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Reembolsar',
          handler: () => {
            this.reembolsarReserva(reserva, pago);
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

  async reembolsarReserva(reserva: Reserva, pago: Pago) {
    const loading = await this.showLoading('Reembolsando reserva...');
    try {
      const fecha = new Date();
      const fechaFormateada = formatDate(fecha, 'dd/MM/yyyy', 'en-US');
      
      const response = await this.stripeService.refund(pago.paymentIntentId, reserva.uid, fechaFormateada);
      
      if (response == true) {
        const id = reserva.id;
        const path = `Pistas/${reserva.pista}/Reservas`;

        await this.firestore.deleteDoc<Reserva>(path, id).then(async () => {
          const path = `Pagos`;
          const id = reserva.paymentDoc;

          await this.firestore.deleteDoc<Pago>(path, id).then(() => {
            this.navegarComponente('gestion-reservas');
            this.toast.presentToast("Pago reembolsado correctamente", 1000);
          }).catch(error => {
            console.error(error);
            this.toast.presentToast("Error al reembolsar el pago", 1000);
          });
        }).catch(error => {
          console.error(error);
          this.toast.presentToast("Error al reembolsar el pago", 1000);
        });
      } else {
        loading.dismiss();
        this.toast.presentToast("Error al reembolsar el pago", 1000); 
      }
    } catch (error) {
      console.error(error);
      this.toast.presentToast("Error al reembolsar el pago", 1000);
    } finally {
      loading.dismiss();
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
