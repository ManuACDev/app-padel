import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public afAuth: AngularFireAuth) { }

  async login(correo:string, password:string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(correo, password);
      return result;
    } catch (error) {
        return error;
    }
  }

  async registerUser(usuario: User)  {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(usuario.correo, usuario.password);
      this.sendVerificationEmail();
      return result;
    } catch (error) {
        return error;
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

}
