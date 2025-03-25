import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Add this import

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent} from './dashboard/dashboard.component';
import { AdminLoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddUserComponent } from './add-user/add-user.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminLoginComponent,
    AddUserComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    HttpClientModule 
  ]
})
export class AdminModule { }