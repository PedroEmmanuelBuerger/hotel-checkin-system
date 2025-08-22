import { Routes } from '@angular/router';
import { PessoaComponent } from './components/pessoa/pessoa.component';

export const routes: Routes = [
  { path: '', redirectTo: '/pessoas', pathMatch: 'full' },
  { path: 'pessoas', component: PessoaComponent },
  { path: '**', redirectTo: '/pessoas' }
];
