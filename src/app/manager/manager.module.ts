import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManagerRoutingModule } from './manager-routing.module';
import { ManagerComponent } from './manager.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManagerLoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    ManagerComponent,
    DashboardComponent,
    ManagerLoginComponent,
  ],
  imports: [
    CommonModule,           
    FormsModule,            
    ReactiveFormsModule,    
    ManagerRoutingModule    
  ]
})
export class ManagerModule { }
