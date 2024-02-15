import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.page.html',
  styleUrls: ['./gestion-usuarios.page.scss'],
})
export class GestionUsuariosPage implements OnInit {

  constructor(private menuCtrl: MenuController) { }

  ngOnInit() {
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
  }

}
