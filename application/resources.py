import base64
import random
from datetime import datetime
from io import BytesIO
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt


from flask import request, jsonify
from flask_restful import Resource, Api, reqparse, fields, marshal
from flask_security import current_user, auth_required
from sqlalchemy import text
from werkzeug.utils import secure_filename

from application.models import Book, db, User, Section, BookRequest, DailyVisit

# Function to log daily visits for members with additional condition checks
def log_member_visits():
    if current_user and "member" in current_user.roles:
        today = datetime.today().date()
        existing_visit = DailyVisit.query.filter_by(user_id=current_user.id, date=today).first()
        if not existing_visit:
            visit_entry = DailyVisit(user_id=current_user.id, date=datetime.today())
            db.session.add(visit_entry)
            db.session.commit()
        else:
            print("Visit already logged for today")  # Added for debugging/logging purposes

# Setting up the API with a specific prefix
api = Api(prefix='/api')

# User representation fields for API responses
user_representation = {
    'id': fields.Integer,
    'name': fields.String,
    'email': fields.String
}

# Section representation fields for API responses
section_representation = {
    'section_id': fields.Integer,
    'section_name': fields.String,
    'section_icon': fields.String,
    'section_description': fields.String,
    'date_created': fields.DateTime(dt_format='iso8601'),
    'books': fields.Nested({
        'book_id': fields.Integer,
        'author': fields.String,
        'section_id': fields.Integer,
        'title': fields.String,
        'content': fields.String,
        'image': fields.String,
        'is_pending_for_me': fields.Boolean,
        'is_approved_for_me': fields.Boolean,
        'num_of_book_pending_for_me': fields.Integer,
    })
}

# Book representation fields for API responses
book_representation = {
    'book_id': fields.Integer,
    'author': fields.String,
    'section_id': fields.Integer,
    'title': fields.String,
    'content': fields.String,
    'image': fields.String,
    'pdf': fields.String,
    'section': fields.Nested(section_representation),
    'is_pending_for_me': fields.Boolean,
    'is_approved_for_me': fields.Boolean,
    'request_id': fields.Raw,
    'requests': fields.Nested({
        'id': fields.Integer,
        'user_id': fields.Integer,
        'user': fields.Nested(user_representation),
        'book_id': fields.Integer,
        'is_approved': fields.Boolean,
        'is_rejected': fields.Boolean,
        'is_returned': fields.Boolean,
        'is_revoked': fields.Boolean,
        'rejection_reason': fields.String,
        'issue_date': fields.DateTime(dt_format='iso8601'),
        'return_date': fields.DateTime(dt_format='iso8601'),
    }),
    'num_of_book_pending_for_me': fields.Integer,
}

# Book request representation fields for API responses
book_request_representation = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'book_id': fields.Integer,
    'is_approved': fields.Boolean,
    'is_rejected': fields.Boolean,
    'is_returned': fields.Boolean,
    'is_revoked': fields.Boolean,
    'rejection_reason': fields.String,
    'book': fields.Nested(book_representation),
    'user': fields.Nested(user_representation),
    'issue_date': fields.DateTime(dt_format='iso8601'),
    'return_date': fields.DateTime(dt_format='iso8601')
}

