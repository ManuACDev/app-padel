import { formatDate } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs/internal/Observable';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
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

  hora: string;
  fechaSeleccionada: string;
  docId: string;

  disabledButton: boolean = false;

  constructor(private ngZone: NgZone, private stripeService: StripeService, private route: ActivatedRoute, private firestore: FirestoreService, private auth: AuthService, private toast: InteractionService, private router: Router, private loadingCtrl: LoadingController) { }
  
  ngAfterViewInit() {
    this.card = elements.create('card');
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener('change', this.onChange.bind(this));
    this.route.queryParams.subscribe(params => {
      this.pista = params['pista'];
      this.hora = params['hora'];
      this.fechaSeleccionada = params['fecha'];
      this.docId = params['docId'];
    });
    this.obtenerPista();
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
    const loading = await this.showLoading("Procesando...");
    const {token, error} = await stripe.createToken(this.card);
    if (token) {
      this.disabledButton  = true;
      try {
        const fecha = new Date();
        const fechaFormateada = formatDate(fecha, 'dd/MM/yyyy', 'en-US');

        const response = await this.stripeService.charge(this.precio, token.id, fechaFormateada);
        if (response.success == true) {
          const path = `Pistas/${this.pista}/Reservas`;
          
          await this.firestore.updateDoc<Reserva>(path, this.docId, { paymentDoc: response.paymentDoc }).then(() => {
            this.toast.presentToast("Hora reservada", 1000);            
            
            setTimeout(() => {
              this.toast.presentToast("Cargando...", 1000);
              this.router.navigate(["/pistas"]);
              loading.dismiss();
            }, 1500);
          });
        } else {
          const path = `Pistas/${this.pista}/Reservas`

          await this.firestore.deleteDoc<Reserva>(path, this.docId).then(() => {
            this.toast.presentToast('Error al procesar el pago.', 1000);
            this.router.navigate(["/pistas"]);
            loading.dismiss();
          });  
        }
      } catch (error) {
        const path = `Pistas/${this.pista}/Reservas`

        await this.firestore.deleteDoc<Reserva>(path, this.docId).then(() => {
          console.log('Error al procesar el pago: ' + error);
          this.toast.presentToast('Error al procesar el pago.', 1000);
          this.router.navigate(["/pistas"]);
          loading.dismiss();
        });         
      }
    } else {
      loading.dismiss();
      this.ngZone.run(() => this.cardError = error.message);
      this.disabledButton = false;
    }
  }

  async borrarReserva() {
    const path = `Pistas/${this.pista}/Reservas`
  
    await this.firestore.deleteDoc<Reserva>(path, this.docId);
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.destroy();
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
