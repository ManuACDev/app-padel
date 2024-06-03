export interface Producto {
    id: string;
    titulo: string;
    desc: string;
    precio: number;
    unidades: number;
    img: string;
    descuento: {
        activo: boolean;
        precio?: number;
    };
}