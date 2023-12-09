import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-verificacion-email',
  templateUrl: './verificacion-email.page.html',
  styleUrls: ['./verificacion-email.page.scss'],
})
export class VerificacionEmailPage implements OnInit {

  public usuario$:Observable<any> = this.auth.afAuth.user;

  public usuario;
  public emailVerificado = false;
  esRegistro: boolean = true;

  constructor(private auth:AuthService,  private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    //this.estadoEmailVerificacion();
    this.auth.afAuth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        // El correo electrónico está verificado, redirige al usuario a la página de inicio.
        this.router.navigate(['home']);
      }
    });
    this.route.queryParams.subscribe(params => {
      this.esRegistro = params['registro'] === 'true';
    });
  }

  async enviarEmailVerificacion() {
    try {
      const result = await this.auth.sendVerificationEmail();
      return result;
    } catch (error) {
      return error;
    }
  }
  
  /*
  estadoEmailVerificacion() {
    const intervalId = setInterval(() => {
      console.log("Bucle");
      this.auth.stateUser().subscribe((user) => {
        if (user) {
          console.log("Usuario autenticado");
          console.log("Antes ->", user.emailVerified);
          if (user.emailVerified) {
            console.log("Correo electrónico verificado");
            clearInterval(intervalId);
            this.router.navigate(['home']);
          }
        }
      });
    }, 2000);
  }

  estadoEmailVerificacion() {
    this.auth.afAuth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Usuario autenticado");
        console.log("Antes ->", user.emailVerified);
        if (user.emailVerified) {
          console.log("Correo electrónico verificado");
          this.router.navigate(['home']);
        }
      }
    });
  }*/

  estadoEmailVerificacion() {
    console.log("Botón");
    this.auth.afAuth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        console.log("Botón -> ", user.emailVerified);
        // El correo electrónico está verificado, redirige al usuario a la página de inicio.
        this.router.navigate(['home']);
      }
    });
  }

  reloadApp() {
    // Recargar la aplicación.
    location.reload();
  }
  
  navigateToLogin() {
    this.router.navigateByUrl('/login');
  }

}
