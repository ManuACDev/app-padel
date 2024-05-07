import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pago } from 'src/app/models/pago.model';
import { Reserva } from 'src/app/models/reserva.model';

@Component({
  selector: 'app-editar-pago',
  templateUrl: './editar-pago.page.html',
  styleUrls: ['./editar-pago.page.scss'],
})
export class EditarPagoPage implements OnInit {

  pago: Pago = null;
  reserva: Reserva = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.pago = JSON.parse(params['pago']);
    });
  }

}
