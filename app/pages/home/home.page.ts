import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/services/interaction.service';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  uid: string = null;
  perfil: string = null;

  constructor(private toast: InteractionService, private router: Router, private menuCtrl: MenuController, private auth: AuthService, private firestore: FirestoreService) {}

  ngOnInit() {
    this.auth.stateUser().subscribe(res => {
      this.getId();
    })
  }

  async getId() {
    const uid = await this.auth.getUid();
    if (uid) {
      this.uid = uid;
      this.getDatosUser(uid);
    } else {
      console.log("No existe uid");
    }
  }

  getDatosUser(uid: string) {
    const path = 'Usuarios';
    const id = uid;
    this.firestore.getDoc<User>(path, id).subscribe(res => {
      if (res) {
        this.perfil = res.perfil;
      }
    })
  }

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }

  abrirMenu() {
    this.menuCtrl.open();
  }

  cerrarMenu() {
    this.menuCtrl.close();
  }

  logout() {
    this.auth.logout();
    localStorage.setItem('sesionActiva', 'false');
    localStorage.setItem('lastDisplayMode', 'reservas');
    this.toast.presentToast('Sesión finalizada', 1000);
  }

}
