import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-gestion-reservas',
  templateUrl: './gestion-reservas.page.html',
  styleUrls: ['./gestion-reservas.page.scss'],
})
export class GestionReservasPage implements OnInit {

  pistas: Pista[] = [];
  reservas: Reserva[] = [];
  results: Reserva[] = [];

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService) { }

  ngOnInit() {
    this.obtenerPistas();
    setTimeout(() => {
      this.obtenerReservas();
    }, 600);
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data;
    });
  }
  
  async obtenerReservas() {    

    for (const pista of this.pistas) {
      const path = `Pistas/${pista.id}/Reservas`;
      const reservas = await this.firestore.getCollection<Reserva>(path);

      reservas.subscribe(data => {
        data.forEach((doc) => {
          const reserva = doc;
          this.reservas.push(reserva);
          this.results.push(reserva);
        });
      });
    }
  }

  searchReserva(event) {
    const query = event.target.value;
    if (query.trim() !== '') {
      this.results = this.reservas.filter(reserva => {
        return Object.values(reserva).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          return false;
        });
      });
    } else {
      this.results = this.reservas;
    }    
  }

}
