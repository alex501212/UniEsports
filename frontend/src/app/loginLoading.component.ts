import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { WebService } from './web.service';


@Component({
    selector: 'loginLoading',
    templateUrl: './loginLoading.component.html',
    styleUrls: ['./loginLoading.component.scss']
})
export class LoginLoading {

    isAdmin: boolean = false;
    firstLogin: boolean = true;

    constructor(public webService: WebService, public authService: AuthService, public router: Router) { }

    ngOnInit() {
        this.authService.user$.subscribe((res) => {
            if (res?.["https://myapp.example.com/roles"][0] === "admin") {
                this.isAdmin = true
            } else {
                this.isAdmin = false
            }

            if (res?.email?.includes("@gmail.com")) {
                this.webService.getUserProfile(
                    res?.email
                ).subscribe((response) => {
                    this.firstLogin = response[0]?.firstTime_login
                    this.webService.loginGmail(res?.nickname, res?.email, this.isAdmin).subscribe((res) => {
                        sessionStorage.setItem("token", res['token'])
                        this.router.navigate(['/institutions']);
                    })

                }, (error) => {
                    this.webService.createUserGmail(res?.email, res?.nickname,).subscribe((response) => {
                        this.webService.loginGmail(res?.nickname, res?.email, this.isAdmin).subscribe((res) => {
                            sessionStorage.setItem("token", res['token'])
                            this.router.navigate(['/myProfile']);
                        })
                    })
                })


            } else {
                this.webService.getUserProfile(res?.email).subscribe((res) => {

                    this.webService.login(res[0]?.username, res[0]?.password, this.isAdmin).subscribe((res) => {
                        sessionStorage.setItem("token", res['token'])
                        this.router.navigate(['/institutions']);
                    })
                })
            }
        })
    }
}