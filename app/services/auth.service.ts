import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: AngularFireAuth) { }

  login(correo:string, password:string) {
    return this.auth.signInWithEmailAndPassword(correo, password);
  }

  registerUser(usuario: User)  {
    return this.auth.createUserWithEmailAndPassword(usuario.correo, usuario.password);
  }

  async getUid() {
    const user = await  this.auth.currentUser;
    if (user) {
      return user.uid;
    } else {
      return null;
    } 
  }

  logout() {
    this.auth.signOut();
  }

  stateUser() {
    return this.auth.authState;
  }

  async resetPassword(correo: string):Promise<void>{
    try {
      return this.auth.sendPasswordResetEmail(correo);
    } catch (error) {
      console.log(error);
    }
  }

}
