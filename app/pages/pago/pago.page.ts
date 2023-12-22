import { Component, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { Pista } from 'src/app/models/pista.model';
import { FirestoreService } from 'src/app/services/firestore.service';
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

  constructor(private ngZone: NgZone, private stripeService: StripeService, private route: ActivatedRoute, private firestore: FirestoreService) { }
  
  ngAfterViewInit() {
    this.card = elements.create('card');
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener('change', this.onChange.bind(this));
    this.route.queryParams.subscribe(params => {
      this.pista = params['pista'];
      //console.log('Pista seleccionada: ', this.pista);
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
    const {token, error} = await stripe.createToken(this.card);
    if (token) {
      console.log("Token botón pagar: " + token + this.precio);
      this.stripeService.charge(this.precio, token.id);
    } else {
      this.ngZone.run(() => this.cardError = error.message);
    }
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.destroy();
    }
  }

}
