import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, LoadingController, MenuController } from '@ionic/angular';
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

  constructor(private menuCtrl: MenuController, private route: ActivatedRoute, private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private auth: AuthService, private toast: InteractionService, private loadingCtrl: LoadingController) { }

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

  async presentActionSheet(usuario: User) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar Usuario',
          role: 'destructive',
          handler: () => {
            console.log('Borrar Cuenta clicked');
          }
        },
        {
          text: usuario.disabled ? 'Habilitar Cuenta' : 'Inhabilitar Cuenta',
          handler: () => {
            this.estadoCuenta(usuario);
          }
        },
        {
          text: 'Restablecer Contraseña',
          handler: () => {
            this.changePassword(usuario);
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

  async estadoCuenta(usuario: User) {
    const loading = await this.showLoading('Gestionando usuario...');
    try {
      const response = await this.auth.stateUserAccount(usuario.uid, usuario.disabled);
      if (response == true) {
        try {
          const id = usuario.uid;
          const path = 'Usuarios';
          const estado = usuario.disabled;

          if (estado) {
            usuario.disabled = false;
          } else {
            usuario.disabled = true;
          }

          await this.firestore.updateDoc(path, id, {disabled: usuario.disabled}).then(() => {
            if (usuario.disabled) {
              this.toast.presentToast("Cuenta inhabilitada exitosamente.", 1000);
            } else {
              this.toast.presentToast("Cuenta habilitada exitosamente.", 1000);
            }
          }).catch(error => {
            console.log(error);
            this.toast.presentToast("Error al cambiar el estado de la cuenta.", 1000);
          });          
        } catch (error) {
          console.error('Error al inhabilitar la cuenta:', error);
          this.toast.presentToast("Error al cambiar el estado de la cuenta.", 1000);
        }
      } else {
        this.toast.presentToast("Error al cambiar el estado de la cuenta.", 1000);
      }
    } catch (error) {
      console.error('Error al cambiar el estado de la cuenta:', error);
      this.toast.presentToast("Error al cambiar el estado de la cuenta.", 1000);
    } finally {
      loading.dismiss();
    }
  }

  async changePassword(usuario: User) {
    const loading = await this.showLoading('Enviando correo...');
    try {
      const correo = usuario.correo;
      await this.auth.resetPassword(correo);
      this.toast.presentToast("Correo enviado. Consultar la bandeja de entrada", 1500);
    } catch (error) {
      this.toast.presentToast("Error al enviar correo. Verifica la dirección.", 1500);
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

}
