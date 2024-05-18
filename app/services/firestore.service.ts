import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { from, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore) { }

  createDoc(data: any, path: string, id: string) {
    const collection = this.firestore.collection(path);
    return collection.doc(id).set(data);
  }

  getId() {
    return this.firestore.createId();
  }

  getCollection<tipo>(path: string) {
    const collection = this.firestore.collection<tipo>(path);
    return collection.valueChanges();
  }

  getDoc<tipo>(path: string, id: string) {
    return this.firestore.collection(path).doc<tipo>(id).valueChanges();
  }

  updateDoc<tipo>(path: string, id: string, data: any) {
    return this.firestore.collection(path).doc(id).update(data);
  }

  createColl(data: any, path: string) {
    const collection = this.firestore.collection('Pistas/'+path+'/Reservas');
    return collection.add(data);
  }

  createCollv2(data: any, path: string) {
    const collection = this.firestore.collection(path);
    return collection.add(data);
  }

  getCollectionId<tipo>(id: string, path: string) {
    const collection = this.firestore.collection(path, ref => ref.where('uid', '==', id));
    return collection.get();
  }

  deleteDoc<tipo>(path: string, id:string) {
    const document = this.firestore.collection(path).doc(id);
    return document.delete();
  }

}
