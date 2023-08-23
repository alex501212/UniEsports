import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss']
})
export class CommentComponent {

    comments: any;
    editCommentForm: any;
    institutionID: any;
    teamID: any;
    commentID: any;

    constructor(private webService: WebService, private route: ActivatedRoute, private formBuilder: FormBuilder) { }

    ngOnInit() {
        this.editCommentForm = this.formBuilder.group({
            comment: ['', Validators.required],
        });
        this.comments = this.webService.getComment(
            this.route.snapshot.params['iid'], this.route.snapshot.params['tid'], this.route.snapshot.params['cid']
        )
        this.institutionID = this.route.snapshot.params['iid']
        this.teamID = this.route.snapshot.params['tid']
        this.commentID = this.route.snapshot.params['cid']
    }

    onSubmit() {
        this.webService.updateComment(this.editCommentForm.value)
            .subscribe((response: any) => {
                this.editCommentForm.reset();
                window.history.back();
            })

    }

    isInvalid(control: any) {
        return this.editCommentForm.controls[control].invalid &&
            this.editCommentForm.controls[control].touched
    }

    isUntouched() {
        return this.editCommentForm.controls.comment.pristine
    }

    isIncomplete() {
        return this.isInvalid("comment") ||
            this.isUntouched()
    }

    onDelete() {
        this.webService.deleteComment()
            .subscribe((response: any) => {
                window.history.back();
            })
    }
}
