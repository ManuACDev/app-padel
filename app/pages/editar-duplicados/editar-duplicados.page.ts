import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Duplicado } from 'src/app/models/duplicado.model';
import { Pago } from 'src/app/models/pago.model';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';

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
  pagosUsuarios: Pago[] = [];

  constructor(private route: ActivatedRoute, private firestore: FirestoreService) { }

  ionViewWillEnter () {
    this.route.queryParams.subscribe(params => {
      this.duplicado = JSON.parse(params['duplicado']);
    });
    this.obtenerUsuarios();
    setTimeout(() => {
      this.obtenerReservasUsuarios();
    }, 250);
    setTimeout(() => {
      this.obtenerPagosUsuarios();
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

  async obtenerPagosUsuarios() {
    const payDocs = this.duplicado.reservas.map(reserva => reserva.paymentDoc);

    for (const usuario of this.usuarios) {
      const id = usuario.uid;
      const path = 'Pagos';
      const pagos = await this.firestore.getCollectionId<Pago>(id, path);

      this.pagosUsuarios[usuario.uid] = [];

      pagos.subscribe(data => {
        data.forEach((doc) => {
          const pago = doc.data() as Pago;
          if (payDocs.includes(pago.id)) {
            this.pagosUsuarios[usuario.uid].push(pago);
          }
        });
      });
    }
  }

}
