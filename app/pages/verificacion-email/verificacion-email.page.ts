import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-verificacion-email',
  templateUrl: './verificacion-email.page.html',
  styleUrls: ['./verificacion-email.page.scss'],
})
export class VerificacionEmailPage implements OnInit {

  public usuario$:Observable<any> = this.auth.afAuth.user;

  constructor(private auth:AuthService) { }

  ngOnInit() {
  }

  enviarEmailVerificacion() {
    this.auth.sendVerificationEmail();
  }

}
