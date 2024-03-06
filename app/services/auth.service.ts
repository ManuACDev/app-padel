import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user.model';
import { from, lastValueFrom } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/compat/functions';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public afAuth: AngularFireAuth, private functions: AngularFireFunctions) { }

  async login(correo:string, password:string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(correo, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async registerUser(usuario: User)  {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(usuario.correo, usuario.password);
      this.sendVerificationEmail();
      return result;
    } catch (error) {
      throw error;
    }
    
  }

  async getUid() {
    const user = await  this.afAuth.currentUser;
    if (user) {
      return user.uid;
    } else {
      return null;
    } 
  }

  logout() {
    this.afAuth.signOut();
  }

  stateUser() {
    return this.afAuth.authState;
  }

  async resetPassword(correo: string):Promise<void>{
    try {
      return this.afAuth.sendPasswordResetEmail(correo);
    } catch (error) {
      console.log(error);
    }
  }

  async sendVerificationEmail():Promise<void> {
    return (await this.afAuth.currentUser).sendEmailVerification();
  }

  async stateUserAccount(uid: string, disabled: boolean) {
    try {
      const response = await lastValueFrom(from(this.functions.httpsCallable('toggleUserAccount')({ uid, disabled })));
      return response.success;
    } catch (error) {
      console.error('Error al cambiar el estado de la cuenta:', error);
      throw error;
    }
  }

  async deleteUser(uid: string) {
    try {
      const response = await lastValueFrom(from(this.functions.httpsCallable('deleteUser')({ uid })));
      return response.success;
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      throw error;
    }
  }

  async changeEmail(uid: string, correo: string) {
    try {
      const response = await lastValueFrom(from(this.functions.httpsCallable('changeEmail')({ uid, correo })));
      return response.success;
    } catch (error) {
      console.error('Error al cambiar el correo:', error);
      throw error;
    }
  }

}
