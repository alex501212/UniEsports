import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstitutionsComponent } from './institutions.component';
import { InstitutionComponent } from './institution.component';
import { PlayersComponent } from './players.component';
import { CommentComponent } from './comment.component';
import { PlayerComponent } from './player.component';
import { ProfileComponent } from './profile.component';
import { PlayerProfileComponent } from './playerProfile.component';
import { RequestsComponent } from './requests.component';
import { LoginLoading } from './loginLoading.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/institutions',
    pathMatch: 'full'

  },
  {
    path: 'login',
    component: LoginLoading
  },
  {
    path: 'institutions',
    component: InstitutionsComponent
  },
  {
    path: 'myProfile',
    component: ProfileComponent
  },
  {
    path: 'requests',
    component: RequestsComponent
  },
  {
    path: 'institutions/:iid/teams/:tid/profile/:user',
    component: PlayerProfileComponent
  },
  {
    path: 'institutions/:id',
    component: InstitutionComponent
  },
  {
    path: 'institutions/:iid/teams/:tid/players',
    component: PlayersComponent
  },
  {
    path: 'institutions/:iid/teams/:tid/comments/:cid',
    component: CommentComponent
  },
  {
    path: 'institutions/:iid/teams/:tid/players/:pid',
    component: PlayerComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
