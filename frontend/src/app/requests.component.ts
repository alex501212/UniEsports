import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { WebService } from './web.service';

@Component({
    selector: 'requests',
    templateUrl: './requests.component.html',
    styleUrls: []
})
export class RequestsComponent {
    constructor(private webService: WebService, public authService: AuthService, public router: Router) { }

    request_list: any = [];
    isRequests: boolean = false;

    ngOnInit() {
        this.request_list = this.webService.getRequests()
        this.webService.getRequests().subscribe((res) => {
            res[0] == undefined ? this.isRequests = false : this.isRequests = true
        })


    }

    confirmRequest(iid: any, tid: any, rid: any, user: any, role: any) {
        this.webService.addNewPlayer(iid, tid, user, role).subscribe((res) => {
            this.deleteRequest(iid, tid, rid)
            this.webService.getRequests().subscribe((res) => {
                res[0] == undefined ? this.isRequests = false : this.isRequests = true
                location.reload();
            })
        })
    }

    deleteRequest(iid: any, tid: any, rid: any) {
        this.webService.deleteRequest(iid, tid, rid).subscribe((res) => {
            this.request_list = this.webService.getRequests();
            this.webService.getRequests().subscribe((res) => {
                res[0] == undefined ? this.isRequests = false : this.isRequests = true
            })
        })
    }
}

