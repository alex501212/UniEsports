from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
from bson import ObjectId
import jwt
import datetime
from functools import wraps
import bcrypt
import os
from dotenv import load_dotenv
from flask_cors import CORS
import requests
from operator import itemgetter

my_region = 'EUW1'

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

client = MongoClient("mongodb://127.0.0.1:27017")
userDBClient = MongoClient(os.getenv("DATABASE_CONNECTION"))

db = client.uniEsportsDB
cloudDB = userDBClient.uniEsportsDB

institutions = db.institutions
users = cloudDB.users

blacklist = db.blacklist


def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if "x-access-token" in request.headers:
            token = request.headers["x-access-token"]
            token = token[1:]
            token = token[:-1]
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        try:
            data = jwt.decode(
                token, key=app.config["SECRET_KEY"], algorithms=["HS256"])
        except:
            return jsonify({"message": "Token is invalid"}), 401

        bl_token = blacklist.find_one({"token": token})
        if bl_token is not None:
            return make_response(jsonify({"message": "Token has been cancelled"}), 401)
        return func(*args, **kwargs)
    return jwt_required_wrapper


def admin_required(func):
    @wraps(func)
    def admin_required_wrapper(*args, **kwargs):
        if "x-access-token" in request.headers:
            token = request.headers["x-access-token"]
            token = token[1:]
            token = token[:-1]
            data = jwt.decode(token,
                              key=app.config['SECRET_KEY'], algorithms=["HS256"])
            if data["admin"] == "true":
                return func(*args, **kwargs)
            else:
                return make_response(jsonify(
                    {'message': 'Admin access required'}), 401)
        else:
            return jsonify({"message": "Token is invalid"}), 401
    return admin_required_wrapper


@app.route("/api/v1.0/profile", methods=["POST"])
def get_user():
    if "email" in request.form:
        user = users.find_one({"email": request.form["email"]}, {"firstTime_login": 1, "follow_count": 1, "followers": 1,
                              "following": 1, "forename": 1, "surname": 1, "grad_year": 1, "lol_account_name": 1, "university": 1, "username": 1, "password": 1})
        if user is not None:
            user["_id"] = str(user["_id"])
            return make_response(jsonify([user]), 200)
        else:
            return make_response(jsonify({"error": "Invalid email address"}), 404)
    else:
        if "username" in request.form:
            user = users.find_one({"username": request.form["username"]}, {"follow_count": 1, "followers": 1,
                                                                           "following": 1, "forename": 1, "surname": 1, "grad_year": 1, "lol_account_name": 1, "university": 1, "username": 1, "password": 1})
            if user is not None:
                user["_id"] = str(user["_id"])
                return make_response(jsonify([user]), 200)
            else:
                return make_response(jsonify({"error": "Invalid username"}), 404)
        else:
            return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/profile/create",  methods=["PUT"])
