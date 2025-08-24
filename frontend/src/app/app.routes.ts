import { Routes } from '@angular/router';
import { PessoaComponent } from './components/pessoa/pessoa.component';
import { CheckinComponent } from './components/checkin/checkin.component';

export const routes: Routes = [
  { path: '', component: CheckinComponent },
  { path: 'pessoas', component: PessoaComponent },
  { path: 'checkin', component: CheckinComponent },
  { path: '**', redirectTo: '' }
];