# Resource class for handling book-related operations
class BookResource(Resource):

    @auth_required("token")
    def get(self, book_id):
        book = Book.query.get(book_id)
        if not book:
            return {"message": "Book not found"}, 404
        return marshal(book, book_representation)

    @auth_required("token")
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('author', location="form", required=True, help="Author's name is required")
            parser.add_argument('title', location="form", required=True, help="Book title is required")
            parser.add_argument('content', location="form", required=True, help="Book Description is required")
            parser.add_argument('section', type=int, location="form", required=True, help="Section ID is required")

            args = parser.parse_args()

            # Image handling with additional logic
            file = request.files.get('image')
            print("file")
            print(file)
            filename = ""
            if file:
                filename = str(random.randint(100000, 9999999)) + secure_filename(file.filename)
                file.save(f"static/uploaded/{filename}")
            else:
                if args['section'] % 2 == 0:  # Example of an added condition
                    filename = "default.png"
                else:
                    filename = "default_alt.png"  # Another default option based on a condition
                    
            # Image handling with additional logic
            pdf_file = request.files.get('pdf')
            print("PDF TESTING...")
            print(pdf_file)
            pdf_file_name = ""
            if pdf_file:
                pdf_file_name = str(random.randint(100000, 9999999)) + secure_filename(pdf_file.pdf_file_name)
                pdf_file.save(f"static/uploaded/{pdf_file_name}")

            # Creating new book entry
            new_book = Book(
                author=args['author'],
                title=args['title'],
                content=args['content'],
                section_id=args['section'],
                image=filename,
                pdf=pdf_file_name
            )

            db.session.add(new_book)
            db.session.commit()

            return {"message": "Book added successfully", "book_id": new_book.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error occurred while adding the book: {str(e)}"}, 500

    @auth_required("token")
    def delete(self, book_id):
        try:
            # Deleting related book requests before deleting the book itself
            associated_requests = BookRequest.query.filter_by(book_id=book_id).delete()
            deleted_book = Book.query.filter_by(book_id=book_id).delete()
            if associated_requests or deleted_book:
                db.session.commit()
                return {"message": "Book and related requests deleted successfully"}, 200
            else:
                return {"message": "No related requests found; only book deleted"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error occurred while deleting: {str(e)}"}, 500

    @auth_required("token")
    def put(self, book_id):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('author', location="form", required=True, help="Author's name is required")
            parser.add_argument('title', location="form", required=True, help="Book title is required")
            parser.add_argument('content', location="form", required=True, help="Book Description is required")
            parser.add_argument('section', location="form", required=True, help="Section ID is required")
            args = parser.parse_args()

            book = Book.query.get(book_id)
            if not book:
                return {"message": "Book not found"}, 404

            # Handling image updates with conditions
            file = request.files.get('image')
            if file:
                filename = str(random.randint(100000, 9999999)) + secure_filename(file.filename)
                file.save(f"static/uploaded/{filename}")
                book.image = filename
            else:
                if args['title'].startswith("A"):  # Example condition to avoid unnecessary changes
                    book.image = book.image  # Keeping the same image
                else:
                    book.image = "default_update.png"  # Default update if no image provided

            # Updating book attributes
            book.author = args['author']
            book.title = args['title']
            book.content = args['content']
            book.section_id = args['section']

            db.session.commit()
            return {"message": "Book updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error occurred while updating: {str(e)}"}, 500

# Resource class for handling book list operations
class BookListResource(Resource):
    @auth_required("token")
    def get(self):
        log_member_visits()
        books = Book.query.order_by(text("book_id desc")).all()
        return marshal(books, book_representation)

    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('author', location="form", required=True, help="Author's name is required")
        parser.add_argument('title', location="form", required=True, help="Book title is required")
        parser.add_argument('content', location="form", required=True, help="Book Description is required")
        parser.add_argument('section', location="form", required=True, help="Section ID is required")

        args = parser.parse_args()

        if not all([args['author'], args['title'], args['content'], args['section']]):
            return {"message": "All fields are required"}, 400

        # Handling image upload with additional conditions
        file = request.files.get('image')
        filename = ""
        if file:
            filename = str(random.randint(100000, 9999999)) + secure_filename(file.filename)
            file.save(f"static/uploaded/{filename}")
            
        # Handling image upload with additional conditions
        pdf_file = request.files.get('pdf')
        pdf_filename = ""
        if pdf_file:
            pdf_filename = str(random.randint(100000, 9999999)) + secure_filename(pdf_file.filename)
            pdf_file.save(f"static/uploaded/{pdf_filename}")

        new_book = Book(
            author=args['author'],
            title=args['title'],
            content=args['content'],
            section_id=args['section'],
            image=filename,
            pdf=pdf_filename
        )
        db.session.add(new_book)
        db.session.commit()
        return marshal(new_book, book_representation), 201

# Resource class for handling section-related operations
class SectionListResource(Resource):
    @auth_required("token")
    def get(self):
        sections = Section.query.all()
        if not sections:  # Added condition for empty sections
            return {"message": "No sections found"}, 404
        return marshal(sections, section_representation)

    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('section_name', required=True, help="Section name is required")
        parser.add_argument('section_description', required=True, help="Section description is required")
        args = parser.parse_args()

        if not args.get('section_name'):
            return {"message": "Section name is required"}, 400

        new_section = Section(
            section_name=args['section_name'],
            section_icon="",
            section_description=args['section_description'],
            date_created=datetime.today()
        )
        db.session.add(new_section)
        db.session.commit()
        return {"message": "Section created successfully"}, 201

# Resource class for handling section details
class SectionDetailResource(Resource):
    @auth_required("token")
    def get(self, section_id):
        section = Section.query.get(section_id)
        if not section:
            return {"message": "Section not found"}, 404
        return marshal(section, section_representation)

    @auth_required("token")
    def put(self, section_id):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('section_name', required=True, help="Section name is required")
            parser.add_argument('section_description', required=True, help="Section description is required")
            args = parser.parse_args()

            section = Section.query.get(section_id)
            if not section:
                return {"message": "Section not found"}, 404

            section.section_name = args['section_name']
            section.section_description = args['section_description']
            db.session.commit()
            return {"message": "Section updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error occurred while updating: {str(e)}"}, 500

    @auth_required("token")
    def delete(self, section_id):
        try:
            section = Section.query.get(section_id)
            if not section:
                return {"message": "Section not found"}, 404

            if section.books:  # Prevent deletion if the section contains books
                return {"message": "Section contains books and cannot be deleted"}, 400

            db.session.delete(section)
            db.session.commit()
            return {"message": "Section deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error occurred while deleting: {str(e)}"}, 500

# Resource class for handling user-specific book requests
class UserRequestResource(Resource):
    @auth_required("token")
    def get(self):
        user_requests = BookRequest.query.filter_by(user_id=current_user.id).all()
        if not user_requests:
            return {"message": "No requests found"}, 404
        return marshal(user_requests, book_request_representation)

# Resource class for submitting new book requests
class BookRequestResource(Resource):
    @auth_required("token")
    def post(self, book_id):
        # Check if the user has already requested this book
        existing_request = BookRequest.query.filter_by(user_id=current_user.id, book_id=book_id).first()
        if existing_request:
            return {"message": "Request already exists"}, 400
        
        # Check if the user has reached the maximum allowed book requests
        max_requests = 5
        current_requests = BookRequest.query.filter_by(user_id=current_user.id).count()
        if current_requests >= max_requests:
            return {"message": f"You have reached the maximum number of {max_requests} book requests."}, 400

        # Add the new book request
        try:
            request_entry = BookRequest(user_id=current_user.id, book_id=book_id)
            db.session.add(request_entry)
            db.session.commit()
            return {"message": "Book requested successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred while requesting the book: " + str(e)}, 500

# Resource class for handling the list of book requests
class BookRequestListResource(Resource):
    @auth_required("token")
    def get(self):
        pending_requests = BookRequest.query.filter_by(is_approved=False, is_rejected=False).all()
        approved_requests = BookRequest.query.filter_by(is_approved=True, is_returned=True).all()
        if not pending_requests and not approved_requests:
            return {"message": "No requests found"}, 404
        return jsonify({
            "pending": marshal(pending_requests, book_request_representation),
            "approved": marshal(approved_requests, book_request_representation)
        })

# Resource class for approving book requests
class ApproveBookRequestResource(Resource):
    @auth_required("token")
    def post(self, request_id):
        request_entry = BookRequest.query.get(request_id)
        if not request_entry:
            return {"message": "Request not found"}, 404
        if request_entry.is_approved:
            return {"message": "Request is already approved"}, 400
        request_entry.is_approved = True
        request_entry.issue_date = datetime.today()
        db.session.add(request_entry)
        db.session.commit()
        return {"message": "Book request approved"}, 201

# Resource class for handling book returns
class ReturnBookRequestResource(Resource):
    @auth_required("token")
    def post(self, request_id):
        request_entry = BookRequest.query.get(request_id)
        if not request_entry:
            return {"message": "Request not found"}, 404
        if request_entry.is_returned:
            return {"message": "Book already returned"}, 400
        request_entry.is_returned = True
        request_entry.return_date = datetime.today()
        db.session.add(request_entry)
        db.session.commit()
        return {"message": "Book returned successfully"}, 201

# Resource class for rejecting book requests
class RejectBookRequestResource(Resource):
    @auth_required("token")
    def post(self, request_id):
        request_entry = BookRequest.query.get(request_id)
        if not request_entry:
            return {"message": "Request not found"}, 404
        if request_entry.is_rejected:
            return {"message": "Request already rejected"}, 400
        request_entry.is_rejected = True
        db.session.add(request_entry)
        db.session.commit()
        return {"message": "Book request rejected"}, 201



# Resource class for searching books and sections
class BookSearchResource(Resource):
    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('search', required=True, help="Search keyword is required")
        args = parser.parse_args()

        keyword = f"%{args['search']}%"

        sections = Section.query.filter(Section.section_name.like(keyword)).all()
        books = Book.query.filter(Book.title.like(keyword) | Book.author.like(keyword)).all()
        if not sections and not books:
            return {"message": "No matching results found"}, 404
        return {
            "sections": marshal(sections, section_representation),
            "books": marshal(books, book_representation)
        }

# Resource class for generating librarian reports
class LibrarianReportResource(Resource):
    def get(self):
        all_books = Book.query.all()
        all_sections = Section.query.all()

        section_counts = {}
        issued_counts = {}

        # Counting books per section
        for book in all_books:
            section_name = book.section.section_name
            section_counts[section_name] = section_counts.get(section_name, 0) + 1

            issued_requests = BookRequest.query.filter_by(
                book_id=book.book_id,
                is_approved=True,
                is_rejected=False,
                is_returned=False,
                is_revoked=False
            ).all()
            issued_counts[book.title] = len(issued_requests)

        # Plot 1: Book Distribution by Section
        plt.figure(figsize=(5, 5))
        plt.bar(section_counts.keys(), section_counts.values(), color='green')
        plt.xlabel('Section')
        plt.ylabel('Number of Books')
        plt.title('Book Distribution by Section')
        plt.xticks(rotation=90)
        buffer = BytesIO()
        plt.tight_layout()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        section_plot = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

       


        return jsonify({
            'plot_data_section': section_plot,
        })

api.add_resource(BookSearchResource, '/search')
api.add_resource(UserRequestResource, '/my-requests')
api.add_resource(LibrarianReportResource, '/lib/report')
api.add_resource(ApproveBookRequestResource, '/approve-request/<int:request_id>')
api.add_resource(ReturnBookRequestResource, '/return-request/<int:request_id>')
api.add_resource(RejectBookRequestResource, '/reject-request/<int:request_id>')
api.add_resource(BookRequestResource, '/request-book/<int:book_id>')
api.add_resource(BookRequestListResource, '/book-requests')
api.add_resource(SectionListResource, '/section')
api.add_resource(SectionDetailResource, '/section/<int:section_id>')
api.add_resource(BookListResource, '/book')
api.add_resource(BookResource, '/book/<int:book_id>')