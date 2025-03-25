import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ManagerLoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'login', component: ManagerLoginComponent }, 
  { path: 'dashboard', component: DashboardComponent }, 
  { path: '', redirectTo: 'login', pathMatch: 'full' } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule {}
