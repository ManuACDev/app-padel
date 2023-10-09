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
      const res = await this.auth.login(this.credenciales.correo, this.credenciales.password).catch( error => {
      this.toast.presentToast("El correo o la contraseña son incorrectos", 1500);
      })
      if (res) {
        this.toast.presentToast("Iniciando sesión", 1500);
        this.router.navigate(['home']);
      }
    }
  }

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }

}
