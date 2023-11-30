import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pista } from 'src/app/models/pista.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-pistas',
  templateUrl: './pistas.page.html',
  styleUrls: ['./pistas.page.scss'],
})
export class PistasPage implements OnInit {

  pistas: Pista[] = [];

  constructor(private toast: InteractionService, private router: Router, private firestore: FirestoreService) { }

  ngOnInit() {
    this.obtenerPistas();
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

  async navegarHorarios(pista: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/horarios'], { queryParams: { pista: pista } });
    }, 500);
  }

}
