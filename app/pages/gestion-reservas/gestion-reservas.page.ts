import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, MenuController } from '@ionic/angular';
import { Duplicado } from 'src/app/models/duplicado.model';
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
export class GestionReservasPage {

  usuarios: User[] = [];
  pistas: Pista[] = [];
  reservas: Reserva[] = [];
  duplicados: Duplicado[] = [];

  resultsU: User[] = [];
  resultsP: Pista[] = [];
  resultsR: Reserva[] = [];
  resultsD: Duplicado[] = [];

  reservasUsuarios: { [usuarioId: string]: Reserva[] } = {};
  reservasPistas: { [pistaId: string]: Reserva[] } = {};

  filtroUsuarios: boolean = false;
  filtroPistas: boolean = false;
  filtroReservas: boolean = true;
  filtroDuplicados: boolean = true;

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService, private loadingCtrl: LoadingController, private toast: InteractionService, private router: Router) { }

  async ionViewWillEnter() {
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
      setTimeout(() => {
        this.obtenerReservasDuplicadas();
      }, 850);
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
    this.reservas = [];    

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

  async obtenerReservasDuplicadas() {
    const duplicados = new Map<string, Duplicado>();

    for (const pista of this.pistas) {
        const path = `Pistas/${pista.id}/Reservas`;
        const reservas = await this.firestore.getCollection<Reserva>(path);

        reservas.subscribe(data => {
            data.forEach((reserva) => {
                const key = `${reserva.pista}_${reserva.fecha}_${reserva.hora}`;

                if (duplicados.has(key)) {
                    const duplicado = duplicados.get(key);
                    duplicado.reservas.push(reserva);
                } else {
                    duplicados.set(key, {
                        pista: reserva.pista,
                        fecha: reserva.fecha,
                        hora: reserva.hora,
                        reservas: [reserva]
                    });
                }
            });

            this.duplicados = Array.from(duplicados.values()).filter(dup => dup.reservas.length > 1);
            this.resultsD = Array.from(duplicados.values()).filter(dup => dup.reservas.length > 1);
        });
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
      } else if (this.filtroDuplicados) {
        this.resultsD = this.duplicados.filter(duplicado =>
          Object.values(duplicado).some(value =>
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
      } else if (this.filtroDuplicados) {
        this.resultsD = this.duplicados
      }
    }   
  }

  onChangeDisplay(opcion: string) {
    this.filtroPistas = opcion === 'pistas';
    this.filtroUsuarios = opcion === 'usuarios';
    this.filtroReservas = opcion === 'reservas';
    this.filtroDuplicados = opcion === 'duplicadas';

    localStorage.setItem('lastDisplayMode', opcion);
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
    });
    loading.present();
    return loading;
  }

  async navegarComponente(componente: string, reserva?: Reserva, usuario?: string, duplicado?: Duplicado) {
    const reservaJson = JSON.stringify(reserva);
    const duplicadoJson = JSON.stringify(duplicado);
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente], { queryParams: { reserva: reservaJson, usuario: usuario, duplicado: duplicadoJson } });
    }, 500);
  }
  

}
