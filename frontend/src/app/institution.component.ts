import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';

@Component({
    selector: 'institution',
    templateUrl: './institution.component.html',
    styleUrls: ['./institution.component.scss']
})
export class InstitutionComponent {

    institution_list: any;
    teams: any = [];
    isAdmin: boolean = false;

    constructor(private webService: WebService, private route: ActivatedRoute, public dialog: MatDialog, private router: Router, public authService: AuthService) { }

    ngOnInit() {
        this.institution_list = this.webService.getInstitution(
            this.route.snapshot.params['id']
        );
        this.teams = this.webService.getTeams(
            this.route.snapshot.params['id']
        )
        this.webService.setInstitutionID(
            this.route.snapshot.params['id']
        )

        this.authService.user$.subscribe((res) => {
            if (res?.["https://myapp.example.com/roles"][0] === "admin") {
                this.isAdmin = true
            } else {
                this.isAdmin = false
            }
        })
    }

    openDeleteDialog() {
        const dialogRef = this.dialog.open(DeleteInstitutionDialog, {
            width: '600px',
        });
        dialogRef.afterClosed().subscribe(result => {
            this.router.navigate(['../institutions']);
        });
    }

    openEditDialog() {
        const dialogRef = this.dialog.open(EditInstitutionDialog, {
            width: '600px',
        });
        dialogRef.afterClosed().subscribe(result => {
            this.institution_list = this.webService.getInstitution(
                this.route.snapshot.params['id']
            );
            this.teams = this.webService.getTeams(
                this.route.snapshot.params['id']
            )
            this.webService.setInstitutionID(
                this.route.snapshot.params['id']
            )
        });
    }

    openAddDialog() {
        const dialogRef = this.dialog.open(AddTeamDialog, {
            width: '600px',
        });
        dialogRef.afterClosed().subscribe(result => {
            this.teams = this.webService.getTeams(
                this.route.snapshot.params['id']
            )
        });
    }
}

@Component({
    selector: 'addTeamDialog',
    templateUrl: 'addTeamDialog.html',
})
export class AddTeamDialog {

    institutionID: any;
    gameName = "";
    teamName: any;

    constructor(public webService: WebService, public dialogRef: MatDialogRef<AddTeamDialog>, private route: ActivatedRoute) { }

    ngOnInit() {
        this.institutionID = this.webService.getInstitutionID()
    }

    setTeamName(teamName: any) {
        this.teamName = teamName.target.value
    }

    addNewTeam() {
        this.webService.addNewTeam(this.institutionID, this.teamName, this.gameName).subscribe((res) => {
            this.dialogRef.close();
        })
    }
}

@Component({
    selector: 'deleteInstitutionDialog',
    templateUrl: 'deleteInstitutionDialog.html',
})
export class DeleteInstitutionDialog {

    institutionID: any;

    constructor(public webService: WebService, public dialogRef: MatDialogRef<DeleteInstitutionDialog>, private route: ActivatedRoute) { }

    ngOnInit() {
        this.institutionID = this.webService.getInstitutionID()
    }

    deleteInstitution() {
        this.webService.deleteInstitution(this.institutionID).subscribe((res) => {
            this.dialogRef.close();
        })
    }
}

@Component({
    selector: 'editInstitutionDialog',
    templateUrl: 'editInstitutionDialog.html',
})
export class EditInstitutionDialog {

    institutionID: any;
    institution_list: any;

    institution_name: any;
    address: any;
    telephone_num: any;
    institution_url: any;
    su_url: any;

    constructor(public webService: WebService, public dialogRef: MatDialogRef<EditInstitutionDialog>, private route: ActivatedRoute) { }

    ngOnInit() {
        this.institutionID = this.webService.getInstitutionID()
        this.institution_list = this.webService.getInstitution(
            this.institutionID
        );
    }

    editInstitution() {
        this.webService.editInstitution(
            this.institutionID,
            this.institution_name ? this.institution_name : (<HTMLInputElement>document.getElementById("institution_name")).value,
            this.address ? this.address : (<HTMLInputElement>document.getElementById("address")).value,
            this.telephone_num ? this.telephone_num : (<HTMLInputElement>document.getElementById("telephone_num")).value,
            this.institution_url ? this.institution_url : (<HTMLInputElement>document.getElementById("institution_url")).value,
            this.su_url ? this.su_url : (<HTMLInputElement>document.getElementById("su_url")).value,
        ).subscribe((res) => {
            this.dialogRef.close();
        })
    }

    setInstitutionName(editedField: any) {
        this.institution_name = editedField.target.value
    }

    setAddress(editedField: any) {
        this.address = editedField.target.value
    }

    setTelephoneNumber(editedField: any) {
        this.telephone_num = editedField.target.value
    }

    setWebsite(editedField: any) {
        this.institution_url = editedField.target.value
    }

    setSuWebsite(editedField: any) {
        this.su_url = editedField.target.value
    }
}