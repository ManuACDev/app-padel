import { Reserva } from "./reserva.model";

export interface Duplicado {    
    pista: string;
    fecha: string;
    hora: string;    
    reservas: Reserva[];
}