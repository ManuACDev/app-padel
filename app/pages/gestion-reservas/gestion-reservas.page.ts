import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-gestion-reservas',
  templateUrl: './gestion-reservas.page.html',
  styleUrls: ['./gestion-reservas.page.scss'],
})
export class GestionReservasPage implements OnInit {

  usuarios: User[] = [];
  pistas: Pista[] = [];
  reservas: Reserva[] = [];

  results: Reserva[] = [];

  reservasPistas: { [pistaId: string]: Reserva[] } = {};
  reservasUsuarios: { [usuarioId: string]: Reserva[] } = {};

  filtroPistas: boolean = false;
  filtroUsuarios: boolean = false;
  filtroReservas: boolean = true;

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService) { }

  ngOnInit() {
    this.obtenerUsuarios();
    setTimeout(() => {
      this.obtenerPistas();
    }, 500);
    setTimeout(() => {
      this.obtenerReservas();
    }, 600);
    setTimeout(() => {
      this.obtenerReservasUsuarios();
    }, 600);
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
  }

  async obtenerUsuarios() {
    this.usuarios = [];

    const path = `Usuarios`;
    const usuarios = await this.firestore.getCollection<User>(path);
    usuarios.subscribe(data => {
      this.usuarios = data;
    });
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data;
    });
  }
  
  async obtenerReservas() {    

    for (const pista of this.pistas) {
      const path = `Pistas/${pista.id}/Reservas`;
      const reservas = await this.firestore.getCollection<Reserva>(path);

      this.reservasPistas[pista.id] = [];

      reservas.subscribe(data => {
        data.forEach((doc) => {
          const reserva = doc;
          this.reservas.push(reserva);
          this.results.push(reserva);
          this.reservasPistas[pista.id].push(reserva);
        });
      });
    }
  }

  async obtenerReservasUsuarios() {
    
    for (const usuario of this.usuarios) {
      const id = usuario.uid;

      for (const pista of this.pistas) {
        const path = `Pistas/${pista.id}/Reservas`;
        const reservas = await this.firestore.getCollectionId<Reserva>(id, path);

        this.reservasUsuarios[usuario.uid] = [];

        reservas.subscribe(data => {
          data.forEach((doc) => {
            const reserva = doc.data() as Reserva;
            this.reservasUsuarios[usuario.uid].push(reserva);
          });
        });
      }
    }
  }

  searchReserva(event) {
    const query = event.target.value;
    if (query.trim() !== '') {
      if (this.filtroReservas) {
        this.results = this.reservas.filter(reserva => {
          return Object.values(reserva).some(value => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(query);
            }
            return false;
          });
        });
      }
    } else {
      this.results = this.reservas;
    }    
  }

  onChangeDisplay(opcion: string) {
    this.filtroPistas = opcion === 'pistas';
    this.filtroUsuarios = opcion === 'usuarios';
    this.filtroReservas = opcion === 'reservas';
  }
  

}
