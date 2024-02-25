import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  datos: User = {
    nombre: null,
    dni:null,
    correo:null,
    uid:null,
    password: null,
    perfil: 'usuario',
    disabled: false
  }

  password2: string = null;

  constructor(private auth:AuthService, private firestore: FirestoreService, private toast: InteractionService, private router: Router) { }

  ngOnInit() {
  }

  async register() {
    if (this.datos == null || this.password2 == null) {
      this.toast.presentToast("Todos los campos son obligatorios", 1500);
    } else {
      if (this.datos.password.length >= 8) {
        if (this.datos.password === this.password2) {
          this.toast.presentToast("Cargando...", 1500);
          this.auth.registerUser(this.datos).then(async (res) => {
            if (res) {
              const path = 'Usuarios';
              const id = res.user.uid;
              this.datos.uid = id;
              this.datos.password = null;
              await this.firestore.createDoc(this.datos, path, id);
              this.toast.presentToast("Registrado con éxito", 1500);
              this.router.navigate(['verificacion-email'], { queryParams: { registro: true } });
            }
          }).catch( error => {
            if (error.code == "auth/email-already-in-use") {
              this.toast.presentToast("Ya existe un usuario registrado", 1500)
            } else {
              this.toast.presentToast("Error al registrar el usuario", 1500)
            }
          });
        } else {
          this.toast.presentToast("Las contraseñas no coinciden", 1500);
        }
      } else {
        this.toast.presentToast("La contraseña debe tener al menos 8 caracteres", 1500);
      }
    }
  }

}
