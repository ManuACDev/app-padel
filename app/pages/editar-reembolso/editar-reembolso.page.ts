import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { Reembolso } from 'src/app/models/reembolso.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-editar-reembolso',
  templateUrl: './editar-reembolso.page.html',
  styleUrls: ['./editar-reembolso.page.scss'],
})
export class EditarReembolsoPage implements OnInit {

  reembolso: Reembolso = null;

  constructor(private route: ActivatedRoute, private actionSheetCtrl: ActionSheetController, private toast: InteractionService, private router: Router, private loadingCtrl: LoadingController, private firestore: FirestoreService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.reembolso = JSON.parse(params['reembolso']);
    });
  }

  async presentActionSheet(reembolso: Reembolso) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.borrarReembolso(reembolso);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
  
    await actionSheet.present();
  }

  async borrarReembolso(reembolso: Reembolso) {
    const loading = await this.showLoading('Elimninando recibo...');
      try {
        const id = reembolso.id;
        const path = `Reembolsos`;
  
        await this.firestore.deleteDoc<Reembolso>(path, id).then(async () => {
          this.navegarComponente('gestion-reembolsos');
          this.toast.presentToast("Reembolso eliminado correctamente.", 1000);
        }).catch(error => {
          console.error(error);
          this.toast.presentToast("Error al eliminar el reembolso.", 1000);
        });
      } catch (error) {
        console.error(error);
        this.toast.presentToast("Error al eliminar el reembolso.", 1000);
      } finally {
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

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }

}
