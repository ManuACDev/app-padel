import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { User } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-editar-reserva',
  templateUrl: './editar-reserva.page.html',
  styleUrls: ['./editar-reserva.page.scss'],
})
export class EditarReservaPage implements OnInit {

  uid: string = null;
  id: string = null;
  usuario: User =  null;
  reserva: Reserva = null;
  pistas: Pista[] = [];

  constructor(private route: ActivatedRoute, private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private toast: InteractionService, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.uid = params['usuario']; 
      this.id = params['reserva'];
    });
    this.obtenerUsuario();
    this.obtenerPistas();
    setTimeout(() => {
      this.obtenerReserva();
    }, 600);
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data;
    });
  }

  async obtenerUsuario() {
    const path = `Usuarios`;
    const usuario = this.firestore.getDoc<User>(path, this.uid);    
    
    usuario.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  async obtenerReserva() {    

    for (const pista of this.pistas) {
      const path = `Pistas/${pista.id}/Reservas`;
      const reserva = await this.firestore.getDoc<Reserva>(path, this.id);

      if (reserva) {
        reserva.subscribe(reserva => {
          this.reserva = reserva;
        });
        break;
      }      
    }
  }

  async presentActionSheet(reserva: Reserva) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.borrarReserva(reserva.pista, reserva);
          }
        },
        {
          text: 'Reembolsar',
          handler: () => {
            //this.changePassword(reserva);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
  
    await actionSheet.present();
  }
  
  async borrarReserva(pista: string, reserva: Reserva) {
    const id = reserva.id;
    const path = `Pistas/${pista}/Reservas`;

    console.log(path + " " + id);

    await this.firestore.deleteDoc<Reserva>(id, path).then(() => {
      this.navegarComponente('gestion-usuarios');
      this.toast.presentToast("Reserva cancelada correctamente.", 1000);
    }).catch(error => {
      console.error(error);
      this.toast.presentToast("Error al cancelar la reserva", 1000);
    });
  }

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }
}
