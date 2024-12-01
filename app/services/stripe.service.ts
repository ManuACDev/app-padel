import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { from, lastValueFrom } from 'rxjs';

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

  async charge(precio, token, fecha) {
    try {
      const response = await lastValueFrom(from(this.functions.httpsCallable('processPayment')({ precio, token, fecha })));  
      return { success: response.success, paymentDoc: response.paymentDoc };
    } catch (error) {
      console.error('Error al realizar el cargo:', error.message);
      throw error;
    }
  }

  async refund(paymentIntentId, userId, fecha) {
    try {
      const response = await lastValueFrom(from(this.functions.httpsCallable('processRefund')({ paymentIntentId, userId, fecha })));
      return response.success;
    } catch (error) {
      console.error('Error al realizar el reembolso:', error.message);
      throw error;
    }
  }
}
