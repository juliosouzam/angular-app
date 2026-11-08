import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
  {
    path: 'usuarios',
    loadComponent: () => import('./users/users-page').then((page) => page.UsersPage),
  },
  { path: '**', redirectTo: 'usuarios' },
];
