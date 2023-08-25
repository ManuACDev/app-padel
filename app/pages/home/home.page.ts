import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/services/interaction.service';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private toast: InteractionService, private router: Router, private menuCtrl: MenuController, private auth: AuthService) {}

  ngOnInit() {
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
    this.toast.presentToast('Sesión finalizada', 1000);
  }

}
