import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeRoutingModule } from './employee-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleSelectionComponent } from '../role-selection/role-selection.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewRequestComponent } from './new-request/new-request.component';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    LoginComponent,
    RoleSelectionComponent,
    DashboardComponent,
    NewRequestComponent,
  ],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
  ],
  exports: []
})
export class EmployeeModule { }
