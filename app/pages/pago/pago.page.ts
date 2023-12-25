import { formatDate } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    id:null
  }

  hora: string;
  fechaSeleccionada: string;

  constructor(private ngZone: NgZone, private stripeService: StripeService, private route: ActivatedRoute, private firestore: FirestoreService, private auth: AuthService, private toast: InteractionService, private router: Router) { }
  
  ngAfterViewInit() {
    this.card = elements.create('card');
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener('change', this.onChange.bind(this));
    this.route.queryParams.subscribe(params => {
      this.pista = params['pista'];
      this.hora = params['hora'];
      this.fechaSeleccionada = params['fecha'];
    });
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
    const {token, error} = await stripe.createToken(this.card);
    if (token) {
      const response: any = await this.stripeService.charge(this.precio, token.id);
      if (response == true) {
        this.cambiarFecha(this.hora);
      } else {
        this.toast.presentToast('Error al procesar el pago.', 1000);  
      }
    } else {
      this.ngZone.run(() => this.cardError = error.message);
    }
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.destroy();
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

}
