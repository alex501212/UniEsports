import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

    profile_data: any = [];
    profileForm: any;
    options: any = [];
    firstTimeLogin: boolean = false;
    loading: boolean = true;

    constructor(private webService: WebService, private route: ActivatedRoute, public authService: AuthService, private formBuilder: FormBuilder, public dialog: MatDialog) { }

    ngOnInit() {
        this.profileForm = this.formBuilder.group({
            username: ['', Validators.required],
            forename: ['', Validators.required],
            surname: ['', Validators.required],
            university: ['', Validators.required],
            grad_year: ['', Validators.required],
            lol_account_name: [''],
        });
        this.authService.user$.subscribe((res) => {
            this.webService.getUserProfile(
                res?.email
            ).subscribe((res) => {
                this.profile_data = res
                this.firstTimeLogin = this.profile_data[0]?.firstTime_login
                this.loading = false;
            })
        })
        this.webService.getInstitutionAsc().subscribe(res => {
            this.options = res
        })
    }

    deleteAccount() {
        this.authService.user$.subscribe((res) => {

            this.webService.deleteUserProfile(
                res?.email
            ).subscribe((res) => {
                sessionStorage.removeItem("token")
                this.authService.logout()
            })
        })
    }

    onSubmit() {
        this.authService.user$.subscribe((res) => {
            this.webService.createUserProfile(
                res?.email, this.profileForm.value
            ).subscribe((res) => {
                this.profileForm.reset();
                this.authService.user$.subscribe((res) => {
                    this.webService.getUserProfile(
                        res?.email
                    ).subscribe((res) => {
                        this.firstTimeLogin = false
                        this.profile_data = res
                    })
                })
            })
        })
    }

    isInvalid(control: any) {
        return this.profileForm.controls[control].invalid &&
            this.profileForm.controls[control].touched
    }

    isUntouched() {
        return this.profileForm.controls.username.pristine ||
            this.profileForm.controls.forename.pristine ||
            this.profileForm.controls.surname.pristine ||
            this.profileForm.controls.university.pristine ||
            this.profileForm.controls.grad_year.pristine
    }

    isIncomplete() {
        return this.isInvalid("username") ||
            this.isInvalid("forename") ||
            this.isInvalid("surname") ||
            this.isInvalid("university") ||
            this.isInvalid("grad_year") ||
            this.isUntouched()
    }
    openDialog(event) {
        this.webService.setEditProfileField(event.target)
        const dialogRef = this.dialog.open(EditProfileDialog, {
            width: '600px',
        });
        dialogRef.afterClosed().subscribe(result => {
            this.authService.user$.subscribe((res) => {
                this.webService.getUserProfile(
                    res?.email
                ).subscribe((res) => {
                    this.profile_data = res
                })
            })
        });
    }
}

@Component({
    selector: 'editProfileDialog',
    templateUrl: 'editProfileDialog.html',
})
export class EditProfileDialog {
    field: any;
    editedField: any
    options: any = [];

    constructor(private _snackBar: MatSnackBar, public dialogRef: MatDialogRef<EditProfileDialog>, private webService: WebService, private route: ActivatedRoute, public authService: AuthService, private formBuilder: FormBuilder, public dialog: MatDialog) { }

    ngOnInit() {

        this.field = this.webService.getEditProfileField().title
        this.webService.getInstitutionAsc().subscribe(res => {
            this.options = res
        })
    }
    editProfile() {
        this.authService.user$.subscribe((res) => {
            this.webService.editProfile(
                res?.email, this.editedField
            ).subscribe((res) => {
                this._snackBar.open("Profile Edited", "Close");
                this.dialogRef.close();
            })
        })
    }

    setEditedField(editedField: any) {
        try {
            this.editedField = editedField.source.value

        } catch (error) {
            this.editedField = editedField.target.value
        }
    }
}