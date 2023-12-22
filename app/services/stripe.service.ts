import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(public afAuth: AngularFireAuth, private functions: AngularFireFunctions) { }

  getToken(card) {
    stripe
      .createCardToken(card)
      .then((token) => {
        return token.id
      })
      .catch((error) => {
        return error;
      });
  }

  async charge(precio, token) {
    console.log("Pago StripeService " + precio);
    try {
      this.functions.httpsCallable('processPayment')({ precio, token }).subscribe((response) => {
        console.log('Resultado del pago:', response);
        return response;
      });
    } catch (error) {
      console.error('Error al realizar el cargo:', error.message);
      throw error;
    }
  }
}
