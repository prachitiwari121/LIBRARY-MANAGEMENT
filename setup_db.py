from main import app
from application.sec import datastore
from application.models import db, Role, Section
from flask_security import hash_password
from werkzeug.security import generate_password_hash

with app.app_context():
    db.drop_all()
    db.create_all()
    section = Section(section_name="Section 1", section_description="Section 1")
    db.session.add(section)
    datastore.find_or_create_role(name="member", description="User is a Member")
    datastore.find_or_create_role(name="libr", description="User is a Librarian")
    db.session.commit()
    if not datastore.find_user(email="prachi@gmail.com"):
        datastore.create_user(name="Prachi",
                              email="prachi@gmail.com", password=generate_password_hash("pass123"), roles=["libr"],
                              active=True)


    db.session.commit()
