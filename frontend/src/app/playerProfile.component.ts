import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'playerProfile',
    templateUrl: './playerProfile.component.html',
    styleUrls: ['./playerProfile.component.scss']
})
export class PlayerProfileComponent {

    profile_data: any = [];
    user: any;
    currentUser: any;
    followClicked: boolean = true;
    unfollowClicked: boolean = true;
    loading: boolean = false;

    constructor(private webService: WebService, private route: ActivatedRoute, public authService: AuthService, private formBuilder: FormBuilder) { }

    ngOnInit() {
        this.user = this.route.snapshot.params['user']
        this.authService.user$.subscribe((res) => {
            this.webService.getUserProfileByUsername(
                this.route.snapshot.params['user']
            ).subscribe((res) => {
                this.profile_data = res
            })
        })

        this.authService.user$.subscribe((res) => {
            this.webService.getUserProfile(
                res?.email
            ).subscribe((res) => {
                this.currentUser = res[0]?.username
                this.followClicked = false
                this.unfollowClicked = false
            })
        })
    }

    followUser() {
        this.followClicked = true
        this.unfollowClicked = false
        this.loading = true
        this.authService.user$.subscribe((res) => {
            this.webService.getUserProfile(
                res?.email
            ).subscribe((res) => {
                this.webService.followUser(res[0].username, this.route.snapshot.params['user']).subscribe((res) => {
                    this.webService.getUserProfileByUsername(
                        this.route.snapshot.params['user']
                    ).subscribe((res) => {
                        this.profile_data = res
                        this.loading = false
                    })
                })
            })
        })
    }

    unfollowUser() {
        this.unfollowClicked = true
        this.followClicked = false
        this.loading = true
        this.authService.user$.subscribe((res) => {
            this.webService.getUserProfile(
                res?.email
            ).subscribe((res) => {
                this.webService.unfollowUser(res[0].username, this.route.snapshot.params['user']).subscribe((res) => {
                    this.webService.getUserProfileByUsername(
                        this.route.snapshot.params['user']
                    ).subscribe((res) => {
                        this.profile_data = res
                        this.loading = false
                    })
                })
            })
        })
    }
}