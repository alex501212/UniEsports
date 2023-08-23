import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebService } from './web.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthModule } from '@auth0/auth0-angular';

import { InstitutionsComponent } from './institutions.component';
import { InstitutionComponent } from './institution.component';
import { PlayersComponent } from './players.component';
import { CommentComponent } from './comment.component';
import { PlayerComponent } from './player.component';
import { NavComponent } from './nav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ProfileComponent } from './profile.component';
import { PlayerProfileComponent } from './playerProfile.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EditProfileDialog } from './profile.component';
import { AddInstitutionDialog } from './institutions.component';
import { DeleteInstitutionDialog } from './institution.component';
import { EditInstitutionDialog } from './institution.component';
import { RequestsComponent } from './requests.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginLoading } from './loginLoading.component';
import { MatChipsModule } from '@angular/material/chips';
import { EditPlayerDialog } from './players.component';
import { AddTeamDialog } from './institution.component';
import { MatBadgeModule } from '@angular/material/badge';
import { EditTeamDialog } from './players.component';
import { DeleteTeamDialog } from './players.component';
import {MatSelectModule} from '@angular/material/select';


@NgModule({
  declarations: [LoginLoading, RequestsComponent, EditInstitutionDialog, EditTeamDialog, DeleteTeamDialog, DeleteInstitutionDialog, AddTeamDialog, EditPlayerDialog, AddInstitutionDialog, EditProfileDialog, AppComponent, InstitutionsComponent, PlayerProfileComponent, InstitutionComponent, PlayersComponent, CommentComponent, PlayerComponent, NavComponent, ProfileComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, ReactiveFormsModule,
    AuthModule.forRoot({
      domain: "dev-mgdcidb1kl1rwedr.eu.auth0.com",
      clientId: "ROyGQ68l5Odluc4PBdUxUCZu2X5JAb95"
    }),
    BrowserAnimationsModule, MatSelectModule, MatProgressSpinnerModule, MatBadgeModule, MatChipsModule, MatCardModule, MatDialogModule, MatToolbarModule, MatAutocompleteModule, MatButtonModule, MatListModule, MatDividerModule, MatIconModule, MatFormFieldModule, MatPaginatorModule, MatInputModule, MatSnackBarModule],
  providers: [WebService],
  bootstrap: [AppComponent],
})
export class AppModule { }
