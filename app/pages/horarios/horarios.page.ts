import { Component, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom, forkJoin, map, tap } from 'rxjs';
import { formatDate } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Pista } from 'src/app/models/pista.model';
import { Bloqueo } from 'src/app/models/bloqueo.model';

@Component({
  selector: 'app-horarios',
  templateUrl: './horarios.page.html',
  styleUrls: ['./horarios.page.scss'],
})
export class HorariosPage implements OnInit {

  horas = [];

  showMore = false;
  fechaSeleccionada: string;

  pista: string;
  horasNoDisponibles: string[] = [];
  horasProceso: string[] = [];

  tiempoCarga: boolean = false;
  horaAceptada: boolean = false;
  bloqueo: Bloqueo = { id: null, uid: null, pista: null, fecha: null, hora: null, tiempo: null };

  uid: string = null;

  constructor(private toast: InteractionService, private firestore: FirestoreService, private route: ActivatedRoute, private alertController: AlertController, private router: Router, private auth: AuthService) { }

  ngOnInit() {
    this.fechaSeleccionada = null;
    this.route.queryParams.subscribe(params => {
      this.pista = params['pista'];
      console.log('Pista seleccionada: ', this.pista);
    });
    this.auth.stateUser().subscribe(res => {
      this.getId();
    });
    this.obtenerHoras();
  }

  ionViewWillEnter() {
    this.horaAceptada = false;
  }

  async getId() {
    const uid = await this.auth.getUid();
    if (uid) {
      this.uid = uid;      
    } else {
      console.log("No existe uid");
    }
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
    try {
      this.tiempoCarga = true;

      const fecha = new Date(fechaSeleccionada); 
      const fechaFormateada = formatDate(fecha, 'dd/MM/yyyy', 'en-US');

      const pista = this.pista;
      const path = 'Pistas/' + pista +'/Reservas';
    
      const reservas$ = this.firestore.getCollection<Reserva>(path).pipe(
        map(reservas => reservas.filter(reserva => reserva.fecha == fechaFormateada))
      );

      const pathBloq = `Pistas/${pista}/Bloqueados`;

      const bloqueos$ = this.firestore.getCollection<Bloqueo>(pathBloq).pipe(tap(data => {
        data.forEach(async (doc) => {
          const tiempoActual = Date.now();
          const unMin = (0.5 * 60 * 1000);
          const cincoMin = (5 * 60 * 1000);
  
          if (((tiempoActual - doc.tiempo) >= cincoMin) || (this.uid === doc.uid && (tiempoActual - doc.tiempo) >= unMin)) {
            const id = doc.id;
            await this.firestore.deleteDoc(pathBloq, id).catch(error => {
              console.log(error);
            });
          }
        });
      }), map(bloqueos => bloqueos.filter(bloqueo => bloqueo.fecha == fechaFormateada)));

      const [reservas, bloqueos] = await Promise.all([
        firstValueFrom(reservas$),
        firstValueFrom(bloqueos$)
      ]);
  
      this.horasNoDisponibles = [];
      reservas.forEach(reserva => {
        this.horasNoDisponibles.push(reserva.hora);
      });
  
      this.horasProceso = [];
      bloqueos.forEach(bloqueo => {
        this.horasProceso.push(bloqueo.hora);
      });        
    } catch (error) {
      console.log(error)
      this.toast.presentToast("Error al obtener las reservas.", 1000);
    } finally {
      this.tiempoCarga = false; // Se establece en false cuando se completan ambos observables o en caso de error
    }
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
    } else if (this.horasProceso.includes(hora)) {
      this.toast.presentToast('Esta hora está siendo reserva.', 2000);
      return;
    } else {
      const confirmacion = await this.alertController.create({
        header: 'Confirmar reserva',
        subHeader: 'Reservando la hora:',
        message: `${hora}`,
        cssClass: 'alert-horarios',
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
              this.horaAceptada = true;
              this.bloquearHora(this.pista, hora, this.fechaSeleccionada);
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

  async bloquearHora(pista: string, hora: string, fechaSeleccionada: string) {
    const path = `Pistas/${pista}/Bloqueados`;

    const fecha = new Date(fechaSeleccionada);
    const fechaFormateada = formatDate(fecha, 'dd/MM/yyyy', 'en-US');

    this.bloqueo = { id: null, uid: this.uid, pista: pista, fecha: fechaFormateada, hora: hora, tiempo: Date.now() };

    try {
      const bloq = await this.firestore.createCollv2(this.bloqueo, path);

      if (bloq !== null) {
        bloq.set({ id: bloq.id }, { merge: true });
        this.navegarComponente("pago", this.pista, hora, this.fechaSeleccionada, bloq.id);
      } else {
        this.toast.presentToast('Error al bloquear la hora', 1000);
      }
    } catch (error) {
      this.toast.presentToast('Error al bloquear la hora', 1000);
      console.log('Error al bloquear la hora: ', error);
    }
  }

  async navegarComponente(componente: string, pista: string, hora: string, fecha: string, bloqueo: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente], { queryParams: { pista: pista, hora: hora, fecha: fecha, bloqueo: bloqueo } });
    }, 500);
  }

}
