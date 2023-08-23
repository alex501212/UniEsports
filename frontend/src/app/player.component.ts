import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
    selector: 'player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss']
})
export class PlayerComponent {

    player_data: any = [];
    institutionID: any;
    teamID: any;
    currentUser: any;

    constructor(private webService: WebService, private route: ActivatedRoute, public authService: AuthService) { }

    ngOnInit() {
        this.institutionID = this.route.snapshot.params['iid']
        this.teamID = this.route.snapshot.params['tid']
        this.player_data = this.webService.getPlayer(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid'], this.route.snapshot.params['pid']
        )

        this.authService.user$.subscribe((res) => {
            this.webService.getUserProfile(
                res?.email
            ).subscribe((res) => {
                this.currentUser = res[0].username

            })
        })
    }
}
