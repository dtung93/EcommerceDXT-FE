import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { BoardMasterComponent } from './board-master/board-master.component';
import { FileUpLoadComponent } from './file-up-load/file-up-load.component';
import {ForgotpasswordComponent} from './forgot-password/forgotpassword.component'
import { ResetPasswordComponent } from './reset-password/reset-password.component';
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'mod', component: BoardModeratorComponent },
  { path: 'admin', component: BoardAdminComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {path:'product/:id',component:ProductDetailComponent},
  {path:'master',component:BoardMasterComponent},
  {path:'file-upload',component:FileUpLoadComponent},
  {path:'forgot-password',component:ForgotpasswordComponent},
  {path:'reset-password',component:ResetPasswordComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
