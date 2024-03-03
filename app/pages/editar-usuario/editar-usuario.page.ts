import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, LoadingController, MenuController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
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

  uid: string = null;
  perfil: string = null;
  pistas: Pista[] = [];
  reservas: Reserva[] = [];
  public usuario$: Observable<User>;

  constructor(private menuCtrl: MenuController, private route: ActivatedRoute, private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private auth: AuthService, private toast: InteractionService, private loadingCtrl: LoadingController, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.uid = params['usuario'];
    });
    this.obtenerUsuario();
    this.obtenerPistas();
    setTimeout(() => {
      this.obtenerReservasUsuario();
    }, 600);
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
  }

  async obtenerUsuario() {
    const path = `Usuarios`;
    this.usuario$ = this.firestore.getDoc<User>(path, this.uid);    
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data; 
    });
  }

  async obtenerReservasUsuario() {    
    const id = this.uid;

    for (const pista of this.pistas) {
      const path = `Pistas/${pista.id}/Reservas`;
      const reservas = await this.firestore.getCollectionId<Reserva>(id, path);

      reservas.subscribe(data => {
        data.forEach((doc) => {
          const reserva = doc.data() as Reserva;
          this.reservas.push(reserva);
        });
      });
    }
  }

  async presentActionSheet(usuario: User) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarUsuario(usuario);
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

  async eliminarUsuario(usuario: User) {    
    const loading = await this.showLoading('Eliminando usuario...');
    try {
      this.perfil = usuario.perfil;
      if (this.perfil == "admin") {
        this.toast.presentToast("Para eliminar un usuario con perfil de administrador, primero debes cambiar su perfil.", 2500);
      } else if (this.reservas.length != 0) {
        this.toast.presentToast("No se puede eliminar el usuario porque tiene reservas activas.", 1500);
      } 
      else {
        const response = await this.auth.deleteUser(usuario.uid);
        if (response == true) {
          try {
            const id = usuario.uid;
            const path = 'Usuarios';

            await this.firestore.deleteDoc(path, id).then(() => {
              this.navegarComponente('gestion-usuarios');
              this.toast.presentToast("Usuario eliminado correctamente.", 1000);
            }).catch(error => {
              console.error('Error al eliminar el usuario:', error);
              this.toast.presentToast("Error al eliminar el usuario.", 1000);
            });
          } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            this.toast.presentToast("Error al eliminar el usuario.", 1000);
          }
        } else {
          this.toast.presentToast("Error al eliminar el usuario.", 1000);
        }
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      this.toast.presentToast("Error al eliminar el usuario.", 1000);
    } finally {
      loading.dismiss();
    }
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

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }

}
