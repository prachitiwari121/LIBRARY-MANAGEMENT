
from flask_login import current_user
from flask_security import RoleMixin, UserMixin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


# Initialize the database
db = SQLAlchemy()

# Association table for Users and Roles
class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))


# Role model with RoleMixin for Flask-Security
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))


# User model with UserMixin for Flask-Security
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(30))
    email = db.Column(db.String(), unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)

    # Establish many-to-many relationship with roles
    roles = db.relationship('Role', secondary='roles_users',
                            backref=db.backref('users', lazy='dynamic'))


# Book model representing a book in the library
class Book(db.Model):
    __tablename__ = 'books'
    book_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    author = db.Column(db.String)
    title = db.Column(db.String(100))
    section_id = db.Column(db.Integer, db.ForeignKey('sections.section_id'))
    content = db.Column(db.Text())
    image = db.Column(db.String)
    pdf = db.Column(db.String)
    feedback = db.Column(db.String)

    # Relationship with Section model
    section = db.relationship('Section', backref='books')
    feedbacks = db.relationship('BookFeedback', backref='book', lazy='dynamic')


# feedback table
class BookFeedback(db.Model):
    __tablename__ = 'book_feedbacks'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('books.book_id'))
    feedback = db.Column(db.Text(), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship with User model
    user = db.relationship('User', backref='feedbacks')




    # Calculate the number of pending books for the current user
    @property
    def num_of_book_pending_for_me(self):
        approved_books = BookRequest.query.filter_by(
            user_id=current_user.id,
            is_approved=True,
            is_revoked=False,
            is_returned=False
        ).count()

        pending_books = BookRequest.query.filter_by(
            user_id=current_user.id,
            is_approved=False,
            is_rejected=False,
            is_revoked=False,
            is_returned=False
        ).count()

        return approved_books + pending_books

    # Check if the book is approved for the current user
    @property
    def is_approved_for_me(self):
        approved_requests = BookRequest.query.filter_by(
            book_id=self.book_id,
            is_approved=True,
            is_returned=False
        ).all()

        # Check if current user ID is in the list of user IDs with approved requests
        return current_user.id in [req.user_id for req in approved_requests]

    # Get the request ID for the current user, if approved
    @property
    def request_id(self):
        if self.is_approved_for_me:
            request = BookRequest.query.filter_by(
                book_id=self.book_id,
                is_approved=True,
                is_returned=False,
                user_id=current_user.id
            ).first()
            return request.id if request else None
        return None

    # Check if the book request is pending for the current user
    @property
    def is_pending_for_me(self):
        pending_requests = BookRequest.query.filter_by(
            book_id=self.book_id,
            is_approved=False,
            is_rejected=False,
            is_revoked=False
        ).all()

        # Return True if the current user's ID is in the list of pending requests
        return current_user.id in [req.user_id for req in pending_requests]


# Model representing a book request
class BookRequest(db.Model):
    __tablename__ = 'book_requests'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('books.book_id'))
    is_approved = db.Column(db.Boolean, default=False, nullable=True)
    is_rejected = db.Column(db.Boolean, default=False, nullable=True)
    is_returned = db.Column(db.Boolean, default=False, nullable=True)
    is_revoked = db.Column(db.Boolean, default=False, nullable=True)
    rejection_reason = db.Column(db.String(100), nullable=True)
    issue_date = db.Column(db.Date, nullable=True)
    return_date = db.Column(db.Date, nullable=True)

    # Relationships with User and Book models
    user = db.relationship('User', backref='requests')
    book = db.relationship('Book', backref='requests')


# Model representing a section in the library
class Section(db.Model):
    __tablename__ = 'sections'
    section_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    section_name = db.Column(db.String(25))
    section_description = db.Column(db.String(50))
    section_icon = db.Column(db.String(10), nullable=True)
    date_created = db.Column(db.Date)


# Model representing daily visits by users
class DailyVisit(db.Model):
    __tablename__ = 'daily_visits'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    date = db.Column(db.Date)

    # Relationship with User model
    user = db.relationship('User', backref='visits')
