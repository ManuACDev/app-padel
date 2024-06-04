import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, MenuController, ModalController } from '@ionic/angular';
import { Pista } from 'src/app/models/pista.model';
import { Reserva } from 'src/app/models/reserva.model';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-gestion-pistas',
  templateUrl: './gestion-pistas.page.html',
  styleUrls: ['./gestion-pistas.page.scss'],
})
export class GestionPistasPage implements OnInit {

  @ViewChild('modal') modal: HTMLIonModalElement;

  pistas: Pista[] = [];
  pista: Pista = { id: null, titulo: null, desc: null, img: null, horas: null, precio: null, abierto: true, descanso: { activo: false, hora: null } }
  pistaOriginal: Pista = null;

  apertura: string = null;
  cierre: string = null;
  duracion: string = null;
  descanso: string | null = null
  
  horasDisponibles: string[] = [];
  pistasIDs: number[] = [];

  modoEdicion = false;
  horaDescanso = false;

  constructor(private firestore: FirestoreService, private actionSheetCtrl: ActionSheetController, private alertController: AlertController, private toast: InteractionService, private firestorage: FirestorageService, private modalCtrl: ModalController, private menuCtrl: MenuController, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.obtenerPistas();
  }

  ionViewDidLeave() {
    this.menuCtrl.close();
  }

  async obtenerPistas() {
    this.pistas = [];

    const path = `Pistas`;
    const pistas = await this.firestore.getCollection<Pista>(path);
    pistas.subscribe(data => {
      this.pistas = data;
    });
  }

