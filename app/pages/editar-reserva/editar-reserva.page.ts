import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { Pago } from 'src/app/models/pago.model';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-editar-reserva',
  templateUrl: './editar-reserva.page.html',
  styleUrls: ['./editar-reserva.page.scss'],
})
export class EditarReservaPage implements OnInit {

  uid: string = null;
  usuario: User =  null;
  reserva: Reserva = null;
  pistas: Pista[] = [];
  pago: Pago = null;

  constructor(private route: ActivatedRoute, private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private toast: InteractionService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.uid = params['usuario']; 
      this.reserva = JSON.parse(params['reserva']);
    });
    this.obtenerUsuario();
    this.obtenerPistas();
    this.obtenerPago();
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data;
    });
  }

  async obtenerUsuario() {
    const path = `Usuarios`;
    const usuario = this.firestore.getDoc<User>(path, this.uid);    
    
    usuario.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  async obtenerPago() {
    const path = `Pagos`;
    const pago = this.firestore.getDoc<Pago>(path, this.reserva.paymentDoc);

    pago.subscribe(pago => {
      this.pago = pago;
    });
  }

  async presentActionSheet(reserva: Reserva) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.borrarReserva(reserva.pista, reserva);
          }
        },
        {
          text: 'Reembolsar',
          handler: () => {
            //this.changePassword(reserva);
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
  
  async borrarReserva(pista: string, reserva: Reserva) {
    const loading = await this.showLoading('Cancelando reserva...');
    try {
      const id = reserva.id;
      const path = `Pistas/${pista}/Reservas`;

      await this.firestore.deleteDoc<Reserva>(path, id).then(() => {
        this.navegarComponente('gestion-reservas');
        this.toast.presentToast("Reserva cancelada correctamente.", 1000);
      }).catch(error => {
        console.error(error);
        this.toast.presentToast("Error al cancelar la reserva", 1000);
      });
    } catch (error) {
      console.error(error);
      this.toast.presentToast("Error al cancelar la reserva", 1000);
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
