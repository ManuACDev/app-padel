import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  correo = null;

  constructor(private auth: AuthService, private toast: InteractionService, private router:Router) { }

  ngOnInit() {
  }
  
  async onReset() {
    try {
      const correo = this.correo;
      await this.auth.resetPassword(correo);
      this.toast.presentToast("Correo enviado. Consulta su bandeja de entrada", 1500);
      this.router.navigate(['login']);
    } catch (error) {
      this.toast.presentToast("Error al enviar correo. Verifica la dirección.", 1500);
    }
  }

}
