import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { InteractionService } from 'src/app/services/interaction.service';
import { getAuth, updateEmail } from "firebase/auth";
import { Reserva } from 'src/app/models/reserva.model';
import { Router } from '@angular/router';
import { Pista } from 'src/app/models/pista.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  uid: string = null;
  datosUser: User = null;
  min: string = null;
  pistas: Pista[] = [];

  constructor(private menuCtrl: MenuController, private auth: AuthService, private firestore: FirestoreService, private alertController: AlertController, private toast: InteractionService, private router: Router) {}

  ngOnInit() {
    this.auth.stateUser().subscribe(() => {
      this.getId();
    });
    this.obtenerPistas();
  }

  ionViewDidLeave() {
    this.menuCtrl.enable(true); // Habilita el menu cuando sales del componente
    this.menuCtrl.open(); // Abre el menu automáticamente al volver al home
  }

  async getId() {
    const uid = await this.auth.getUid();
    if (uid) {
      this.uid = uid;
      this.getDatosUser(uid);
    } else {
      console.log("No existe uid");
    }
  }

  getDatosUser(uid: string) {
    const path = 'Usuarios';
    const id = uid;
    this.firestore.getDoc<User>(path, id).subscribe( res => {
      if (res) {
        this.datosUser = res;
      }
    })
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

  async editarDatos(campo: string) {
  this.min = campo.toLocaleLowerCase();
    const alert = await this.alertController.create({
      header: 'Editar ' + campo,
      inputs: [
        {
          name: this.min,
          type: 'text',
          value: this.datosUser[campo]
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (this.min == "correo") {
              this.actualizarEmail(this.min, data[this.min]);
            } else if (this.min = "dni") {
              this.actualizarDni(this.min, data[this.min])
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async guardarCampo(campo:string, input: any) {
    await this.toast.presentToast('Actualizando...',1000);
    const path = 'Usuarios';
    const id = this.uid;
    const updateDoc = {};
    updateDoc[campo] = input;
    this.firestore.updateDoc(path, id, updateDoc).then( () => {
      this.toast.presentToast('Campo actualizado', 1000)
    }).catch((error) => {
      console.log(error);
      this.toast.presentToast('Error al actualizar el campo', 1000)
    })
  }

  async actualizarEmail(campo:string, correo:string) {
    const auth = getAuth();
    updateEmail(auth.currentUser, correo).then(() => {
      this.guardarCampo(campo, correo);
      this.auth.sendVerificationEmail();
      localStorage.setItem('sesionActiva', 'false');
      this.toast.presentToast('Cargando...', 1000);
      this.router.navigate(['verificacion-email'], { queryParams: { perfil: true } });
    }).catch((error) => {
      if (error.code == "auth/email-already-in-use") {
        this.toast.presentToast("Ya existe un usuario con ese correo electrónico.", 1500);;
      } else if (error.code == "auth/requires-recent-login") {
        this.toast.presentToast("Por razones de seguridad, es necesario una sesión reciente para actualizar el correo.", 1500);
      } else {
        this.toast.presentToast("Error al actualizar el correo electrónico.", 1500); 
      }
    })
  }

  async actualizarDni(campo:string, dni:string) {
    const updatePromises: Promise<void>[] = [];
    const id = this.uid;
    const pistas = this.pistas;

    for (const pista of pistas) {
      const path = `Pistas/${pista.id}/Reservas`;
      const reservas = await this.firestore.getCollectionId<Reserva>(id, path);
      reservas.subscribe(data => {
        data.forEach((doc) => {
          const reserva = doc.data() as Reserva;
          const id = reserva.id;
          const updatePromise = this.firestore.updateDoc(path, id, { dni: dni });
          updatePromises.push(updatePromise);
        });
      });
    }

    try {
      await Promise.all(updatePromises);
      this.guardarCampo(campo, dni);
    } catch (error) {
      this.toast.presentToast("Error al actualizar el dni.", 1500);
    }
  }

}
