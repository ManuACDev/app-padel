import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.page.html',
  styleUrls: ['./loader.page.scss'],
})
export class LoaderPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    const valor = localStorage.getItem('sesionActiva');
    setTimeout(() => {
      this.autoLogin(valor);
    }, 1000);
  }

  async autoLogin(valor: string) {
    if (valor == 'true') {
      this.router.navigate(['home'], { replaceUrl: true });
    } else if (valor == 'false') {
      this.router.navigate(['login'], { replaceUrl: true });
    } else {
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }

}
