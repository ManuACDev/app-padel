import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, MenuController, ModalController } from '@ionic/angular';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-gestion-pistas',
  templateUrl: './gestion-pistas.page.html',
  styleUrls: ['./gestion-pistas.page.scss'],
})
export class GestionPistasPage implements OnInit {

  pistas: Pista[] = [];
  pista: Pista = {
    id: null,
    titulo:null,
    desc:null,
    img:null,
    horas: null,
    precio: null,
  }

  apertura: number = null;
  cierre: number = null;
  duracion: number = null;
  
  horasDisponibles: string[] = [];
  pistasIDs: number[] = [];

  constructor(private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private alertController: AlertController, private toast: InteractionService, private firestorage: FirestorageService, private modalController: ModalController, private menuCtrl: MenuController, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.obtenerPistas();
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      data.forEach((doc) => {
        this.pistas.push(doc);
      });
    });
  }

  async presentActionSheet(pista: Pista) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            this.confirmarBorrar(pista);
          }
        },
        {
          text: 'Editar',
          data: {
            action: 'share',
          },
        },
        {
          text: 'Clausular',
          data: {
            
          },
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

  async confirmarBorrar(pista: Pista) {
    const confirmacion = await this.alertController.create({
      header: 'Eliminar pista',
      subHeader: '¿Estás seguro de eliminar la pista?',
      message: 'Esta acción no se puede deshacer.',
      cssClass: 'alert-gestion-pistas',
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
            this.borrarPista(pista);
          }
        }
      ]
    });
    await confirmacion.present();
  }

  async borrarPista(pista:Pista) {
    const loading = await this.showLoading();

    try {
      const id = pista.id;
      const deletePromises: Promise<void>[] = [];

      const pathRes = `Pistas/${id}/Reservas`;
      const reservas = await this.firestore.getCollection<Reserva>(pathRes);
      
      reservas.subscribe(data => {
        data.forEach(async (doc) => {
          const reserva = doc as Reserva;
          const deletePromise = this.firestore.deleteDoc(pathRes, reserva.id).catch(error => {
            console.log(error);
          });
          deletePromises.push(deletePromise);
        });
      });

      await Promise.all(deletePromises).then(async () => {
        const path = `Pistas/`;
        await this.firestore.deleteDoc<Pista>(path, id).catch(error => {
          this.pistas = [];
          console.log(error);
          this.toast.presentToast("Error al borrar la pista", 1000);
        });
      });
    } catch (error) {
      console.log(error);
      this.toast.presentToast("Error al borrar la pista", 1000);
    } finally {
      this.obtenerPistas();
      loading.dismiss();
      this.toast.presentToast("Pista borrada", 1000);
    }
  }

  ultimaCard(pista: Pista): boolean {
    const index = this.pistas.indexOf(pista);
    return index === this.pistas.length - 1;
  }

  async agregarPista() {
    if (!this.pista.titulo || !this.pista.desc || !this.pista.precio || !this.pista.img || !this.apertura || !this.cierre || !this.duracion) {
      this.toast.presentToast("Todos los campos son obligatorios", 1500);
    } else {
        try {
          const id = await this.obtenerIDsPistas();
          this.pista.id = "Pista" + id;
          this.pista.horas = this.calcularHorasDisponibles(this.apertura, this.cierre, this.duracion);

          const path = 'Pistas';
          await this.firestore.createDoc(this.pista, path, this.pista.id).then(() => {
            this.toast.presentToast('Pista creada', 1000);
            this.pistas = [];
            this.cerrarModal();
          }).catch(error => {
            console.log(error);
            this.toast.presentToast('Error al crear la pista', 1000);
          });
        } catch (error) {
          console.log(error);
          this.toast.presentToast('Error al crear la pista', 1000);
        }
    }
  }

  calcularHorasDisponibles(apertura: number, cierre: number, duracionReserva: number) {
    const horasDisponibles: string[] = [];
  
    for (let hora = apertura; hora < cierre; hora += duracionReserva) {
      const horaFin = hora + duracionReserva;
      const rangoHorario = `${this.formatoHora(hora)} - ${this.formatoHora(horaFin)}`;
      horasDisponibles.push(rangoHorario);
    }
  
    return  horasDisponibles;
  }

  formatoHora(hora: number): string {
    const horas = Math.floor(hora);
    const minutos = (hora - horas) * 60;
    return `${horas < 10 ? '0' : ''}${horas}:${minutos === 0 ? '00' : minutos}`;
  }

  async handleImageChange($event: any) {
    const path = `Pistas de padel`;
    const file = $event.target.files[0];
    const nombre = file.name;

    const res = await this.firestorage.uploadImage(file, path, nombre);
    this.pista.img = res;
  }

  async obtenerIDsPistas() {    

    for(const pista of this.pistas) {
      const id = pista.id.replace("Pista", "");
      this.pistasIDs.push(parseInt(id));
    }

    this.pistasIDs.sort((a, b) => a - b);
    const ultimoId = this.pistasIDs[this.pistasIDs.length - 1];
    const nuevoId = ultimoId + 1;
    
    return nuevoId;
  }

  cerrarModal() {
    this.modalController.dismiss();

    this.pista = { id: null, titulo: null, desc: null, img: null, horas: null, precio: null };

    this.apertura = null;
    this.cierre = null;
    this.duracion = null;
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando pistas...',
    });
    loading.present();
    return loading;
  }
}
