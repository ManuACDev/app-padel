import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
})
export class AjustesPage implements OnInit {

  constructor(private menuCtrl: MenuController) { }

  ngOnInit() {
  }

  ionViewDidLeave() {
    this.menuCtrl.enable(true); // Habilita el menu cuando sales del componente
    this.menuCtrl.open(); // Abre el menu automáticamente al volver al home
  }

}
