import { NgModule } from '@angular/core';
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule), canActivate: [AngularFireAuthGuard]
  },
  {
    path: '',
    redirectTo: 'loader',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'loader',
    loadChildren: () => import('./pages/loader/loader.module').then( m => m.LoaderPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule), canActivate: [AngularFireAuthGuard]
  },
  {
    path: 'pistas',
    loadChildren: () => import('./pages/pistas/pistas.module').then( m => m.PistasPageModule)
  },
  {
    path: 'horarios',
    loadChildren: () => import('./pages/horarios/horarios.module').then( m => m.HorariosPageModule)
  },
  {
    path: 'reservas',
    loadChildren: () => import('./pages/reservas/reservas.module').then( m => m.ReservasPageModule)
  },
  {
    path: 'contacto',
    loadChildren: () => import('./pages/contacto/contacto.module').then( m => m.ContactoPageModule)
  },
  {
    path: 'tienda',
    loadChildren: () => import('./pages/tienda/tienda.module').then( m => m.TiendaPageModule)
  },
  {
    path: 'modal',
    loadChildren: () => import('./pages/modal/modal.module').then( m => m.ModalPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'verificacion-email',
    loadChildren: () => import('./pages/verificacion-email/verificacion-email.module').then( m => m.VerificacionEmailPageModule)
  },
  {
    path: 'pago',
    loadChildren: () => import('./pages/pago/pago.module').then( m => m.PagoPageModule)
  },
  {
    path: 'ajustes',
    loadChildren: () => import('./pages/ajustes/ajustes.module').then( m => m.AjustesPageModule)
  },
  {
    path: 'gestion-pistas',
    loadChildren: () => import('./pages/gestion-pistas/gestion-pistas.module').then( m => m.GestionPistasPageModule)
  },
  {
    path: 'gestion-usuarios',
    loadChildren: () => import('./pages/gestion-usuarios/gestion-usuarios.module').then( m => m.GestionUsuariosPageModule)
  },  
  {
    path: 'editar-usuario',
    loadChildren: () => import('./pages/editar-usuario/editar-usuario.module').then( m => m.EditarUsuarioPageModule)
  },
  {
    path: 'gestion-reservas',
    loadChildren: () => import('./pages/gestion-reservas/gestion-reservas.module').then( m => m.GestionReservasPageModule)
  },
  {
    path: 'editar-reserva',
    loadChildren: () => import('./pages/editar-reserva/editar-reserva.module').then( m => m.EditarReservaPageModule)
  },
  {
    path: 'gestion-pagos',
    loadChildren: () => import('./pages/gestion-pagos/gestion-pagos.module').then( m => m.GestionPagosPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
