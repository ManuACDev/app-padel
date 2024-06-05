import { Component, OnInit } from '@angular/core';
import { Marker } from 'src/app/models/marker.model';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/services/interaction.service';
import { MenuController } from '@ionic/angular';
import { Loader } from '@googlemaps/js-api-loader';

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
    this.loadMap();
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
  }  

  async loadMap() {
    const loader = new Loader({
      apiKey: 'AIzaSyCJjzxG9Nf2sAcYdSQGgripQCr46AWCM_8',
      version: 'weekly',
    });

    loader.importLibrary('marker').then(async () => {
      const { Map } = await loader.importLibrary('maps') as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await loader.importLibrary('marker') as google.maps.MarkerLibrary;

      const mapEle: HTMLElement = document.getElementById('map');
      const myLatLng = { lat: 40.317347, lng: -3.7243753 };
      this.map = new Map(mapEle, {
        center: myLatLng,
        zoom: 13.5,
        mapId: 'map'
      });

      const infoWindow = new google.maps.InfoWindow({
        content: '<div><strong>Padel Center X4</strong><br>Av. de las Ciudades, 10</div>',
      });
  
      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        mapEle.classList.add('show-map');
        const marker = {
          position: {
            lat: 40.317347,
            lng: -3.7243753,
          },
          title: 'Padel Center X4',
        };
        const gMarker = this.addMarker(AdvancedMarkerElement, marker);
  
        gMarker.addListener('click', () => {
          infoWindow.open(this.map, gMarker);
        });
      });
    });
  }

  addMarker(AdvancedMarkerElement: any, marker: any) {
    return new AdvancedMarkerElement({
      position: marker.position,
      map: this.map,
      title: marker.title,
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
