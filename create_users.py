from pymongo import MongoClient
import bcrypt

client = MongoClient("mongodb://127.0.0.1:27017")
db = client.uniEsportsDB
users = db.users

staff_list = [
    {
        "forename": "Alex",
        "surname": "Patterson",
        "username": "AleXP123",
        "password": b"alex_p",
        "email": "alex@patterson.com",
        "follow_count": 0,
        "university": "University of Ulster",
        "grad_year": "2023",
        "lol_account_name": "AleXP",
        "followers": [],
        "following": []
    },
    {
        "forename": "Jeff",
        "surname": "Gordon",
        "username": "JeffyG",
        "password": b"jeff_g",
        "email": "jeff@gordon.com",
        "follow_count": 0,
        "university": "University of Ulster",
        "grad_year": "2024",
        "lol_account_name": "Crodieal",
        "followers": [],
        "following": []
    },
    {
        "forename": "Karl",
        "surname": "Karlson",
        "username": "karlyK",
        "password": b"karl_k",
        "email": "karl@karlson.com",
        "follow_count": 0,
        "university": "University of Ulster",
        "grad_year": "2023",
        "lol_account_name": "Fidgoldci",
        "followers": [],
        "following": []
    },
    {
        "forename": "Daniel",
        "surname": "Trindle",
        "username": "daniel890",
        "password": b"daniel_t",
        "email": "daniel@drater.com",
        "follow_count": 0,
        "university": "University of Ulster",
        "grad_year": "2025",
        "lol_account_name": "BaseGameAt15",
        "followers": [],
        "following": []
    },
    {
        "forename": "David",
        "surname": "Strimmer",
        "username": "DaviDS",
        "password": b"david_s",
        "email": "david@strimmer.com",
        "follow_count": 0,
        "university": "University of Ulster",
        "grad_year": "2025",
        "lol_account_name": "No Recess",
        "followers": [],
        "following": []
    },
    {
        "forename": "Jamie",
        "surname": "Powel",
        "username": "JamieP",
        "password": b"jamie_p",
        "email": "jamie@powel.com",
        "follow_count": 0,
        "university": "Queen's University of Belfast",
        "grad_year": "2026",
        "lol_account_name": "yoaloa",
        "followers": [],
        "following": []
    }
]

for new_user in staff_list:
    new_user["password"] = bcrypt.hashpw(
        new_user["password"], bcrypt.gensalt())
    users.insert_one(new_user)
