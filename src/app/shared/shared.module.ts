import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    NavbarComponent 
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavbarComponent, 
    CommonModule,
    RouterModule
  ]
})
export class SharedModule { }
