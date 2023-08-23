import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'players',
    templateUrl: './players.component.html',
    styleUrls: ['./players.component.scss']
})
export class PlayersComponent {

    isAdmin: boolean = false;
    currentUser: any;
    player_list: any = [];
    comments: any = [];
    commentForm: any;
    requestForm: any;
    institutionID: any;
    teamID: any;
    isComments: boolean = false;

    constructor(private _snackBar: MatSnackBar, private location: Location, private webService: WebService, private route: ActivatedRoute, private formBuilder: FormBuilder, public authService: AuthService, public dialog: MatDialog) { }

    ngOnInit() {
        this.commentForm = this.formBuilder.group({
            comment: ['', Validators.required],
        });
        this.requestForm = this.formBuilder.group({
            role: ['', Validators.required],
        });
        this.player_list = this.webService.getPlayers(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
        )
        this.comments = this.webService.getComments(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
        )
        this.webService.getComments(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
        ).subscribe((res) => {
            if (res[0] != undefined) {
                this.isComments = true
            }
        })
        this.institutionID = this.route.snapshot.params['iid']
        this.teamID = this.route.snapshot.params['tid']

        this.authService.user$.subscribe((res) => {
            if (res?.["https://myapp.example.com/roles"][0] === "admin") {
                this.isAdmin = true
            } else {
                this.isAdmin = false
            }
            this.webService.getUserProfile(
                res?.email
            ).subscribe((res) => {
                this.currentUser = res[0].username

            })
        })
    }

    getCommentsNewest() {
        this.comments = this.webService.getCommentsNewest(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
        )
    }

    getCommentsOldest() {
        this.comments = this.webService.getCommentsOldest(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
        )
    }

    getCommentsMostVotes() {
        this.comments = this.webService.getCommentsMostVotes(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
        )
    }

    getCommentsLeastVotes() {
        this.comments = this.webService.getCommentsLeastVotes(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
        )
    }

    onSubmit() {
        this.authService.user$.subscribe((res) => {
            this.webService.postComment(
                this.commentForm.value, res?.email
            ).subscribe((res) => {
                this.isComments = true
                this.commentForm.reset();
                this.comments = this.webService.getComments(this.route.snapshot.params['iid'], this.route.snapshot.params['tid'])
            })
        })
    }

    requestToJoinTeam() {
        this.authService.user$.subscribe((res) => {
            this.webService.makeTeamRequest(
                res?.email, this.requestForm.value, this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
            ).subscribe((res) => {
                this._snackBar.open("Request Sent", "Close");
                this.requestForm.reset();
            })
        })

    }

    requestIsInvalid(control: any) {
        return this.requestForm.controls[control].invalid &&
            this.requestForm.controls[control].touched
    }

    requestIsUntouched() {
        return this.requestForm.controls.role.pristine
    }

    requestIsIncomplete() {
        return this.requestIsInvalid("role") ||
            this.requestIsUntouched()
    }

    isInvalid(control: any) {
        return this.commentForm.controls[control].invalid &&
            this.commentForm.controls[control].touched
    }

    isUntouched() {
        return this.commentForm.controls.comment.pristine
    }

    isIncomplete() {
        return this.isInvalid("comment") ||
            this.isUntouched()
    }

    onUpvote(cid: any) {
        this.webService.upvoteComment(cid)
            .subscribe((response: any) => {
                this.comments = this.webService.getComments(this.route.snapshot.params['iid'], this.route.snapshot.params['tid'])
            })
    }

    onDownvote(cid: any) {
        this.webService.downvoteComment(cid)
            .subscribe((response: any) => {
                this.comments = this.webService.getComments(this.route.snapshot.params['iid'], this.route.snapshot.params['tid'])
            })
    }

    deletePlayer(pid: any) {
        this.webService.deletePlayer(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid'], pid
        ).subscribe((res) => {
            this.player_list = this.webService.getPlayers(
                this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
            )
        })
    }

