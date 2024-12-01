export interface Pista {
    id: string,
    titulo: string;
    desc: string;
    img: string;
    horas: string[];
    precio: number;
    abierto: boolean;
    descanso: {
        activo: boolean;
        hora?: string;
    };
}