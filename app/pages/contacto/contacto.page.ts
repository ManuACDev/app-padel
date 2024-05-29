import { Component, OnInit } from '@angular/core';
import { Marker } from 'src/app/models/marker.model';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/services/interaction.service';
import { MenuController } from '@ionic/angular';

declare var google;

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
})
export class ContactoPage implements OnInit {

  map = null;

  constructor(private toast: InteractionService, private router: Router, private menuCtrl: MenuController) { }

  ngOnInit() {
    this.loadScript(() => {
      this.loadMap();
    });
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
  }  

  loadScript(callback: () => void) {
    const script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA3mLrpJZdM9H6JmGaZZWhtf-Vnb2no3yQ";
    script.onload = callback;
    document.head.appendChild(script);
  }

  loadMap() {
    const mapEle: HTMLElement = document.getElementById('map');
    const myLatLng = {lat: 40.317347, lng: -3.7243753};
    this.map = new google.maps.Map(mapEle, {
      center: myLatLng,
      zoom: 13.5
    });

    const infoWindow = new google.maps.InfoWindow({
      content: '<div><strong>Padel Center X4</strong><br>Av. de las Ciudades, 10</div>'
    });
  
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      mapEle.classList.add('show-map');
      const marker = {
        position: {
          lat: 40.317347,
          lng: -3.7243753
        },
        title: 'Padel Center X4'
      };
      const gMarker = this.addMarker(marker);

      gMarker.addListener('click', () => {
        infoWindow.open(this.map, gMarker);
      });
    });
  }

  addMarker(marker: Marker) {
    return new google.maps.Marker({
      position: marker.position,
      map: this.map,
      title: marker.title
    });
  }

  async navegarComponente(componente: string) {
    this.toast.presentToast("Cargando...", 500);
    setTimeout(() => {
      this.router.navigate(['/',componente]);
    }, 500);
  }

  async canDismiss(data?: any, role?: string) {
    return role !== 'gesture';
  }

}
