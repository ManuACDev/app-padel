import { Component, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { ActivatedRoute } from '@angular/router';
import { Subscription, map } from 'rxjs';
import { formatDate } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Pista } from 'src/app/models/pista.model';

@Component({
  selector: 'app-horarios',
  templateUrl: './horarios.page.html',
  styleUrls: ['./horarios.page.scss'],
})
export class HorariosPage implements OnInit {

  horas = [];

  showMore = false;
  fechaSeleccionada: string;
  uid: string;
  dni: string;

  datos: Reserva = {
    uid:null,
    dni:null,
    fecha:null,
    hora:null,
    pista:null,
    id:null
  }

  pista: string;
  horasNoDisponibles: string[] = [];

  constructor(private toast: InteractionService, private firestore: FirestoreService, private auth: AuthService, private route: ActivatedRoute, private alertController: AlertController, private router: Router) { }

  ngOnInit() {
    this.fechaSeleccionada = null;
    this.auth.stateUser().subscribe(res => {
      this.getId();
    });
    this.route.queryParams.subscribe(params => {
      this.pista = params['pista'];
      console.log('Pista seleccionada: ', this.pista);
    });
    this.obtenerHoras();
  }

  async getId() {
    const uid = await this.auth.getUid();
    if (uid) {
      this.uid = uid;
      this.getDatosUser(uid);
    } else {
      console.log("No existe uid");
    }
  }

  getDatosUser(uid: string) {
    const path = 'Usuarios';
    const id = uid;
    this.firestore.getDoc<User>(path, id).subscribe(res => {
      if (res) {
        this.dni = res.dni;
      }
    });
  }

  async obtenerHoras() {
    const path = 'Pistas';
    const pistaId = this.pista;
    this.firestore.getDoc<Pista>(path, pistaId).subscribe(pista => {
      if (pista && pista.horas) {
        this.horas = pista.horas;
      }
    });
  }

  async obtenerReservas(fechaSeleccionada: string) {
    const fecha = new Date(fechaSeleccionada); 
    const fechaFormateada = formatDate(fecha, 'dd/MM/yyyy', 'en-US');

    const pista = this.pista;
    const path = 'Pistas/' + pista +'/Reservas';
    
    const reservas = await this.firestore.getCollection<Reserva>(path);
    const reservasFiltradas = reservas.pipe(
      map(reservas => reservas.filter(reserva => reserva.fecha == fechaFormateada))
    );
    reservasFiltradas.subscribe(data => { 
      this.horasNoDisponibles = [];
      data.forEach(reserva => {
        this.horasNoDisponibles.push(reserva.hora);
      });
    });
  }

  /** Método creado 04/04/2023 */
  async reservarHora(hora: string) {
    const fecha = new Date(this.fechaSeleccionada);
    fecha.setHours(0, 0, 0, 0);

    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    if (this.fechaSeleccionada == null) {
      this.toast.presentToast("Seleccione día y hora para hacer su reserva",1000);
      return;
    } else if (fecha < fechaActual || this.horaPasada(hora)) {
      this.toast.presentToast('No se pueden reservar fechas anteriores a la actual', 3000);
      return;
    } else if (this.horasNoDisponibles.includes(hora)) {
      this.toast.presentToast('Esta hora ya ha sido reservada', 2000);
      return;
    } else {
      const confirmacion = await this.alertController.create({
        header: 'Confirmar reserva',
        message: `¿Desea reservar la hora ${hora}?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              this.toast.presentToast('Reserva cancelada', 1000);
            }
          },
          {
            text: 'Aceptar',
            handler: async () => {
              //await this.cambiarFecha(hora);
              this.navegarComponente("pago", this.pista);
            }
          }
        ]
      });
      await confirmacion.present();
    }
  }

  horaPasada(hora: string): boolean {
    const horaInicio = parseInt(hora.split(':')[0].trim());
    const horaActual = new Date().toLocaleTimeString('en-US', { hour12: false, hour: 'numeric' });
    const horaActualNum = parseInt(horaActual);

    const fecha = new Date(this.fechaSeleccionada); 
    const fechaSH = fecha.setHours(0, 0, 0, 0);
    const fechaActual = new Date();
    const fechaActualSH = fechaActual.setHours(0, 0, 0, 0);

    if (fechaSH == fechaActualSH) {
      return horaActualNum >= horaInicio;  
    } else if (fechaSH < fechaActualSH) {
      return true;
    } else {
      return false;
    }
  }

  cambiarFecha(horaSeleccionada) {
    if (horaSeleccionada != null && this.fechaSeleccionada != null) {
      const fecha = new Date(this.fechaSeleccionada);
      const fechaFormateada = formatDate(fecha, 'dd/MM/yyyy', 'en-US');

      if (fechaFormateada && horaSeleccionada) {
        this.guardarReserva(fechaFormateada, horaSeleccionada);          
      }
    } else {
      this.toast.presentToast("Seleccione día y hora para hacer su reserva",1000);
    }
  }

  async guardarReserva(fecha, hora) {
    const id = this.uid;
    const path = this.pista;

    this.datos = { uid: id, dni: this.dni, fecha: fecha, hora: hora, pista: this.pista, id: null };

    try {
      const doc = await this.firestore.createColl(this.datos, path);

      if (doc !== null) {
        this.toast.presentToast('Hora reservada', 1000);

        setTimeout(() => {
          this.toast.presentToast('Cargando...', 1000);
          this.router.navigate(['/pistas']);
          const docId = doc.id;
          doc.set({ id: docId }, { merge: true });
        }, 1500);
      } else {
        this.toast.presentToast('Error al reservar la hora', 1000);  
      }
    } catch (error) {
      this.toast.presentToast('Error al reservar la hora', 1000);
    }
  }

  async navegarComponente(componente: string, pista: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente], { queryParams: { pista: pista } });
    }, 500);
  }

}
