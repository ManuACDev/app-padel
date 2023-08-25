import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { InteractionService } from 'src/app/services/interaction.service';
import { getAuth, updateEmail } from "firebase/auth";
import { Reserva } from 'src/app/models/reserva.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  uid: string = null;
  datosUser: User = null;
  min: string = null;
  pistas: string[] = ['Pista1', 'Pista2'];

  constructor(private menuCtrl: MenuController, private auth: AuthService, private firestore: FirestoreService, private alertController: AlertController, private toast: InteractionService) {}

  ngOnInit() {
    this.auth.stateUser().subscribe( res => {
      this.getId();
    })
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
            this.guardarCampo(this.min, data[this.min]);
            if (this.min == "correo") {
              this.actualizarEmail(data[this.min]);
            }
            else if (this.min = "dni") {
              this.actualizarDni(data[this.min])
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

  async actualizarEmail(correo:string) {
    const auth = getAuth();
    updateEmail(auth.currentUser, correo).then(() => {
      console.log("Correo actualizado")
    }).catch((error) => {
      console.log('Error ->', error);
    })
  }

  async actualizarDni(dni:string) {
    const id = this.uid;
    const pistas = this.pistas;

    for (let i = 0; i < pistas.length; i++) {
      const path = `Pistas/${pistas[i]}/Reservas`;
      const reservas = await this.firestore.getCollectionId<Reserva>(id, path);
      reservas.subscribe(data => {
        data.forEach((doc) => {
          const reserva = doc.data() as Reserva;
          const id = reserva.id;
          this.firestore.updateDoc(path, id, { dni: dni });
        });
      });
    }
  }

}
