import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
})
export class AjustesPage implements OnInit {

  constructor(private menuCtrl: MenuController, private toast: InteractionService, private router: Router) { }

  ngOnInit() {
  }

  ionViewDidLeave() {
    this.menuCtrl.enable(true); // Habilita el menu cuando sales del componente
    this.menuCtrl.open(); // Abre el menu automáticamente al volver al home
  }

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }

}