  async presentActionSheet(pista: Pista) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            this.confirmarBorrar(pista);
          }
        },
        {
          text: 'Editar',
          handler: async () => {
            this.edidtarPista(pista);
          }
        },
        {
          text: pista.abierto ? 'Cerrar' : 'Abrir',
          handler: async () => {
            this.estadoPista(pista);
          }
        },      
        {
          text: 'Cancelar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  async confirmarBorrar(pista: Pista) {
    const confirmacion = await this.alertController.create({
      header: 'Eliminar pista',
      subHeader: '¿Estás seguro de eliminar la pista?',
      message: 'Esta acción no se puede deshacer.',
      cssClass: 'alert-gestion-pistas',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.toast.presentToast('Acción cancelada', 1000);
          }
        },
        {
          text: 'Eliminar',
          handler: async () => {
            this.borrarPista(pista);
          }
        }
      ]
    });
    await confirmacion.present();
  }

  async borrarPista(pista:Pista) {
    const loading = await this.showLoading('Eliminando pista...');

    try {
      const id = pista.id;
      const deletePromises: Promise<void>[] = [];

      const pathRes = `Pistas/${id}/Reservas`;
      const reservas = await this.firestore.getCollection<Reserva>(pathRes);
      
      reservas.subscribe(data => {
        data.forEach(async (doc) => {
          const reserva = doc as Reserva;
          const deletePromise = this.firestore.deleteDoc(pathRes, reserva.id).catch(error => {
            console.log(error);
          });
          deletePromises.push(deletePromise);
        });
      });

      await Promise.all(deletePromises).then(async () => {
        const path = `Pistas/`;
        await this.firestore.deleteDoc<Pista>(path, id).catch(error => {
          this.pistas = [];
          console.log(error);
          this.toast.presentToast("Error al borrar la pista", 1000);
        });
      });
    } catch (error) {
      console.log(error);
      this.toast.presentToast("Error al borrar la pista", 1000);
    } finally {
      this.obtenerPistas();
      loading.dismiss();
      this.toast.presentToast("Pista borrada", 1000);
    }
  }

  async agregarPista() {
    if (!this.pista.titulo || !this.pista.desc || !this.pista.precio || !this.pista.img || !this.apertura || !this.cierre || !this.duracion) {
      this.toast.presentToast("Todos los campos son obligatorios", 1500);
    } else {
        const loading = await this.showLoading('Añadiendo pista...');
        try {
          const apertura = this.obtenerHora(this.apertura),
                cierre = this.obtenerHora(this.cierre),
                duracion = this.obtenerHora(this.duracion),
                descanso = this.obtenerHora(this.descanso);

          const id = await this.obtenerIDsPistas();
          this.pista.id = "Pista" + id;
          this.pista.horas = this.calcularHorasDisponibles(apertura, cierre, duracion, descanso);
          this.pista.abierto = true;

          if (this.horaDescanso) {
            this.pista.descanso.activo = true;
            this.pista.descanso.hora = descanso;
          } else {
            this.pista.descanso.activo = false;
            this.pista.descanso.hora = null;
          }

          const path = 'Pistas';
          await this.firestore.createDoc(this.pista, path, this.pista.id).then(() => {
            this.pistas = [];
            this.toast.presentToast('Pista creada', 1000);
            this.cerrarModal();
          }).catch(error => {
            console.log(error);
            this.toast.presentToast('Error al crear la pista', 1000);
          });
        } catch (error) {
          console.log(error);
          this.toast.presentToast('Error al crear la pista', 1000);
        } finally {
          loading.dismiss();
        }
    }
  }

  calcularHorasDisponibles(apertura: string, cierre: string, duracionReserva: string, descanso: string | null) {
    const horasDisponibles: string[] = [];

    let hora = apertura;
    const horaCierre = cierre;

    while (hora < horaCierre) {
        const horaFinReserva = this.sumarHoras(hora, duracionReserva);
        if (descanso !== null && (this.mismaHora(hora, descanso))) {
            hora = this.sumarHoras(hora, '01:00');
        } else {
            const rangoHorario = `${hora} - ${horaFinReserva}`;
            horasDisponibles.push(rangoHorario);
            hora = horaFinReserva;
        }
    }

    return horasDisponibles;
  }

  mismaHora(hora1: string, hora2: string): boolean {
    const [hora1Parte,] = hora1.split(':');
    const [hora2Parte,] = hora2.split(':');
    return hora1Parte === hora2Parte;
  }

  sumarHoras(hora: string, cantidadHoras: string): string {
    const [horas, minutos] = hora.split(':').map(Number);
    const [horasSumar, minutosSumar] = cantidadHoras.split(':').map(Number);
    let minutosTotales = horas * 60 + minutos + horasSumar * 60 + minutosSumar;
    let horasSumadas = Math.floor(minutosTotales / 60);
    const minutosRestantes = minutosTotales % 60;
  
    if (horasSumadas >= 24) {
      horasSumadas -= 24; // Ajustar las horas si se excede el límite de 24 horas en un día
    }

    return `${horasSumadas < 10 ? '0' : ''}${horasSumadas}:${minutosRestantes < 10 ? '0' : ''}${minutosRestantes}`;
  }

  formatoHora(horaInicio: Date, horaFin: Date): string {
    const horaInicioStr = horaInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const horaFinStr = horaFin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${horaInicioStr} - ${horaFinStr}`;
  }


  async handleImageChange($event: any) {
    const path = `Pistas de padel`;
    const file = $event.target.files[0];
    const nombre = file.name;

    const res = await this.firestorage.uploadImage(file, path, nombre);
    this.pista.img = res;
  }

  async obtenerIDsPistas() {    

    for(const pista of this.pistas) {
      const id = pista.id.replace("Pista", "");
      this.pistasIDs.push(parseInt(id));
    }

    this.pistasIDs.sort((a, b) => a - b);
    const ultimoId = this.pistasIDs[this.pistasIDs.length - 1];
    const nuevoId = ultimoId + 1;
    
    return nuevoId;
  }

  async edidtarPista(pista: Pista) {
    this.pistaOriginal = { ...pista };

    await this.modalCtrl.create({ 
      component: this.modal.component, 
      componentProps: {
        modoEdicion: this.modoEdicion = true,
        pistaPadel: this.pista = pista,
        horaApertura: this.apertura = this.recuperarHora(pista.horas[0], "primera"),
        horaCierre: this.cierre = this.recuperarHora((pista.horas[pista.horas.length - 1]), "segunda"),
        duracionPista: this.duracion = this.calcularDuracionTotal(pista.horas[0]),
        tiempoDescanso: this.descanso = pista.descanso.hora,
        horaDescanso: this.horaDescanso = pista.descanso.activo
       } 
    });
    
    await this.modal.present();
  }

  async guardarCambios(pista: Pista) {
    const open = this.recuperarHora(this.pistaOriginal.horas[0], "primera");
    const close =  this.recuperarHora((this.pistaOriginal.horas[pista.horas.length - 1]), "segunda");
    const time = this.calcularDuracionTotal(this.pistaOriginal.horas[0]);
    const rest = this.pistaOriginal.descanso.hora;

    if (!this.pista.titulo || !this.pista.desc || !this.pista.precio || !this.apertura || !this.cierre || !this.duracion) {
      this.toast.presentToast("Todos los campos son obligatorios", 1500);
    } else if (this.pistaOriginal.titulo === pista.titulo && this.pistaOriginal.desc === pista.desc && this.pistaOriginal.precio === pista.precio && this.pistaOriginal.img === pista.img && this.apertura === open && this.cierre === close && this.duracion === time && this.descanso === rest) {
      this.toast.presentToast("No hay cambios para guardar.", 1500);
    } else {
        try {
          const id = pista.id;
          const path = 'Pistas';

          const apertura = this.obtenerHora(this.apertura),
                cierre = this.obtenerHora(this.cierre),
                duracion = this.obtenerHora(this.duracion),
                descanso = this.obtenerHora(this.descanso);

          pista.horas = this.calcularHorasDisponibles(apertura, cierre, duracion, descanso);

          if (this.horaDescanso) {
            this.pista.descanso.activo = true;
            this.pista.descanso.hora = descanso;
          } else {
            this.pista.descanso.activo = false;
            this.pista.descanso.hora = null;
          }
                    
          await this.firestore.updateDoc(path, id , {titulo: pista.titulo, desc: pista.desc, precio: pista.precio, horas: pista.horas, img: pista.img, descanso: {activo: pista.descanso.activo, hora: pista.descanso.hora}}).then(() => {
            this.toast.presentToast('Pista editada', 1000);
            this.pistas = [];
            this.cerrarModal();
          }).catch(error => {
            console.log(error);
            this.toast.presentToast('Error al editar la pista', 1000);
          });
        } catch (error) {
          console.log(error);
          this.toast.presentToast('Error al editar la pista', 1000);
        }
    }
  }

  onCheckboxChange(): void {
    if (!this.horaDescanso) {
      this.descanso = null;
    }
  }

  async estadoPista(pista: Pista) {
    try {
      const id = pista.id;
      const path = 'Pistas';
      const estado = pista.abierto;

      if (estado) {
        pista.abierto = false;
      } else {
        pista.abierto = true;
      }

      await this.firestore.updateDoc(path, id , {abierto: pista.abierto}).then(() => {
        if (pista.abierto) {
          this.toast.presentToast('Pista abierta para el público.', 1000);
        } else {
          this.toast.presentToast('Pista cerrada para el público.', 1000);
        }
        this.pistas = [];
      }).catch(error => {
        console.log(error);
        this.toast.presentToast('Error al clausular la pista', 1000);
      });
    } catch (error) {
      console.log(error);
      this.toast.presentToast('Error al clausular la pista', 1000);
    }
  }

  cerrarModal() {
    if (this.modoEdicion) {
      Object.assign(this.pista, this.pistaOriginal);
    }

    this.modalCtrl.dismiss().then(() => {
      this.modoEdicion ? (this.modoEdicion = false) : null;

      this.pista = { id: null, titulo: null, desc: null, img: null, horas: null, precio: null, abierto: null, descanso: { activo: false, hora: null} };
  
      this.apertura = null;
      this.cierre = null;
      this.duracion = null;
  
      this.horaDescanso = false;
      this.descanso = null;
    });
  }

  async showLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
    });
    loading.present();
    return loading;
  }

  calcularDuracionTotal(horario: string): string {
    const [horaInicio, horaFin] = horario.split(' - ');
    const duracion = this.restarHorarios(horaInicio, horaFin);

    return duracion;
  }

  restarHorarios(horaInicio: string, horaFin: string): string {
    
    const [horaInicioHH, horaInicioMM] = horaInicio.split(':').map(Number);
    const [horaFinHH, horaFinMM] = horaFin.split(':').map(Number);
    const minutosInicio = horaInicioHH * 60 + horaInicioMM;
    const minutosFin = horaFinHH * 60 + horaFinMM;

    let diferenciaMinutos = minutosFin - minutosInicio;

    const horas = Math.floor(diferenciaMinutos / 60);
    const minutos = diferenciaMinutos % 60;

    const resultado = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;

    return resultado;
}

  obtenerHora(horario: string | null) {
    if (horario == null) {
      return '';
    } else {
      if (horario.includes('T')) {
        // Formato 'YYYY-MM-DDTHH:mm:ss.sssZ'
        const fechaCompleta = new Date(horario);
        const hora = fechaCompleta.getHours().toString().padStart(2, '0');
        const minutos = fechaCompleta.getMinutes().toString().padStart(2, '0');
        return `${hora}:${minutos}`;
      } else {
        // Formato 'HH:mm'
        const [hora, minutos] = horario.split(':');
        return `${hora.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
      }
    }
  }

  recuperarHora(horario: string, parte: 'primera' | 'segunda'): string {
    const partes = horario.split('-').map(part => part.trim());
    if (parte === 'primera') {
        return partes[0];
    } else if (parte === 'segunda') {
        return partes[1];
    } else {
        throw new Error('El parámetro "parte" debe ser "primera" o "segunda"');
    }
  }
}
