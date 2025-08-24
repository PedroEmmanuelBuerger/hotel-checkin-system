import { Routes } from '@angular/router';
import { CheckinComponent } from './components/checkin/checkin.component';

export const routes: Routes = [
  { path: '', component: CheckinComponent },
  { path: 'checkin', component: CheckinComponent },
  { path: '**', redirectTo: '' }
];
