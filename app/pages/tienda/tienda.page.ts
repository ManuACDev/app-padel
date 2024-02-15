import { Component, OnInit } from '@angular/core';
import { Producto } from 'src/app/models/producto.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ModalController } from '@ionic/angular';
import { ModalPage } from 'src/app/pages/modal/modal.page';

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.page.html',
  styleUrls: ['./tienda.page.scss'],
})
export class TiendaPage implements OnInit {

  productos: Producto[] = [];

  constructor(private firestore: FirestoreService, private modalController: ModalController) { }

  ngOnInit() {
    this.obtenerProductos();
  }

  async obtenerProductos() {
    this.productos = [];

    const path = `Productos`;
    const productos = await this.firestore.getCollection<Producto>(path);
    productos.subscribe(data => {
      this.productos = data;
    });
  }

  async openModal(producto) {
    const modal = await this.modalController.create({
      component: ModalPage,
      componentProps: { producto : producto}
    });
    return await modal.present();
  }

}
