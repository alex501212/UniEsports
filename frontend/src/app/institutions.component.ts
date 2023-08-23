import { Component } from '@angular/core';
import { WebService } from './web.service';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'institutions',
    templateUrl: './institutions.component.html',
    styleUrls: ['./institutions.component.scss']
})
export class InstitutionsComponent {

    institution_list: any = [];
    page: number = 1;
    institution_count: any;
    isAdmin: boolean = false;
    searchForm: any;
    searched: boolean = false;

    constructor(public webService: WebService, public dialog: MatDialog, public authService: AuthService, private formBuilder: FormBuilder) { }
    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            term: [''],
        });

        if (sessionStorage['page']) {
            this.page = Number(sessionStorage['page'])
        }
        this.institution_list = this.webService.getInstitutions(this.page);
        this.webService.getInstitutionsCount().subscribe((res) => {
            this.institution_count = res
        })

        this.authService.user$.subscribe((res) => {
            if (res?.["https://myapp.example.com/roles"][0] === "admin") {
                this.isAdmin = true
            } else {
                this.isAdmin = false
            }
        })
    }

    searchJoinable() {
        this.searched = true
        this.institution_list = this.webService.getInstitutionsJoinableTeams()


    }
    filterAll() {
        this.searched = false
        if (sessionStorage['page']) {
            sessionStorage.removeItem('page')
            this.page = 1
        }
        this.institution_list = this.webService.getInstitutions(this.page);
        this.webService.getInstitutionsCount().subscribe((res) => {
            this.institution_count = res
        })
    }

    fitlerAsc() {
        this.searched = true
        this.institution_list = this.webService.getInstitutionAsc()
    }

    fitlerDesc() {
        this.searched = true
        this.institution_list = this.webService.getInstitutionDesc()
    }


    search() {
        if (this.searchForm.value.term == "") {
            this.searched = false
            if (sessionStorage['page']) {
                this.page = Number(sessionStorage['page'])
            }
            this.institution_list = this.webService.getInstitutions(this.page);
            this.webService.getInstitutionsCount().subscribe((res) => {
                this.institution_count = res
            })
        } else {
            this.searched = true
            this.institution_list = this.webService.searchInstitution(this.searchForm.value)
        }
    }

    previousPage() {
        if (this.page > 1) {
            this.page = this.page - 1;
            sessionStorage['page'] = this.page
            this.institution_list = this.webService.getInstitutions(this.page);
        }
    }

    handlePageEvent(e: PageEvent) {
        if (e.pageIndex === this.page) {
            this.nextPage()
        } else {
            this.previousPage()
        }
    }

    nextPage() {
        this.page = this.page + 1
        sessionStorage['page'] = this.page
        this.institution_list = this.webService.getInstitutions(this.page)
    }

    openDialog() {
        const dialogRef = this.dialog.open(AddInstitutionDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (sessionStorage['page']) {
                this.page = Number(sessionStorage['page'])
            }
            this.institution_list = this.webService.getInstitutions(this.page);
            this.webService.getInstitutionsCount().subscribe((res) => {
                this.institution_count = res
            })
        });
    }
}


@Component({
    selector: 'addInstitutionDialog',
    templateUrl: 'addInstitutionDialog.html',
})
export class AddInstitutionDialog {
    institution_name: any
    address: any
    telephone_num: any
    institution_url: any
    su_url: any

    constructor(private _snackBar: MatSnackBar, public webService: WebService, public dialogRef: MatDialogRef<AddInstitutionDialog>) { }

    ngOnInit() {

    }

    addInstitution() {
        this.webService.addInstitution(
            this.institution_name,
            this.address,
            this.telephone_num,
            this.institution_url,
            this.su_url
        ).subscribe((res) => {
            this._snackBar.open("Institution Added", "Close");
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