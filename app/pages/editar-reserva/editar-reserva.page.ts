import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-editar-reserva',
  templateUrl: './editar-reserva.page.html',
  styleUrls: ['./editar-reserva.page.scss'],
})
export class EditarReservaPage implements OnInit {

  id: string = null;
  reserva: Reserva = null;
  pistas: Pista[] = [];

  constructor(private route: ActivatedRoute, private firestore: FirestoreService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.id = params['reserva'];
    });
    this.obtenerPistas();
    setTimeout(() => {
      this.obtenerReserva();
    }, 600);
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data;
    });
  }

  async obtenerReserva() {    

    for (const pista of this.pistas) {
      const path = `Pistas/${pista.id}/Reservas`;
      const reserva = await this.firestore.getDoc<Reserva>(path, this.id);

      reserva.subscribe(reserva => {
        this.reserva = reserva;
      });
    }
  }

}
