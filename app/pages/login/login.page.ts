import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { InteractionService } from 'src/app/services/interaction.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  credenciales = {
    correo: null,
    password: null
  }

  constructor(private auth: AuthService, private toast: InteractionService, private router: Router) { }

  ngOnInit() {
  }

  async login() {
    if (this.credenciales.correo == null || this.credenciales.password == null) {
      this.toast.presentToast("El correo y la contraseña son oblligatorios", 1500);
    } else {
        this.toast.presentToast("Cargando...", 1500);
        this.auth.login(this.credenciales.correo, this.credenciales.password).then((res) => {
          if (res && res.user) {
            if (res && res.user.emailVerified) {
              this.toast.presentToast("Iniciando sesión", 1500);
              this.router.navigate(['home']);
            } else if (res) {
              this.toast.presentToast("No has verificado la dirección de correo", 1500);
              this.router.navigate(['verificacion-email']);
            }
          } 
        }).catch(error => {
            if (error.code == "auth/wrong-password") {
              this.toast.presentToast("La contraseña es incorrecta", 1500);;
            } else if (error.code == "auth/user-not-found") {
              this.toast.presentToast("No existe el usuario", 1500);
              this.router.navigate(['registro']);
            } else if (error.code == "auth/user-disabled") {
              this.toast.presentToast("Tu cuenta está deshabilitada. Por favor, contacta al soporte para más información.", 1500);
            } else if (error.code == "auth/too-many-requests") {
              this.toast.presentToast("Demasiados intentos fallidos. Por favor, espera antes de intentarlo de nuevo.", 1500);
            } else {
              this.toast.presentToast("Error al iniciar sesión.", 1500); 
            }
        });                     
    }
  }

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }

}
