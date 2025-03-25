import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AddUserComponent } from './add-user/add-user.component';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent }, 
  { path: 'dashboard', component: AdminDashboardComponent }, 
  { path: 'add-user', component: AddUserComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
