import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-pistas',
  templateUrl: './pistas.page.html',
  styleUrls: ['./pistas.page.scss'],
})
export class PistasPage implements OnInit {

  constructor(private toast: InteractionService, private router: Router) { }

  ngOnInit() {
  }

  async navegarHorarios(pista: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/horarios'], { queryParams: { pista: pista } });
    }, 500);
  }

}
