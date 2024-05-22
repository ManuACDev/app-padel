import { formatDate } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs/internal/Observable';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { StripeService } from 'src/app/services/stripe.service';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
})
export class PagoPage implements AfterViewInit, OnDestroy {

  @ViewChild('cardInfo') cardInfo:  ElementRef;
  cardError: string;
  card: any;
  pista: string;
  precio: number;

  public pista$:Observable<Pista>;

  uid: string;
  dni: string;

  datos: Reserva = {
    uid:null,
    dni:null,
    fecha:null,
    hora:null,
    pista:null,
    id:null,
    paymentDoc:null
  }

  hora: string;
  fechaSeleccionada: string;
  bloqueo: string;

  disableButton: boolean = false;

  constructor(private ngZone: NgZone, private stripeService: StripeService, private route: ActivatedRoute, private firestore: FirestoreService, private auth: AuthService, private toast: InteractionService, private router: Router, private loadingCtrl: LoadingController) { }
  
  ngAfterViewInit() {
    this.card = elements.create('card');
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener('change', this.onChange.bind(this));
    this.route.queryParams.subscribe(params => {
      this.pista = params['pista'];
      this.hora = params['hora'];
      this.fechaSeleccionada = params['fecha'];
      this.bloqueo = params['bloqueo'];
    });
    this.disableButton = false;
    this.auth.stateUser().subscribe(res => {
      this.getId();
    });
    this.obtenerPista();
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

  onChange({ error }) {
    if (error) {
      this.ngZone.run(() => this.cardError = error.message);
    } else {
      this.ngZone.run(() => this.cardError = null);
    }
  }

  async obtenerPista() {
    const path = `Pistas`;
    const pista = await this.firestore.getDoc<Pista>(path, this.pista);
    this.pista$ = this.firestore.getDoc<Pista>(path, this.pista);
    pista.subscribe((pista) => {
      if (pista) {
        this.precio = pista.precio;
      }
    });
  }

  async onClick() {
    const loading = await this.showLoading('Procesando...');
    const {token, error} = await stripe.createToken(this.card);
    if (token) {
      this.disableButton  = true;
      try {
        const fecha = new Date(this.fechaSeleccionada);
        const fechaFormateada = formatDate(fecha, 'dd/MM/yyyy', 'en-US');

        const disponible = await this.verificarDisponibilidad(this.pista, fechaFormateada, this.hora);
        if (disponible) {
          loading.dismiss();
          this.toast.presentToast('La hora seleccionada acaba de ser reservada.', 1000);
          this.router.navigate(['/horarios'], { queryParams: { pista: this.pista } });
          return;
        } else {
          const fechaPago = new Date();
          const fechaPagoFormateada = formatDate(fechaPago, 'dd/MM/yyyy', 'en-US');

          const response = await this.stripeService.charge(this.precio, token.id, fechaPagoFormateada);
          if (response.success == true) {
            this.cambiarFecha(this.hora, response.paymentDoc);
          } else {
            this.disableButton = false;
            loading.dismiss();
            this.toast.presentToast('Error al procesar el pago.', 1000);  
          }
        }
      } catch (error) {
        this.disableButton = false;
        loading.dismiss();
        console.log('Error al procesar el pago: ' + error);
        this.toast.presentToast('Error al procesar el pago.', 1000); 
      }
      
    } else {
      this.disableButton = false;
      loading.dismiss();
      this.ngZone.run(() => this.cardError = error.message);
    }
  }

  async verificarDisponibilidad(pistaId: string, fecha: string, hora: string): Promise<boolean> {
    const pista = pistaId;
    const path = 'Pistas/' + pista +'/Reservas';
    
    const reservasObservable = await this.firestore.getCollection<Reserva>(path);
    return new Promise<boolean>((resolve, reject) => {
      reservasObservable.subscribe({
        next: (reservas) => {
          const reservaExistente = reservas.some(reserva => reserva.fecha === fecha && reserva.hora === hora);
          resolve(reservaExistente);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  async ngOnDestroy() {
    if (this.card) {
      this.card.destroy();
    }

    const path = `Pistas/${this.pista}/Bloqueados`;
    const id = this.bloqueo;

    const bloq = await this.firestore.getDoc(path, id);

    if (bloq !== null) {
      await this,this.firestore.deleteDoc(path, id);
    }
  }

  cambiarFecha(horaSeleccionada, paymentDoc) {
    if (horaSeleccionada != null && this.fechaSeleccionada != null) {
      const fecha = new Date(this.fechaSeleccionada);
      const fechaFormateada = formatDate(fecha, 'dd/MM/yyyy', 'en-US');

      if (fechaFormateada && horaSeleccionada) {
        this.guardarReserva(fechaFormateada, horaSeleccionada, paymentDoc);          
      }
    } else {
      this.toast.presentToast("Seleccione día y hora para hacer su reserva",1000);
    }
  }

  async guardarReserva(fecha, hora, paymentDoc) {
    const id = this.uid;
    const path = this.pista;

    this.datos = { uid: id, dni: this.dni, fecha: fecha, hora: hora, pista: this.pista, id: null, paymentDoc: paymentDoc };

    try {
      const doc = await this.firestore.createColl(this.datos, path);

      if (doc !== null) {
        this.toast.presentToast('Hora reservada', 1000);

        setTimeout(() => {
          this.loadingCtrl.dismiss();
          this.toast.presentToast('Cargando...', 1000);
          this.router.navigate(['/pistas']);
          const docId = doc.id;
          doc.set({ id: docId }, { merge: true });
        }, 1500);
      } else {
        this.disableButton = false;
        this.loadingCtrl.dismiss();
        this.toast.presentToast('Error al reservar la hora, contacta con el soporte.', 1000);  
      }
    } catch (error) {
      this.disableButton = false;
      this.loadingCtrl.dismiss();
      this.toast.presentToast('Error al reservar la hora, contacta con el soporte.', 1000);
    }
  }

  async showLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
    });
    loading.present();
    return loading;
  }

}
