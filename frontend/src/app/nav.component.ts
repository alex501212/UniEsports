import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { WebService } from './web.service';

@Component({
    selector: 'navigation',
    templateUrl: './nav.component.html',
    styleUrls: []
})
export class NavComponent {

    isAdmin: boolean = false;

    constructor(public webService: WebService, public authService: AuthService, public router: Router) { }

    ngOnInit() {
        this.authService.user$.subscribe((res) => {
            if (res?.["https://myapp.example.com/roles"][0] === "admin") {
                this.isAdmin = true
            } else {
                this.isAdmin = false
            }
        })
    }

    logOut() {
        sessionStorage.removeItem("token")
        this.authService.logout()
    }
}