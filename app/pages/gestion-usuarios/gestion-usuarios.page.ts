import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.page.html',
  styleUrls: ['./gestion-usuarios.page.scss'],
})
export class GestionUsuariosPage implements OnInit {

  usuarios: User[] = [];
  results: User[] = [];

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService) { }

  ngOnInit() {
    this.obtenerUsuarios();
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
  }

  async obtenerUsuarios() {
    this.usuarios = [];

    const path = `Usuarios`;
    const usuarios = await this.firestore.getCollection<User>(path);
    usuarios.subscribe(data => {
      this.usuarios = data;
      this.results = this.usuarios;
    });
  }

  searchUser(event) {
    const query = event.target.value;
    if (query.trim() !== '') {
      this.results = this.usuarios.filter(usuario => {
        return Object.values(usuario).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          return false;
        });
      });
    } else {
      this.results = this.usuarios;
    }    
  }
}
