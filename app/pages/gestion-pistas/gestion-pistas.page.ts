import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Pista } from 'src/app/models/pista.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-gestion-pistas',
  templateUrl: './gestion-pistas.page.html',
  styleUrls: ['./gestion-pistas.page.scss'],
})
export class GestionPistasPage implements OnInit {

  pistas: Pista[] = [];

  constructor(private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private alertController: AlertController, private toast: InteractionService) { }

  ngOnInit() {
    this.obtenerPistas();
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
    const id = pista.id;
    const path = `Pistas/`;
    await this.firestore.deleteDoc<Pista>(path, id).then(() => {
      this.toast.presentToast("Pista borrada", 1000);
      this.obtenerPistas();
    }).catch(error => {
      console.log(error);
      this.toast.presentToast("Error al borrar la pista", 1000);
    });
  }

  ultimaCard(pista: Pista): boolean {
    const index = this.pistas.indexOf(pista);
    return index === this.pistas.length - 1;
  }

}
