import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, MenuController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.page.html',
  styleUrls: ['./editar-usuario.page.scss'],
})
export class EditarUsuarioPage implements OnInit {

  usuario: string = null;
  public usuario$: Observable<User>;

  constructor(private menuCtrl: MenuController, private route: ActivatedRoute, private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private auth: AuthService, private toast: InteractionService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.usuario = params['usuario'];
    });
    this.obtenerUsuario();
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
  }

  async obtenerUsuario() {
    const path = `Usuarios`;
    this.usuario$ = this.firestore.getDoc<User>(path, this.usuario);
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            console.log('Borrar Cuenta clicked');
          }
        },
        {
          text: 'Inhabilitar',
          handler: () => {
            this.inhabilitarCuenta(this.usuario);
          }
        },
        {
          text: 'Restablecer Contraseña',
          handler: () => {
            console.log('Restablecer');
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

  async inhabilitarCuenta(uid: string) {
    console.log("Uid: " + uid);
    try {
      const response = await this.auth.disableUser(uid);
      if (response == true) {
        this.toast.presentToast("Cuenta inhabilitada exitosamente.", 1500);
      } else {
        this.toast.presentToast("Error al inhabilitar la cuenta.", 1500);
      }
    } catch (error) {
      console.error('Error al inhabilitar la cuenta:', error);
      this.toast.presentToast("Error al inhabilitar la cuenta.", 1500);
    }
  }

}
