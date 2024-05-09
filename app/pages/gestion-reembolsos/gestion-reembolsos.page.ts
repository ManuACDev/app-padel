import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, MenuController } from '@ionic/angular';
import { Reembolso } from 'src/app/models/reembolso.model';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-gestion-reembolsos',
  templateUrl: './gestion-reembolsos.page.html',
  styleUrls: ['./gestion-reembolsos.page.scss'],
})
export class GestionReembolsosPage {

  usuarios: User[] = [];
  resultsU: User[] = [];

  reembolsos: Reembolso[] = [];
  resultsR: Reembolso[] = [];

  reembolsosUsuarios: { [usuarioId: string]: Reembolso[] } = {};

  filtroUsuarios: boolean = false;
  filtroReembolsos: boolean = true;

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService, private toast: InteractionService, private router: Router, private loadingCtrl: LoadingController) { }

  async ionViewWillEnter() {
    const loading = await this.showLoading();
    try {
      const lastDisplayMode = localStorage.getItem('lastDisplayModeRefund');
      if (lastDisplayMode) {
        this.onChangeDisplay(lastDisplayMode);
      }
      setTimeout(() => {
        this.obtenerUsuarios();
      },250);
      setTimeout(() => {
        this.obtenerReembolsos();
        this.obtenerReembolsosUsuarios();
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

  async obtenerReembolsos() {
    this.reembolsos = [];

    const path = `Reembolsos`;
    const reembolsos = await this.firestore.getCollection<Reembolso>(path);
    reembolsos.subscribe(data => {      
      this.reembolsos = data;
      this.resultsR = data;
    });
  }

  async obtenerReembolsosUsuarios() {
    for (const usuario of this.usuarios) {
      const id = usuario.uid;
      const path = 'Reembolsos';
      const reembolsos = await this.firestore.getCollectionId<Reembolso>(id, path);

      this.reembolsosUsuarios[usuario.uid] = [];

      reembolsos.subscribe(data => {
        data.forEach((doc) => {
          const reembolso = doc.data() as Reembolso;
          this.reembolsosUsuarios[usuario.uid].push(reembolso);
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
      } else if (this.filtroReembolsos) {
        this.resultsR = this.reembolsos.filter(reembolso =>
          Object.values(reembolso).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())
          )
        );
      }
    } else {
      if (this.filtroUsuarios) {
        this.resultsU = this.usuarios; 
      } else if (this.filtroReembolsos) {
        this.resultsR = this.reembolsos;
      }
    }    
  }

  onChangeDisplay(opcion: string) {
    this.filtroUsuarios = opcion === 'usuarios';
    this.filtroReembolsos = opcion === 'reembolsos';

    localStorage.setItem('lastDisplayModeRefund', opcion);
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
    });
    loading.present();
    return loading;
  }

  async navegarComponente(componente: string, reembolso: Reembolso) {
    const reembolsoJson = JSON.stringify(reembolso);
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente], { queryParams: { reembolso: reembolsoJson } });
    }, 500);
  }

}
