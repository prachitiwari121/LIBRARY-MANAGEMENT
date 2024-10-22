from sqlalchemy import or_
from werkzeug.security import check_password_hash, generate_password_hash
from flask import current_app as app, jsonify, request, render_template
from flask.json import dump
from flask_restful import marshal, fields
from .models import User, db
from .sec import datastore
from flask_security import auth_required, roles_required

@app.get('/')
def index():
    return render_template('index.html')


@app.post('/user-login')
def user_login():
    request_data = request.get_json()
    user_email = request_data.get('email')
    if not user_email:
        return jsonify({"message": "Oops! You forgot to provide your email."}), 400

    user_record = datastore.find_user(email=user_email)

    if not user_record:
        return jsonify({"message": "Uh-oh! We couldn't find any user with that email. Are you sure you typed it correctly?"}), 404

    if "member" not in user_record.roles:
        return jsonify({"message": "Sorry! It looks like you're not a member. Please sign up to join us."}), 404

    if check_password_hash(user_record.password, request_data.get("password")):
        return jsonify({
            "token": user_record.get_auth_token(), 
            "email": user_record.email, 
            "role": user_record.roles[0].name,
            "message": "Welcome back! You're logged in successfully."
        })
    else:
        return jsonify({"message": "Oh no! The password you entered is incorrect. Please try again."}), 400


@app.post('/lib-login')
def librarian_login():
    request_data = request.get_json()
    librarian_email = request_data.get('email')
    if not librarian_email:
        return jsonify({"message": "Hey! You forgot to enter your email."}), 400

    librarian_record = datastore.find_user(email=librarian_email)
    if not librarian_record:
        return jsonify({"message": "Hmm... We couldn't find a librarian with that email. Double-check and try again."}), 404

    if "libr" not in librarian_record.roles:
        return jsonify({"message": "Whoops! It looks like you're not a librarian. Are you in the right place?"}), 404

    if check_password_hash(librarian_record.password, request_data.get("password")):
        return jsonify({
            "token": librarian_record.get_auth_token(), 
            "email": librarian_record.email, 
            "role": librarian_record.roles[0].name,
            "message": "Welcome back, librarian! You're logged in successfully."
        })
    else:
        return jsonify({"message": "Yikes! The password you entered is wrong. Please give it another go."}), 400


@app.post('/user-register')
def user_register():
    request_data = request.get_json()
    user_email = request_data.get('email')
    user_name = request_data.get('name')
    user_password = request_data.get('password')
    if not user_email:
        return jsonify({"message": "Oh no! You forgot to enter your email."}), 400

    if not user_name:
        return jsonify({"message": "Oops! You didn't provide your name."}), 400

    if not user_password:
        return jsonify({"message": "Hey! You need to set a password."}), 400

    user_exists = User.query.filter_by(email=user_email).count()
    if user_exists:
        return {"message": "This email is already taken. Try using a different one."}, 401

    new_user = datastore.create_user(email=user_email, name=user_name, password=generate_password_hash(user_password), active=True, roles=["member"])

    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        "token": new_user.get_auth_token(), 
        "email": new_user.email, 
        "role": new_user.roles[0].name,
        "message": "Hooray! You're registered successfully. Welcome aboard!"
    }), 201
