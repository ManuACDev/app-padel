import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
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
  reservasPista1: Reserva[] = [];
  reservasPista2: Reserva[] = [];
  pistas: string[] = ['Pista1', 'Pista2'];

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService, private auth: AuthService, private toast: InteractionService) { }

  ngOnInit() {
    this.auth.stateUser().subscribe( res => {
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
      this.obtenerReservasUsuario();
    } else {
      console.log("No existe uid");
    }
  }
  
  async obtenerReservasUsuario() {
    this.reservasPista1 = [];
    this.reservasPista2 = [];

    const id = this.uid;
    const pistas = this.pistas;

    for (let i = 0; i < pistas.length; i++) {
      const path = `Pistas/${pistas[i]}/Reservas`;
      const reservas = await this.firestore.getCollectionId<Reserva>(id, path);
      reservas.subscribe(data => {
        data.forEach((doc) => {
          const reserva = doc.data() as Reserva;
          if (reserva.pista === 'Pista1') {
            this.reservasPista1.push(reserva);
          } else if (reserva.pista === 'Pista2') {
            this.reservasPista2.push(reserva);
          }
        });
      });
    }
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

}
