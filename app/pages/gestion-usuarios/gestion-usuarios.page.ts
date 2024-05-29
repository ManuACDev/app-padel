import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.page.html',
  styleUrls: ['./gestion-usuarios.page.scss'],
})
export class GestionUsuariosPage implements OnInit {

  usuarios: User[] = [];
  results: User[] = [];
  uid: string = null;

  constructor(private menuCtrl: MenuController, private firestore: FirestoreService, private toast: InteractionService, private router: Router, private auth: AuthService) { }

  ngOnInit() {
    this.auth.stateUser().subscribe(() => {
      this.getId();
    });
    this.obtenerUsuarios();
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
  }

  async getId() {
    const uid = await this.auth.getUid();
    if (uid) {
      this.uid = uid;      
    } else {
      console.log("No existe uid");
    }
  }

  async obtenerUsuarios() {
    this.usuarios = [];

    const path = `Usuarios`;
    const usuarios = await this.firestore.getCollection<User>(path);
    usuarios.subscribe(data => {
      this.usuarios = data.filter(usuario => usuario.uid != this.uid);
      this.results = this.usuarios;
    });
  }

  searchUser(event) {
    const query = event.target.value.toLowerCase().trim();
    if (query !== '') {
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

  async navegarComponente(componente: string, usuario: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente], { queryParams: { usuario: usuario } });
    }, 500);
  }
}
