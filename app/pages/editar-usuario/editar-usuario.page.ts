import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, MenuController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.page.html',
  styleUrls: ['./editar-usuario.page.scss'],
})
export class EditarUsuarioPage implements OnInit {

  usuario: string = null;
  public usuario$: Observable<User>;

  constructor(private menuCtrl: MenuController, private route: ActivatedRoute, private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController) { }

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
            console.log('Inhabilitar');
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

}
