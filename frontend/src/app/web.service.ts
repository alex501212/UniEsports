import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class WebService {

    institution_list: any;
    players_list: any;
    private teamID: any;
    private institutionID: any;
    private commentID: any;
    editProfileField: any;
    changeInstitutionID: any;
    changeTeamID: any;
    changePlayerID: any;
    playerToEdit: any;

    constructor(private http: HttpClient) { }

    login(user: any, pass: any, admin: any) {
        let postData = new FormData()
        postData.append("username", user)
        postData.append("password", pass)
        postData.append("admin", admin)


        return this.http.post('http://localhost:5000/api/v1.0/login', postData)
    }

    loginGmail(user: any, email: any, admin: any) {
        let postData = new FormData()
        postData.append("username", user)
        postData.append("password", email)
        postData.append("admin", admin)
        return this.http.post('http://localhost:5000/api/v1.0/login/gmail', postData)
    }

    getRequests() {
        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.get('http://localhost:5000/api/v1.0/requests', httpOptions)
    }

    getInstitutionsCount() {
        return this.http.get('http://localhost:5000/api/v1.0/institutions/count')
    }

    setInstitutionID(institutionID: any) {
        this.changeInstitutionID = institutionID
    }

    getInstitutionID() {
        return this.changeInstitutionID
    }

    setTeamID(teamID: any) {
        this.changeTeamID = teamID
    }

    getTeamID() {
        return this.teamID
    }

    setPlayerID(playerID: any) {
        this.changePlayerID = playerID
    }

    getPlayerID() {
        return this.changePlayerID
    }

    setEditProfileField(field: any) {
        this.editProfileField = field
    }

    getEditProfileField() {
        return this.editProfileField
    }

    setPlayerToEdit(username: any, role: any) {
        this.playerToEdit = {
            username: username,
            role: role
        }
    }

    getPlayerToEdit() {
        return this.playerToEdit
    }

    editPlayer(editedUsername: any, editedRole: any, iid: any, tid: any, pid: any) {
        let updateData = new FormData()
        updateData.append("editedUsername", editedUsername)
        updateData.append("editedRole", editedRole)
        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.put('http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/players/' + pid, updateData, httpOptions)
    }

    addNewTeam(iid: any, teamName: any, gameName: any) {
        let postData = new FormData()
        postData.append("teamName", teamName)
        postData.append("gameName", gameName)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.post('http://localhost:5000/api/v1.0/institutions/' + iid + '/teams', postData, httpOptions)
    }

    deleteTeam(iid: any, tid: any) {
        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.delete(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid, httpOptions
        )
    }

    editProfile(email: any, editedField: any) {
        let updateData = new FormData()
        updateData.append("email", email)
        updateData.append("fieldToEdit", this.editProfileField.id)
        updateData.append("editedField", editedField)
        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.put('http://localhost:5000/api/v1.0/profile/edit', updateData, httpOptions)
    }

    getUserProfile(email: any) {
        let postData = new FormData()
        postData.append("email", email)

        return this.http.post('http://localhost:5000/api/v1.0/profile', postData)
    }

    followUser(thisUser: any, user: any) {
        let updateData = new FormData()
        updateData.append("username", thisUser)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.put('http://localhost:5000/api/v1.0/profile/' + user, updateData, httpOptions)
    }

    unfollowUser(thisUser: any, user: any) {
        let updateData = new FormData()
        updateData.append("username", thisUser)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.post('http://localhost:5000/api/v1.0/profile/' + user, updateData, httpOptions)
    }

    getUserProfileByUsername(user: any) {
        let postData = new FormData()
        postData.append("username", user)

        return this.http.post('http://localhost:5000/api/v1.0/profile', postData)
    }

    deleteUserProfile(email: any) {
        let deleteData = new FormData()
        deleteData.append("email", email)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.post('http://localhost:5000/api/v1.0/profile/delete', deleteData, httpOptions)
    }

    createUserProfile(email: any, profile: any) {
        let updateData = new FormData()
        updateData.append("email", email)
        updateData.append("username", profile.username)
        updateData.append("forename", profile.forename)
        updateData.append("surname", profile.surname)
        updateData.append("university", profile.university)
        updateData.append("grad_year", profile.grad_year)

        if (profile.lol_account_name) {
            updateData.append("lol_account_name", profile.lol_account_name)

        } else {
            updateData.append("lol_account_name", "none")
        }

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.put('http://localhost:5000/api/v1.0/profile/create', updateData, httpOptions)
    }

    createUserGmail(email: any, username: any) {
        let postData = new FormData()
        postData.append("email", email)
        postData.append("username", username)

        return this.http.post('http://localhost:5000/api/v1.0/gmail', postData)

    }

    searchInstitution(term: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/search/' + term.term
        )
    }

    getInstitutions(page: number) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions?pn=' + page
        )
    }

    getInstitution(id: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + id
        )
    }

    getInstitutionsJoinableTeams() {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/joinable'
        )
    }

    getInstitutionAsc() {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/filter/asc'
        )
    }

    getInstitutionDesc() {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/filter/desc'
        )
    }

    addInstitution(institution_name: any, address: any, telephone_num: any, institution_url: any, su_url: any) {
        let postData = new FormData()
        postData.append("institution_name", institution_name)
        postData.append("address", address)
        postData.append("telephone_num", telephone_num)
        postData.append("institution_url", institution_url)
        postData.append("su_url", su_url)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.post('http://localhost:5000/api/v1.0/institutions', postData, httpOptions)
    }

    editInstitution(iid: any, institution_name: any, address: any, telephone_num: any, institution_url: any, su_url: any) {
        let updateData = new FormData()
        updateData.append("institution_name", institution_name)
        updateData.append("address", address)
        updateData.append("telephone_num", telephone_num)
        updateData.append("institution_url", institution_url)
        updateData.append("su_url", su_url)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.put('http://localhost:5000/api/v1.0/institutions/' + iid, updateData, httpOptions)
    }

    editTeam(teamName: any, teamGame: any, iid: any, tid: any) {
        let updateData = new FormData()
        updateData.append("name", teamName)
        updateData.append("game", teamGame)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.put('http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid, updateData, httpOptions)
    }

    deleteInstitution(id: any) {
        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.delete(
            'http://localhost:5000/api/v1.0/institutions/' + id, httpOptions
        )
    }

    getTeams(id: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + id + '/teams'
        )
    }

    getTeamByID(iid: any, tid: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid
        )
    }

    getPlayers(iid: any, tid: any) {
        this.institutionID = iid
        this.teamID = tid
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/players'
        )
    }

    getPlayer(iid: any, tid: any, pid: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/players/' + pid
        )
    }

    getComments(iid: any, tid: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/comments'
        )
    }

    getCommentsNewest(iid: any, tid: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/comments/newest'
        )
    }

    getCommentsOldest(iid: any, tid: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/comments/oldest'
        )
    }

    getCommentsMostVotes(iid: any, tid: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/comments/mostVotes'
        )
    }

    getCommentsLeastVotes(iid: any, tid: any) {
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/comments/leastVotes'
        )
    }

    getComment(iid: any, tid: any, cid: any) {
        this.institutionID = iid
        this.teamID = tid
        this.commentID = cid
        return this.http.get(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/comments/' + cid
        )
    }

    makeTeamRequest(email: any, role: any, iid: any, tid: any) {
        let postData = new FormData()
        postData.append("email", email)
        postData.append("role", role.role)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.post('http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/request', postData, httpOptions)
    }

    addNewPlayer(iid: any, tid: any, user: any, role: any) {
        let postData = new FormData()
        postData.append("username", user)
        postData.append("role", role)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.post('http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/players', postData, httpOptions)
    }

    deletePlayer(iid: any, tid: any, pid: any) {
        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.delete(
            'http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/players/' + pid, httpOptions
        )
    }

    deleteRequest(iid: any, tid: any, rid: any) {
        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.delete('http://localhost:5000/api/v1.0/institutions/' + iid + '/teams/' + tid + '/request/' + rid, httpOptions)
    }

    postComment(comment: any, email: any) {
        let postData = new FormData()
        postData.append("email", email)
        postData.append("comment", comment.comment)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.post('http://localhost:5000/api/v1.0/institutions/' + this.institutionID + '/teams/' + this.teamID + '/comments', postData, httpOptions)
    }

    updateComment(comment: any) {
        let updateData = new FormData()
        updateData.append("comment", comment.comment)

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.put('http://localhost:5000/api/v1.0/institutions/' + this.institutionID + '/teams/' + this.teamID + '/comments/' + this.commentID, updateData, httpOptions)
    }

    deleteComment() {
        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.delete('http://localhost:5000/api/v1.0/institutions/' + this.institutionID + '/teams/' + this.teamID + '/comments/' + this.commentID, httpOptions)
    }

    upvoteComment(cid: any) {
        let updateData = new FormData()
        updateData.append("vote", "1")

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.put('http://localhost:5000/api/v1.0/institutions/' + this.institutionID + '/teams/' + this.teamID + '/comments/' + cid + '/vote', updateData, httpOptions)

    }

    downvoteComment(cid: any) {
        let updateData = new FormData()
        updateData.append("vote", "-1")

        const token = JSON.stringify(sessionStorage.getItem('token'))
        const httpOptions = {
            headers: new HttpHeaders({
                "x-access-token": token,
            })
        }

        return this.http.put('http://localhost:5000/api/v1.0/institutions/' + this.institutionID + '/teams/' + this.teamID + '/comments/' + cid + '/vote', updateData, httpOptions)

    }
}