    openDialog(username: any, role: any, playerID: any) {
        this.webService.setTeamID(this.route.snapshot.params['tid'])
        this.webService.setInstitutionID(this.route.snapshot.params['iid'])
        this.webService.setPlayerID(playerID)
        this.webService.setPlayerToEdit(username, role)
        const dialogRef = this.dialog.open(EditPlayerDialog, {
            width: '600px',
        });
        dialogRef.afterClosed().subscribe(result => {
            this.player_list = this.webService.getPlayers(
                this.route.snapshot.params['iid'], this.route.snapshot.params['tid']
            )
        });
    }

    openDeleteTeamDialog() {
        this.webService.setInstitutionID(this.route.snapshot.params['iid'])
        this.webService.setTeamID(this.route.snapshot.params['tid'])
        this.dialog.open(DeleteTeamDialog, {
            width: '600px',
        });
    }

    openEditTeamDialog() {
        this.webService.setInstitutionID(this.route.snapshot.params['iid'])
        this.webService.setTeamID(this.route.snapshot.params['tid'])
        this.dialog.open(EditTeamDialog, {
            width: '600px',
        });
    }
}

@Component({
    selector: 'deleteTeamDialog',
    templateUrl: 'deleteTeamDialog.html',
})
export class DeleteTeamDialog {

    institutionID: any;
    teamID: any;

    constructor(private location: Location, public webService: WebService, public dialogRef: MatDialogRef<DeleteTeamDialog>, private route: ActivatedRoute) { }

    ngOnInit() {
        this.institutionID = this.webService.getInstitutionID()
        this.teamID = this.webService.getTeamID()
    }

    deleteTeam() {
        this.webService.deleteTeam(this.institutionID, this.teamID).subscribe((res) => {
            this.location.back();
        })
    }
}

@Component({
    selector: 'editTeamDialog',
    templateUrl: 'editTeamDialog.html',
})
export class EditTeamDialog {

    institutionID: any;
    teamID: any;
    teamName: any;
    teamGame = "";

    constructor(private location: Location, public webService: WebService, public dialogRef: MatDialogRef<EditTeamDialog>, private route: ActivatedRoute) { }

    ngOnInit() {
        this.institutionID = this.webService.getInstitutionID()
        this.teamID = this.webService.getTeamID()
        this.webService.getTeamByID(this.institutionID, this.teamID).subscribe((res) => {
            this.teamName = res['name']
            this.teamGame = res['game']
        })
    }

    editTeam() {
        this.webService.editTeam(
            this.teamName,
            this.teamGame,
            this.institutionID,
            this.teamID
        ).subscribe((res) => {
            this.location.back();
        })
    }

    setTeamName(editedName: any) {
        this.teamName = editedName.target.value
    }
}

@Component({
    selector: 'editPlayerDialog',
    templateUrl: 'editPlayerDialog.html',
})
export class EditPlayerDialog {

    username: any;
    role: any;
    editedRole: any;
    editedUsername: any;
    institutionID: any;
    teamID: any;
    playerID: any;

    constructor(public dialogRef: MatDialogRef<EditPlayerDialog>, private webService: WebService, private route: ActivatedRoute, public authService: AuthService, private formBuilder: FormBuilder, public dialog: MatDialog) { }

    ngOnInit() {
        this.institutionID = this.webService.getInstitutionID()
        this.teamID = this.webService.getTeamID()
        this.playerID = this.webService.getPlayerID()
        this.role = this.webService.getPlayerToEdit().role
        this.username = this.webService.getPlayerToEdit().username
    }

    editPlayer() {
        if (!this.editedRole) {
            this.editedRole = this.role
        }

        if (!this.editedUsername) {
            this.editedUsername = this.username
        }

        this.webService.editPlayer(
            this.editedUsername,
            this.editedRole,
            this.institutionID,
            this.teamID,
            this.playerID
        ).subscribe((res) => {
            this.dialogRef.close();
        })
    }

    setRole(editedRole) {
        this.editedRole = editedRole.target.value
    }

    setUsername(editedUsername) {
        this.editedUsername = editedUsername.target.value
    }
}