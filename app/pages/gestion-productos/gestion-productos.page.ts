import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, MenuController, ModalController } from '@ionic/angular';
import { Producto } from 'src/app/models/producto.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ModalPage } from '../modal/modal.page';
import { InteractionService } from 'src/app/services/interaction.service';
import { FirestorageService } from 'src/app/services/firestorage.service';

@Component({
  selector: 'app-gestion-productos',
  templateUrl: './gestion-productos.page.html',
  styleUrls: ['./gestion-productos.page.scss'],
})
export class GestionProductosPage implements OnInit {

  @ViewChild('modal') modal: HTMLIonModalElement;

  productos: Producto[] = [];
  producto: Producto = null;
  productoOriginal: Producto = null;
  
  modoEdicion: boolean = false;
  aplicarDescuento: boolean = false;
  descuento: number | null = null;

  constructor(private firestore: FirestoreService, private menuCtrl: MenuController, private modalCtrl: ModalController, private actionSheetCtrl: ActionSheetController, private alertController: AlertController, private toast: InteractionService, private loadingCtrl: LoadingController, private firestorage: FirestorageService) { }

  ngOnInit() {
    this.obtenerProductos();
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
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
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: { producto : producto}
    });
    return await modal.present();
  }

  async presentActionSheet(producto: Producto) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            this.confirmarBorrar(producto);
          }
        },
        {
          text: 'Editar',
          handler: async () => {
            this.edidtarProducto(producto);
          }
        },      
        {
          text: 'Cancelar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  async confirmarBorrar(producto: Producto) {
    const confirmacion = await this.alertController.create({
      header: 'Eliminar producto',
      subHeader: '¿Estás seguro de eliminar el producto?',
      message: 'Esta acción no se puede deshacer.',
      cssClass: 'alert-gestion-productos',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.toast.presentToast('Acción cancelada', 1000);
          }
        },
        {
          text: 'Eliminar',
          handler: async () => {
            this.borrarProducto(producto);
          }
        }
      ]
    });
    await confirmacion.present();
  }

  async borrarProducto(producto: Producto) {
    const loading = await this.showLoading('Eliminando producto...');

    try {
      const id = producto.id;
      const path = `Productos`;
      
      await this.firestore.deleteDoc<Producto>(path, id).then(() => {
        this.toast.presentToast("Producto eliminado", 1000);
      }).catch((error) => {
        console.log(error);
        this.toast.presentToast("Error al eliminar el producto", 1000);
      });
    } catch (error) {
      console.log(error);
      this.toast.presentToast("Error al eliminar el producto", 1000);
    } finally {
      this.obtenerProductos();
      loading.dismiss();
    }
  }

  async showLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
    });
    loading.present();
    return loading;
  }

  async edidtarProducto(producto: Producto) {
    this.productoOriginal = { ...producto };

    await this.modalCtrl.create({ 
      component: this.modal.component, 
      componentProps: {
        modoEdicion: this.modoEdicion = true,
        producto: this.producto = producto,
        descuento: this.aplicarDescuento = producto.descuento.activo,
        precioDescuento: this.descuento = producto.descuento.precio,                
       } 
    });
    
    await this.modal.present();
  }

  onCheckboxChange(): void {
    if (!this.aplicarDescuento) {
      this.descuento = null;
    }
  }

  async handleImageChange($event: any) {
    const path = `Productos de padel`;
    const file = $event.target.files[0];
    const nombre = file.name;

    const res = await this.firestorage.uploadImage(file, path, nombre);
    this.producto.img = res;
  }

  cerrarModal() {
    if (this.modoEdicion) {
      Object.assign(this.producto, this.productoOriginal);
    }

    this.modalCtrl.dismiss().then(() => {
      this.modoEdicion ? (this.modoEdicion = false) : null;

      this.producto = { id: null, titulo: null, desc: null, precio: null, unidades: null, img: null, descuento: { activo: false, precio: null} };      
  
      this.aplicarDescuento = false;
      this.descuento = null;
    });
  }

  agregarProducto() {

  }

  guardarCambios(producto: Producto) {

  }

}