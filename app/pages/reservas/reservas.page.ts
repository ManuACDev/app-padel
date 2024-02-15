import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, MenuController } from '@ionic/angular';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
})
export class ReservasPage implements OnInit {

  uid: string = null;
  reservasPistas: { [pistaId: string]: Reserva[] } = {};
  pistas: Pista[] = [];

  fechasPasadas: Reserva[] = [];

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService, private auth: AuthService, private toast: InteractionService, private loadingCtrl: LoadingController, private alertController: AlertController) { }

  ngOnInit() {
    this.obtenerPistas();
    this.auth.stateUser().subscribe(res => {
      this.getId();
    });
  }

  ionViewDidLeave() {
    this.menuCtrl.enable(true); // Habilita el menu cuando sales del componente
    this.menuCtrl.open(); // Abre el menu automáticamente al volver al home
  }

  async getId() {
    const uid = await this.auth.getUid();
    if (uid) {
      this.uid = uid;
      setTimeout(() => {
        this.borrarReservasAuto();
      }, 500);      
    } else {
      console.log("No existe uid");
    }
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data;
    });
  }
  
  async obtenerReservasUsuario() {    
    const id = this.uid;

    for (const pista of this.pistas) {
      const path = `Pistas/${pista.id}/Reservas`;
      const reservas = await this.firestore.getCollectionId<Reserva>(id, path);

      this.reservasPistas[pista.id] = [];

      reservas.subscribe(data => {
        data.forEach((doc) => {
          const reserva = doc.data() as Reserva;
          this.reservasPistas[pista.id].push(reserva);
        });
      });
    }
  }

  async confirmarBorrar(idPista: string, reserva: Reserva) {
    const confirmacion = await this.alertController.create({
      header: 'Eliminar reserva',
      subHeader: '¿Estás seguro de eliminar la reserva?',
      message: 'Esta acción no se puede deshacer y no se devolverá el pago.',
      cssClass: 'alert-reservas',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.toast.presentToast('Acción cancelada', 1000);
          }
        },
        {
          text: 'Eliminar',
          handler: async () => {
            this.borrarReserva(idPista, reserva);
          }
        }
      ]
    });
    await confirmacion.present();
  }

  async borrarReserva(pista:string, reserva:Reserva) {
    const id = this.uid;
    const path = `Pistas/${pista}/Reservas`;
    const reservas = await this.firestore.getCollectionId<Reserva>(id, path);
    reservas.subscribe(async data => {
      data.forEach(async (doc) => {
        if (doc.id === reserva.id) {
          console.log(doc.id); 
          await this.firestore.deleteDoc(path, doc.id).then(() => {
            this.toast.presentToast("Reserva borrada", 1000);
            this.obtenerReservasUsuario();
          }).catch(error => {
            console.error(error);
            this.toast.presentToast("Error al borrar la reserva", 1000);
          });
        }
      });
    });
  }

  async borrarReservasAuto() {
    const loading = await this.showLoading();

    try {
      const id = this.uid;
      const deletePromises: Promise<void>[] = [];

      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0);

      for (const pista of this.pistas) {
        const path = `Pistas/${pista.id}/Reservas`;
        const reservas = await this.firestore.getCollectionId<Reserva>(id, path);

        reservas.subscribe(data => {
          data.forEach(async (doc) => {
            const reserva = doc.data() as Reserva;
            const fechaReserva = this.parseFechaString(reserva.fecha);

            if (fechaReserva < fechaActual) {
              if (doc.id === reserva.id) {
                console.log(doc.id); 
                const deletePromise = this.firestore.deleteDoc(path, doc.id).then().catch(error => {
                  console.error(error);
                  this.toast.presentToast("Error al borrar la reserva", 1000);
                });
                deletePromises.push(deletePromise);
              }
            }
          });
        });
      }
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error durante el borrado de reservas:', error);
    } finally {
      loading.dismiss();
      setTimeout(() => {
        this.obtenerReservasUsuario();
      }, 600);
    }    
  }
  
  parseFechaString(fechaString: string): Date {
    const partes = fechaString.split('/');
    
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const anio = parseInt(partes[2], 10);
  
    return new Date(anio, mes, dia);
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando reservas pasadas...',
    });
    loading.present();
    return loading;
  }
}
