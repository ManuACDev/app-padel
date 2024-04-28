import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, MenuController } from '@ionic/angular';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-gestion-reservas',
  templateUrl: './gestion-reservas.page.html',
  styleUrls: ['./gestion-reservas.page.scss'],
})
export class GestionReservasPage implements OnInit {

  usuarios: User[] = [];
  pistas: Pista[] = [];
  reservas: Reserva[] = [];

  resultsR: Reserva[] = [];
  resultsP: Pista[] = [];
  resultsU: User[] = [];

  reservasPistas: { [pistaId: string]: Reserva[] } = {};
  reservasUsuarios: { [usuarioId: string]: Reserva[] } = {};

  filtroPistas: boolean = false;
  filtroUsuarios: boolean = false;
  filtroReservas: boolean = true;

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService, private loadingCtrl: LoadingController, private toast: InteractionService, private router: Router) { }

  async ngOnInit() {
    const loading = await this.showLoading();
    try {
      const lastDisplayMode = localStorage.getItem('lastDisplayMode');
      if (lastDisplayMode) {
        this.onChangeDisplay(lastDisplayMode);
      }
      setTimeout(() => {
        this.obtenerUsuarios();
      }, 250);
      setTimeout(() => {
        this.obtenerPistas();
      }, 400);
      setTimeout(() => {
        this.obtenerReservas();
      }, 550);
      setTimeout(() => {
        this.obtenerReservasUsuarios();
      }, 700);
    } finally {
      loading.dismiss();
    }
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
      this.resultsU = data;
    });
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data;
      this.resultsP = data;
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
          this.reservasPistas[pista.id].push(reserva);
        });
      });
    }
    this.resultsR = this.reservas;
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
    const query = event.target.value.toLowerCase().trim();

    if (query !== '') {
      if (this.filtroReservas) {
        this.resultsR = this.reservas.filter(reserva =>
          Object.values(reserva).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())
          )
        );
      } else if (this.filtroPistas) {
        this.resultsP = this.pistas.filter(pista =>
          Object.values(pista).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())
          )
        );
      } else if (this.filtroUsuarios) {
        this.resultsU = this.usuarios.filter(usuario =>
          Object.values(usuario).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())
          )
        );
      }
    } else {
      if (this.filtroReservas) {
        this.resultsR = this.reservas;
      } else if (this.filtroPistas) {
        this.resultsP = this.pistas;
      } else if (this.filtroUsuarios) {
        this.resultsU = this.usuarios;
      }
    }   
  }

  onChangeDisplay(opcion: string) {
    this.filtroPistas = opcion === 'pistas';
    this.filtroUsuarios = opcion === 'usuarios';
    this.filtroReservas = opcion === 'reservas';

    localStorage.setItem('lastDisplayMode', opcion);
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
    });
    loading.present();
    return loading;
  }

  async navegarComponente(componente: string, reserva: Reserva, usuario: string) {
    const reservaJson = JSON.stringify(reserva);
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente], { queryParams: { reserva: reservaJson, usuario: usuario } });
    }, 500);
  }
  

}
