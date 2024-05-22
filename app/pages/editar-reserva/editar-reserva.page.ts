import { formatDate } from '@angular/common';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, LoadingController, ModalController } from '@ionic/angular';
import { map } from 'rxjs';
import { Pago } from 'src/app/models/pago.model';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { StripeService } from 'src/app/services/stripe.service';

@Component({
  selector: 'app-editar-reserva',
  templateUrl: './editar-reserva.page.html',
  styleUrls: ['./editar-reserva.page.scss'],
})
export class EditarReservaPage implements OnInit {

  @ViewChild('modal') modal: HTMLIonModalElement;

  uid: string = null;
  usuario: User =  null;
  reserva: Reserva = null;
  pistas: Pista[] = [];
  pago: Pago = null;
  reservaOriginal: Reserva = null;
  fechasDisponibles: string[] = [];
  horas: string[] = [];
  horasDisponibles: string[] = [];
  horasNoDisponibles: string[] = [];

  constructor(private route: ActivatedRoute, private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private toast: InteractionService, private router: Router, private loadingCtrl: LoadingController, private stripeService: StripeService, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.uid = params['usuario']; 
      this.reserva = JSON.parse(params['reserva']);
      this.reservaOriginal = JSON.parse(params['reserva']);
    });
    this.obtenerUsuario();
    this.obtenerPistas();
    this.obtenerPago();
    this.fechasDisponibles = this.obtenerFechas(this.reserva.fecha);
    this.obtenerHoras();
    this.obtenerReservas(this.reserva.fecha);
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data;
    });
  }

  async obtenerUsuario() {
    const path = `Usuarios`;
    const usuario = this.firestore.getDoc<User>(path, this.uid);    
    
    usuario.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  async obtenerPago() {
    const path = `Pagos`;
    const pago = this.firestore.getDoc<Pago>(path, this.reserva.paymentDoc);

    pago.subscribe(pago => {
      this.pago = pago;
    });
  }

  cerrarModal() {
    this.reserva = JSON.parse(JSON.stringify(this.reservaOriginal));
    this.modalCtrl.dismiss();
  }

  async guardarCambios(reserva: Reserva) {
    if (!reserva.pista || !reserva.fecha || !reserva.hora) {
      this.toast.presentToast("Todos los campos son obligatorios", 1500);
    } else if (reserva.pista == this.reservaOriginal.pista && reserva.fecha == this.reservaOriginal.fecha && reserva.hora == this.reservaOriginal.hora) {
      this.toast.presentToast("No hay cambios para guardar.", 1500);
    } else {
      const loading = await this.showLoading('Guardando cambios...');
      try {
        const id = reserva.id;
        const pista = this.reserva.pista;
        const path = `Pistas/${pista}/Reservas`;

        await this.firestore.updateDoc(path, id , {fecha: reserva.fecha, hora: reserva.hora}).then(() => {
          this.actualizarReserva(reserva).then(() => {
            this.cerrarModal();
            this.toast.presentToast("Reserva editada", 1000);
          })
        }).catch(error => {
          console.log(error);
          this.toast.presentToast("Error al editar la reserva", 1000);
        });
      } catch (error) {
        console.log(error);
        this.toast.presentToast("Error al editar la reserva", 1000);
      } finally {
        loading.dismiss();
      }
    }
  }

  async actualizarReserva(reserva: Reserva) {
    const id = reserva.id;
    const pista = reserva.pista;
    const path = `Pistas/${pista}/Reservas`;

    await this.firestore.getDoc<Reserva>(path, id).subscribe(reserva => {
      this.reservaOriginal = reserva;
      this.reserva = reserva;
    });    
  }

  async presentActionSheet(reserva: Reserva, pago: Pago) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.borrarReserva(reserva);
          }
        },
        {
          text: 'Reembolsar',
          handler: () => {
            this.reembolsarReserva(reserva, pago);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
  
    await actionSheet.present();
  }

  obtenerFechas(fechaReserva: string): string[] {
    const partesFecha = fechaReserva.split('/');
    const dia = parseInt(partesFecha[0], 10);
    const mes = parseInt(partesFecha[1], 10) - 1;
    const año = parseInt(partesFecha[2], 10);
    
    const fechaReservaDate = new Date(año, mes, dia);

    this.fechasDisponibles = [];
    this.fechasDisponibles.push(this.formatearFecha(fechaReservaDate));

    for (let i = 1; i <= 2; i++) {
        const fechaSiguiente = new Date(año, mes, dia + i);
        this.fechasDisponibles.push(this.formatearFecha(fechaSiguiente));
    }

    return this.fechasDisponibles;
  }
  
  formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  async obtenerHoras() {
    const path = 'Pistas';
    const pistaId = this.reserva.pista;
    this.firestore.getDoc<Pista>(path, pistaId).subscribe(pista => {
      if (pista && pista.horas) {
        this.horas = pista.horas;
      }
    });
  }

  async obtenerReservas(event: any) {
    const fechaSeleccionada: string = event;

    const pista = this.reserva.pista;
    const path = `Pistas/${pista}/Reservas`;
    
    const reservas = await this.firestore.getCollection<Reserva>(path);
    const reservasFiltradas = reservas.pipe(
      map(reservas => reservas.filter(reserva => reserva.fecha == fechaSeleccionada))
    );

    reservasFiltradas.subscribe(data => { 
      this.horasNoDisponibles = [];
      data.forEach(reserva => {
        this.horasNoDisponibles.push(reserva.hora);
      });
    });

    const pathPista = `Pistas`;
    this.firestore.getDoc<Pista>(pathPista, pista).subscribe(pista => {
      if (pista && pista.horas) {
        const indiceReserva = this.horasNoDisponibles.indexOf(this.reserva.hora);
        if (indiceReserva !== -1) {
          this.horasNoDisponibles.splice(indiceReserva, 1);
        }

        this.horasDisponibles = pista.horas.filter(hora => !this.horasNoDisponibles.includes(hora));
        if (!this.horasDisponibles.includes(this.reserva.hora)) {
          this.horasDisponibles.push(this.reserva.hora);
        }
      }
    });
  }
  
  async borrarReserva(reserva: Reserva) {
    const loading = await this.showLoading('Cancelando reserva...');
    try {
      const id = reserva.id;
      const path = `Pistas/${reserva.pista}/Reservas`;

      await this.firestore.deleteDoc<Reserva>(path, id).then(async () => {
        const path = `Pagos`;
        const id = this.reserva.paymentDoc;

        await this.firestore.updateDoc<Pago>(path, id, {active: false}).then(() => {
          this.navegarComponente('gestion-reservas');
          this.toast.presentToast("Reserva cancelada correctamente.", 1000);
        }).catch(error => {
          console.error(error);
          this.toast.presentToast("Error al desvincular el pago", 1000);
        });
      }).catch(error => {
        console.error(error);
        this.toast.presentToast("Error al cancelar la reserva", 1000);
      });
    } catch (error) {
      console.error(error);
      this.toast.presentToast("Error al cancelar la reserva", 1000);
    } finally {
      loading.dismiss();
    }
  }

  async reembolsarReserva(reserva: Reserva, pago: Pago) {
    const loading = await this.showLoading('Reembolsando reserva...');
    try {
      const fecha = new Date();
      const fechaFormateada = formatDate(fecha, 'dd/MM/yyyy', 'en-US');
      
      const response = await this.stripeService.refund(pago.paymentIntentId, reserva.uid, fechaFormateada);
      
      if (response == true) {
        const id = reserva.id;
        const path = `Pistas/${reserva.pista}/Reservas`;

        await this.firestore.deleteDoc<Reserva>(path, id).then(async () => {
          const path = `Pagos`;
          const id = this.reserva.paymentDoc;

          await this.firestore.deleteDoc<Pago>(path, id).then(() => {
            this.navegarComponente('gestion-reservas');
            this.toast.presentToast("Pago reembolsado correctamente", 1000);
          }).catch(error => {
            console.error(error);
            this.toast.presentToast("Error al reembolsar el pago", 1000);
          });
        }).catch(error => {
          console.error(error);
          this.toast.presentToast("Error al reembolsar el pago", 1000);
        });
      } else {
        loading.dismiss();
        this.toast.presentToast("Error al reembolsar el pago", 1000); 
      }
    } catch (error) {
      console.error(error);
      this.toast.presentToast("Error al reembolsar el pago", 1000);
    } finally {
      loading.dismiss();
    }
  }

  async showLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
    });
    loading.present();
    return loading;
  }

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }
}