@jwt_required
def create_profile():
    if "username" in request.form and \
        "email" in request.form and \
        "forename" in request.form and \
        "surname" in request.form and \
        "university" in request.form and \
        "lol_account_name" in request.form and \
            "grad_year" in request.form:
        result = users.update_one(
            {"email": request.form["email"]}, {
                "$set": {
                    "username": request.form["username"],
                    "forename": request.form["forename"],
                    "surname": request.form["surname"],
                    "university": request.form["university"],
                    "grad_year": request.form["grad_year"],
                    "lol_account_name": request.form["lol_account_name"],
                    "firstTime_login": False,
                    "email": request.form["email"],
                }
            })
        if result.matched_count == 1:
            return make_response(jsonify({}), 200)
        else:
            return make_response(jsonify({"url": "Invalid email address"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/gmail",  methods=["POST"])
def add_user_gmail():
    if "username" in request.form and \
            "email" in request.form:
        new_user = {"username": request.form["username"],
                    "firstTime_login": False,
                    "email": request.form["email"],
                    "forename": "not set",
                    "surname": "not set",
                    "follow_count": 0,
                    "university": "not set",
                    "grad_year": "not set",
                    "email_verified": True,
                    "followers": [],
                    "following": [],
                    }
        users.insert_one(new_user)
        return make_response(jsonify({}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/profile/edit",  methods=["PUT"])
@jwt_required
def edit_profile():
    if "email" in request.form and \
        "fieldToEdit" in request.form and \
            "editedField" in request.form:
        result = users.update_one(
            {"email": request.form["email"]}, {
                "$set": {
                    request.form["fieldToEdit"]: request.form["editedField"],
                }
            })
        if result.matched_count == 1:
            return make_response(jsonify({}), 200)
        else:
            return make_response(jsonify({"url": "Invalid edit field"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/profile/delete",  methods=["POST"])
@jwt_required
def delete_profile():
    if "email" in request.form:
        result = users.delete_one({"email": request.form["email"]})
        if result.deleted_count == 1:
            return make_response(jsonify({}), 204)
        else:
            return make_response(jsonify({"error": "Invalid email address"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions", methods=["GET"])
def show_all_institutions():
    page_num, page_size = 1, 10
    if request.args.get("pn"):
        page_num = int(request.args.get("pn"))
    if request.args.get("ps"):
        page_size = int(request.args.get("ps"))
    page_start = (page_size * (page_num - 1))

    data_to_return = []
    for institution in institutions.find().skip(page_start).limit(page_size):
        institution["_id"] = str(institution["_id"])
        data_to_return.append(institution)

    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/institutions/count", methods=["GET"])
def get_institution_count():
    institution_count = 0
    for institution in institutions.find():
        institution_count = institution_count + 1

    return make_response(jsonify(institution_count), 200)


@app.route("/api/v1.0/institutions/search/<term>", methods=["GET"])
def search_institutions(term):
    institutions_list = institutions.aggregate([
        {
            "$match": {
                "institution_name": {
                    "$regex": term,
                    "$options": "i"
                }
            }
        },
        {
            "$project": {
                "_id": 1,
                "institution_name": 1,
                "address": 1,
                "telephone_num": 1,
                "institution_url": 1,
                "su_url": 1,
                "teams": 1,

            }
        }
    ])
    data_to_return = []
    for institution in institutions_list:
        institution["_id"] = str(institution["_id"])
        data_to_return.append(institution)

    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/institutions/joinable", methods=["GET"])
def get_institutions_joinable_teams():
    institutions_list = institutions.find({
        "teams": {
            "$exists": True,
            "$ne": []
        }
    })

    data_to_return = []
    for institution in institutions_list:
        institution["_id"] = str(institution["_id"])
        data_to_return.append(institution)

    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/institutions/filter/asc", methods=["GET"])
def filter_institutions_asc():
    institutions_list = institutions.find({})

    data_to_return = []
    for institution in institutions_list:
        institution["_id"] = str(institution["_id"])
        data_to_return.append(institution)

        data_to_return = sorted(
            data_to_return, key=itemgetter('institution_name')
        )

    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/institutions/filter/desc", methods=["GET"])
def filter_institutions_desc():
    institutions_list = institutions.find({})

    data_to_return = []
    for institution in institutions_list:
        institution["_id"] = str(institution["_id"])
        data_to_return.append(institution)

    data_to_return = sorted(
        data_to_return, key=itemgetter('institution_name'), reverse=True
    )

    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/institutions/<string:id>", methods=["GET"])
def show_one_institution(id):
    institution = institutions.find_one({"_id": ObjectId(id)})
    if institution is not None:
        institution["_id"] = str(institution["_id"])
        return make_response(jsonify([institution]), 200)
    else:
        return make_response(jsonify({"error": "Invalid institution ID"}), 404)


@app.route("/api/v1.0/institutions", methods=["POST"])
@admin_required
@jwt_required
def add_institution():
    if "institution_name" in request.form and \
        "address" in request.form and \
        "telephone_num" in request.form and \
        "institution_url" in request.form and \
            "su_url" in request.form:
        new_institution = {"institution_name": request.form["institution_name"],
                           "address": request.form["address"],
                           "telephone_num": request.form["telephone_num"],
                           "institution_url": request.form["institution_url"],
                           "su_url": request.form["su_url"],
                           "teams": []
                           }
        new_institution_id = institutions.insert_one(new_institution)
        new_institution_link = "http://localhost:5000/api/v1.0/institutions/" + \
            str(new_institution_id.inserted_id)
        return make_response(jsonify({"url": new_institution_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<string:id>",  methods=["PUT"])
@admin_required
@jwt_required
def edit_institution(id):
    if "institution_name" in request.form and \
        "address" in request.form and \
        "telephone_num" in request.form and \
        "institution_url" in request.form and \
            "su_url" in request.form:
        result = institutions.update_one(
            {"_id": ObjectId(id)}, {
                "$set": {
                    "institution_name": request.form["institution_name"],
                    "address": request.form["address"],
                    "telephone_num": request.form["telephone_num"],
                    "institution_url": request.form["institution_url"],
                    "su_url": request.form["su_url"]
                }
            })
        if result.matched_count == 1:
            edited_institution_link = "http://localhost:5000/api/v1.0/institutions/" + id
            return make_response(jsonify({"url": edited_institution_link}), 200)
        else:
            return make_response(jsonify({"url": "Invalid institution ID"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<string:id>", methods=["DELETE"])
@admin_required
@jwt_required
def delete_institution(id):
    result = institutions.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid institution ID"}), 404)


@app.route("/api/v1.0/institutions/<string:id>/teams", methods=["POST"])
@admin_required
@jwt_required
def add_new_team(id):
    if "teamName" in request.form and \
            "gameName" in request.form:
        new_team = {
            "_id": str(ObjectId()),
            "name": request.form["teamName"],
            "game": request.form["gameName"],
            "players": [],
            "comments": [],
            "requests": []
        }
        institutions.update_one({"_id": ObjectId(id)}, {
            "$push": {"teams": new_team}})
        new_team_link = "http://localhost:5000/api/v1.0/institutions/" + \
            id + "/teams/" + str(new_team["_id"])
        return make_response(jsonify({"url": new_team_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<string:id>/teams", methods=["GET"])
def fetch_all_teams(id):
    data_to_return = []
    institution = institutions.find_one(
        {"_id": ObjectId(id)},
        {"teams": 1, "_id": 0}
    )
    for team in institution["teams"]:
        team["_id"] = str(team["_id"])
        data_to_return.append(team)
    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>", methods=["GET"])
def fetch_one_team(iid, tid):
    institution = institutions.find_one(
        {"teams._id": tid},
        {"_id": 0, "teams.$": 1})
    if institution is None:
        return make_response(jsonify({"error": "Invalid institution ID or team ID"}), 404)

    institution["teams"][0]["_id"] = str(institution["teams"][0]["_id"])
    return make_response(jsonify(institution["teams"][0]), 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>", methods=["PUT"])
@admin_required
@jwt_required
def edit_team(iid, tid):
    if "game" in request.form and \
            "name" in request.form:
        edited_team = {
            "teams.$.game": request.form["game"],
            "teams.$.name": request.form["name"],
        }
        institutions.update_one(
            {"teams._id": tid},
            {"$set": edited_team}
        )
        edit_team_url = "http://localhost:5000/api/v1.0/institutions/" + iid + "/teams/" + tid
        return make_response(jsonify({"url": edit_team_url}), 200)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>", methods=["DELETE"])
@admin_required
@jwt_required
def delete_team(iid, tid):
    result = institutions.update_one(
        {"_id": ObjectId(iid)},
        {"$pull": {"teams": {"_id": tid}}}
    )
    if result.matched_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"url": "Invalid Institution/Team"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments", methods=["GET"])
def fetch_team_comments(iid, tid):
    data_to_return = []
    try:
        institution = institutions.find_one(
            {"_id": ObjectId(iid), "teams._id": str(ObjectId(tid))},
            {"_id": 0, "teams.comments.$": 1}
        )
        for team in institution["teams"]:
            for comment in team["comments"]:
                comment["_id"] = str(comment["_id"])
                data_to_return.append(comment)
        return make_response(jsonify(data_to_return), 200)
    except:
        return make_response(jsonify({}), 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments/leastVotes", methods=["GET"])
def fetch_team_comments_leastVotes(iid, tid):
    data_to_return = []

    try:
        comments = institutions.aggregate([
            {
                "$unwind": "$teams"
            },
            {
                "$unwind": "$teams.comments"
            },
            {
                "$match": {
                    "_id": ObjectId(iid),
                    "teams._id": str(ObjectId(tid))
                }
            },
            {
                "$sort": {
                    "teams.comments.votes": 1
                }
            },
            {
                "$project": {
                    "_id": "$teams.comments._id",
                    "comment": "$teams.comments.comment",
                    "timestamp": "$teams.comments.timestamp",
                    "user": "$teams.comments.user",
                    "votes": "$teams.comments.votes",

                }
            },

        ])
        for comment in comments:
            comment["_id"] = str(comment["_id"])
            data_to_return.append(comment)
        return make_response(jsonify(data_to_return), 200)
    except:
        return make_response(jsonify({}), 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments/mostVotes", methods=["GET"])
def fetch_team_comments_mostVotes(iid, tid):
    data_to_return = []

    try:
        comments = institutions.aggregate([
            {
                "$unwind": "$teams"
            },
            {
                "$unwind": "$teams.comments"
            },
            {
                "$match": {
                    "_id": ObjectId(iid),
                    "teams._id": str(ObjectId(tid))
                }
            },
            {
                "$sort": {
                    "teams.comments.votes": -1
                }
            },
            {
                "$project": {
                    "_id": "$teams.comments._id",
                    "comment": "$teams.comments.comment",
                    "timestamp": "$teams.comments.timestamp",
                    "user": "$teams.comments.user",
                    "votes": "$teams.comments.votes",

                }
            },

        ])
        for comment in comments:
            comment["_id"] = str(comment["_id"])
            data_to_return.append(comment)
        return make_response(jsonify(data_to_return), 200)
    except:
        return make_response(jsonify({}), 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments/oldest", methods=["GET"])
def fetch_team_comments_oldest(iid, tid):
    data_to_return = []

    try:
        comments = institutions.aggregate([
            {
                "$unwind": "$teams"
            },
            {
                "$unwind": "$teams.comments"
            },
            {
                "$match": {
                    "_id": ObjectId(iid),
                    "teams._id": str(ObjectId(tid))
                }
            },
            {
                "$sort": {
                    "teams.comments.timestamp": 1
                }
            },
            {
                "$project": {
                    "_id": "$teams.comments._id",
                    "comment": "$teams.comments.comment",
                    "timestamp": "$teams.comments.timestamp",
                    "user": "$teams.comments.user",
                    "votes": "$teams.comments.votes",

                }
            },

        ])
        for comment in comments:
            comment["_id"] = str(comment["_id"])
            data_to_return.append(comment)
        return make_response(jsonify(data_to_return), 200)
    except:
        return make_response(jsonify({}), 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments/newest", methods=["GET"])
def fetch_team_comments_newest(iid, tid):
    data_to_return = []

    try:
        comments = institutions.aggregate([
            {
                "$unwind": "$teams"
            },
            {
                "$unwind": "$teams.comments"
            },
            {
                "$match": {
                    "_id": ObjectId(iid),
                    "teams._id": str(ObjectId(tid))
                }
            },
            {
                "$sort": {
                    "teams.comments.timestamp": -1
                }
            },
            {
                "$project": {
                    "_id": "$teams.comments._id",
                    "comment": "$teams.comments.comment",
                    "timestamp": "$teams.comments.timestamp",
                    "user": "$teams.comments.user",
                    "votes": "$teams.comments.votes",

                }
            },

        ])
        for comment in comments:
            comment["_id"] = str(comment["_id"])
            data_to_return.append(comment)
        return make_response(jsonify(data_to_return), 200)
    except:
        return make_response(jsonify({}), 200)


@app.route("/api/v1.0/requests", methods=["GET"])
@admin_required
@jwt_required
def fetch_all_requests():
    data_to_return = []
    institutions_list = institutions.find(
        {}
    )
    for institution in institutions_list:
        for team in institution["teams"]:
            for request in team["requests"]:
                request["_id"] = str(request["_id"])
                data_to_return.append(request)
    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/request", methods=["POST"])
@jwt_required
def add_new_request(iid, tid):
    if "email" in request.form and \
            "role" in request.form:
        user = users.find_one({"email": request.form["email"]}, {
            "_id": 0, "username": 1})
        institution = institutions.find_one({"_id": ObjectId(iid)}, {
            "_id": 0, "institution_name": 1})
        team = institutions.find_one({"teams._id": str(ObjectId(tid))},
                                     {"_id": 0, "teams.name": 1})
        new_request = {
            "_id": str(ObjectId()),
            "username": user['username'],
            "institutionID": str(ObjectId(iid)),
            "institution_name": institution["institution_name"],
            "teamID": str(ObjectId(tid)),
            "team": team['teams'][0]['name'],
            "role": request.form["role"],
            "timestamp": datetime.datetime.utcnow(),
        }
        institutions.update_one({"_id": ObjectId(iid), "teams._id": str(ObjectId(tid))}, {
            "$push": {"teams.$.requests": new_request}})
        return make_response(jsonify({}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/request/<rid>", methods=["DELETE"])
@admin_required
@jwt_required
def delete_request(iid, tid, rid):
    result = institutions.update_one(
        {"_id": ObjectId(iid), "teams._id": str(ObjectId(tid))},
        {
            "$pull": {
                "teams.$.requests": {
                    "_id": str(ObjectId(rid))
                }
            }
        }
    )
    if result.matched_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"url": "Invalid Institution/Team/Request ID"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments", methods=["POST"])
@jwt_required
def add_new_comment(iid, tid):
    if "email" in request.form and \
            "comment" in request.form:
        user = users.find_one({"email": request.form["email"]}, {
            "_id": 0, "username": 1})
        new_comment = {
            "_id": str(ObjectId()),
            "user": user['username'],
            "comment": request.form["comment"],
            "votes": 0,
            "timestamp": datetime.datetime.utcnow(),
        }
        institutions.update_one({"_id": ObjectId(iid), "teams._id": str(ObjectId(tid))}, {
            "$push": {"teams.$.comments": new_comment}})
        new_comment_link = "http://localhost:5000/api/v1.0/institutions/" + \
            iid + "/teams/" + tid + "/comments/" + str(new_comment["_id"])
        return make_response(jsonify({"url": new_comment_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments/<cid>", methods=["GET"])
def fetch_one_comment(iid, tid, cid):
    data_to_return = []
    pipeline = [
        {
            "$unwind": "$teams"
        },
        {
            "$unwind": "$teams.comments"
        },
        {
            "$match": {
                "_id": ObjectId(iid),
                "teams._id": str(ObjectId(tid)),
                "teams.comments._id": str(ObjectId(cid))
            }
        },
        {
            "$project": {
                "_id": "$teams.comments._id",
                "comment": "$teams.comments.comment",
                "user": "$teams.comments.user",
                "timestamp": "$teams.comments.timestamp",
                "votes": "$teams.comments.votes",
            }
        },
        {
            "$limit": 1
        }
    ]
    for comment in institutions.aggregate(pipeline):
        if comment is None:
            return make_response(jsonify({"error": "Invalid institution ID, team ID or comment ID"}), 404)
        data_to_return.append(comment)
    return make_response(data_to_return, 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments/<cid>", methods=["PUT"])
@jwt_required
def edit_comment(iid, tid, cid):
    if "comment" in request.form:
        institutions.update_one({
            "_id": ObjectId(iid)
        },
            {
            "$set": {
                "teams.$[teams].comments.$[comments].comment": request.form["comment"],
            }
        },

            upsert=False,
            array_filters=[
                {
                    "teams._id": {
                        "$eq": str(ObjectId(tid))
                    }
                },
                {
                    "comments._id": {
                        "$eq": str(ObjectId(cid))
                    }
                }
        ]
        )
        edit_comment_url = "http://localhost:5000/api/v1.0/institutions/" + \
            iid + "/teams/" + tid + "/comments/" + cid
        return make_response(jsonify({"url": edit_comment_url}), 200)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments/<cid>/vote", methods=["PUT"])
@jwt_required
def vote_comment(iid, tid, cid):
    if "vote" in request.form:
        institutions.update_one({
            "_id": ObjectId(iid)
        },
            {
            "$inc": {
                "teams.$[teams].comments.$[comments].votes": int(request.form["vote"]),

            }
        },

            upsert=False,
            array_filters=[
                {
                    "teams._id": {
                        "$eq": str(ObjectId(tid))
                    }
                },
                {
                    "comments._id": {
                        "$eq": str(ObjectId(cid))
                    }
                }
        ]
        )
        return make_response(jsonify({}), 200)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/profile/<user>", methods=["PUT"])
@jwt_required
def follow_user(user):
    if "username" in request.form:
        users.update_one({"username": user}, {
            "$push": {"followers": request.form["username"]}})

        users.update_one({"username": request.form["username"]}, {
            "$push": {"following": user}})

        users.update_one({
            "username": user
        },
            {
            "$inc": {
                "follow_count": 1,

            }
        })

        return make_response(jsonify({}), 200)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/profile/<user>", methods=["POST"])
@jwt_required
def unfollow_user(user):
    if "username" in request.form:
        users.update_one(
            {"username": user},
            {"$pull": {"followers": request.form["username"]}}
        )

        users.update_one(
            {"username": request.form["username"]},
            {"$pull": {"following": user}}
        )

        users.update_one({
            "username": user
        },
            {
            "$inc": {
                "follow_count": -1,

            }
        })

        return make_response(jsonify({}), 200)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/comments/<cid>", methods=["DELETE"])
@jwt_required
def delete_comment(iid, tid, cid):
    result = institutions.update_one(
        {"_id": ObjectId(iid), "teams._id": str(ObjectId(tid))},
        {
            "$pull": {
                "teams.$.comments": {
                    "_id": str(ObjectId(cid))
                }
            }
        }
    )
    if result.matched_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"url": "Invalid Institution/Team/Comment ID"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/players", methods=["POST"])
@admin_required
@jwt_required
def add_new_player(iid, tid):
    if "username" in request.form and \
            "role" in request.form:
        new_player = {
            "_id": str(ObjectId()),
            "username": request.form["username"],
            "role": request.form["role"],
        }
        institutions.update_one({"_id": ObjectId(iid), "teams._id": str(ObjectId(tid))}, {
            "$push": {"teams.$.players": new_player}})
        new_player_link = "http://localhost:5000/api/v1.0/institutions/" + \
            iid + "/teams/" + tid + "/players/" + str(new_player["_id"])
        return make_response(jsonify({"url": new_player_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/players", methods=["GET"])
def fetch_team_players(iid, tid):
    data_to_return = []
    institution = institutions.find_one(
        {"_id": ObjectId(iid), "teams._id": str(ObjectId(tid))},
        {"_id": 0, "teams.players.$": 1}
    )
    for team in institution["teams"]:
        for player in team["players"]:
            player["_id"] = str(player["_id"])
            data_to_return.append(player)
    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/players/<pid>", methods=["GET"])
def fetch_one_player(iid, tid, pid):
    data_to_return = []
    pipeline = [
        {
            "$unwind": "$teams"
        },
        {
            "$unwind": "$teams.players"
        },
        {
            "$match": {
                "_id": ObjectId(iid),
                "teams._id": str(ObjectId(tid)),
                "teams.players._id": str(ObjectId(pid))
            }
        },
        {
            "$project": {
                "_id": "$teams.players._id",
                "role": "$teams.players.role",
                "username": "$teams.players.username",
            }
        },
        {
            "$limit": 1
        }
    ]
    for player in institutions.aggregate(pipeline):
        if player is None:
            return make_response(jsonify({"error": "Invalid institution ID, team ID or player ID"}), 404)
        data_to_return.append(player)

        # get details of player from the user database
        player_details = users.find_one({"username": player["username"]}, {
                                        "_id": 0, "forename": 1, "surname": 1, "follow_count": 1, "grad_year": 1, "lol_account_name": 1})
        data_to_return.append(player_details)

        if player_details["lol_account_name"] != "":
            try:
                # get league of legends account information from lol_account_name provided in user database
                id_request_url = "https://" + my_region + \
                    ".api.riotgames.com/lol/summoner/v4/summoners/by-name/" + \
                    player_details["lol_account_name"]
                apikey = os.getenv("RIOT_API_KEY")

                # get summoner id
                summoner = requests.get(id_request_url, headers={
                                        "X-Riot-Token": apikey})
                stats_request_url = "https://" + my_region + \
                    ".api.riotgames.com/lol/league/v4/entries/by-summoner/" + \
                    summoner.json()["id"] + "?api_key=" + apikey

                # get league of legends account ranked data
                summoner_data = requests.get(stats_request_url)

                for data in summoner_data.json():
                    data_to_return.append(data)
            except:
                return make_response(jsonify(data_to_return), 200)

    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/players/<pid>", methods=["PUT"])
@admin_required
@jwt_required
def edit_player(iid, tid, pid):
    if "editedUsername" in request.form and \
            "editedRole" in request.form:
        institutions.update_one({
            "_id": ObjectId(iid)
        },
            {
            "$set": {
                "teams.$[teams].players.$[players].username": request.form["editedUsername"],
                "teams.$[teams].players.$[players].role": request.form["editedRole"],
            }
        },

            upsert=False,
            array_filters=[
                {
                    "teams._id": {
                        "$eq": str(ObjectId(tid))
                    }
                },
                {
                    "players._id": {
                        "$eq": str(ObjectId(pid))
                    }
                }
        ]
        )
        edited_player_url = "http://localhost:5000/api/v1.0/institutions/" + \
            iid + "/teams/" + tid + "/comments/" + pid
        return make_response(jsonify({"url": edited_player_url}), 200)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/institutions/<iid>/teams/<tid>/players/<pid>", methods=["DELETE"])
@admin_required
@jwt_required
def delete_player(iid, tid, pid):
    result = institutions.update_one(
        {"_id": ObjectId(iid), "teams._id": str(ObjectId(tid))},
        {
            "$pull": {
                "teams.$.players": {
                    "_id": str(ObjectId(pid))
                }
            }
        }
    )
    if result.matched_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"url": "Invalid Institution/Team/Player ID"}), 404)


@app.route('/api/v1.0/login', methods=["POST"])
def login():
    user = users.find_one({"username": request.form["username"]})
    if user is not None:
        print(user["password"])
        print(request.form["password"])
        if user["password"] == request.form["password"]:
            token = jwt.encode(
                {"user": request.form["username"],
                 "admin": request.form["admin"],
                 "exp": datetime.datetime.utcnow() +
                 datetime.timedelta(minutes=30)
                 }, app.config["SECRET_KEY"])
            return make_response(jsonify({"token": token}), 200)
        else:
            return make_response(jsonify({"message": "Bad password"}), 401)
    else:
        return make_response(jsonify({"message": "Bad username"}), 401)


@app.route('/api/v1.0/login/gmail', methods=["POST"])
def login_gmail():
    user = users.find_one({"username": request.form["username"]})
    if user is not None:
        token = jwt.encode(
            {"user": request.form["username"],
             "admin": request.form["admin"],
             "exp": datetime.datetime.utcnow() +
             datetime.timedelta(minutes=30)
             }, app.config["SECRET_KEY"])
        return make_response(jsonify({"token": token}), 200)
    else:
        return make_response(jsonify({"message": "Bad username"}), 401)


@app.route('/api/v1.0/logout', methods=["GET"])
@jwt_required
def logout():
    token = request.headers["x-access-token"]
    blacklist.insert_one({"token": token})
    return make_response(jsonify({"message": "Logout successful"}), 200)


if __name__ == "__main__":
    app.run(debug=True)
