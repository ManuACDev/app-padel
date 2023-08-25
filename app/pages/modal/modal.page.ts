import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {

  @Input() producto: any;

  constructor(public modalController: ModalController, private navParams: NavParams) {
    this.producto = this.navParams.get('producto');
   }

  ngOnInit() {
  }

  closeModal() {
    this.modalController.dismiss();
  }

}
