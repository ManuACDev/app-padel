import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController } from '@ionic/angular';
import { User } from 'src/app/models/user.model'
import { Pago } from 'src/app/models/pago.model';;
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-pagos',
  templateUrl: './gestion-pagos.page.html',
  styleUrls: ['./gestion-pagos.page.scss'],
})
export class GestionPagosPage {

  usuarios: User[] = [];
  resultsU: User[] = [];

  pagos: Pago[] = [];
  resultsP: Pago[] = [];

  pagosUsuarios: { [usuarioId: string]: Pago[] } = {};

  filtroUsuarios: boolean = false;
  filtroPagos: boolean = false;

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService, private toast: InteractionService, private router: Router, private loadingCtrl: LoadingController) { }

  async ionViewWillEnter() {
    const loading = await this.showLoading();
    try {
      const lastDisplayMode = localStorage.getItem('lastDisplayModePay');
      if (lastDisplayMode) {
        this.onChangeDisplay(lastDisplayMode);
      }
      setTimeout(() => {
        this.obtenerUsuarios();
      },250);
      setTimeout(() => {
        this.obtenerPagos();
        this.obtenerPagosUsuarios();
      }, 500);
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

  async obtenerPagos() {
    this.pagos = [];

    const path = `Pagos`;
    const pagos = await this.firestore.getCollection<Pago>(path);
    pagos.subscribe(data => {      
      this.pagos = data;
      this.resultsP = data;
    });
  }

  async obtenerPagosUsuarios() {
    for (const usuario of this.usuarios) {
      const id = usuario.uid;
      const path = 'Pagos';
      const pagos = await this.firestore.getCollectionId<Pago>(id, path);

      this.pagosUsuarios[usuario.uid] = [];

      pagos.subscribe(data => {
        data.forEach((doc) => {
          const pago = doc.data() as Pago;
          this.pagosUsuarios[usuario.uid].push(pago);
        });
      });
    }
  }

  searchPay(event) {
    const query = event.target.value.toLowerCase().trim();
    if (query !== '') {
      if (this.filtroUsuarios) {
        this.resultsU = this.usuarios.filter(usuario =>
          Object.values(usuario).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())
          )
        );
      } else if (this.filtroPagos) {
        this.resultsP = this.pagos.filter(pago => 
          Object.values(pago).some(value => 
            typeof value === 'string' && value.toLocaleLowerCase().includes(query.toLocaleLowerCase())
          )
        )
      }
    } else {
      if (this.filtroUsuarios) {
        this.resultsU = this.usuarios; 
      } else if (this.filtroPagos) {
        this.resultsP = this.pagos;
      }
    }    
  }

  onChangeDisplay(opcion: string) {
    this.filtroUsuarios = opcion === 'usuarios';
    this.filtroPagos = opcion === 'pagos';

    localStorage.setItem('lastDisplayModePay', opcion);
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
    });
    loading.present();
    return loading;
  }

  async navegarComponente(componente: string, pago: Pago, usuario: string) {
    const pagoJson = JSON.stringify(pago);
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente], { queryParams: { pago: pagoJson, usuario: usuario } });
    }, 500);
  }

}
