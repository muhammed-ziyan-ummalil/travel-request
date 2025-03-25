import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleSelectionComponent } from './role-selection/role-selection.component';

const routes: Routes = [
  { path: '', component: RoleSelectionComponent }, // Default route to Role Selection
  {
    path: 'employee',
    loadChildren: () =>
      import('./employee/employee.module').then((m) => m.EmployeeModule),
  },
  {
    path: 'manager',
    loadChildren: () =>
      import('./manager/manager.module').then((m) => m.ManagerModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // Fallback route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
