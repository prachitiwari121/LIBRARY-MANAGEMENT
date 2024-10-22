from config import DevelopmentConfig
from application.resources import api
from flask import Flask
from flask_security import Security
from flask_migrate import Migrate
from application.sec import datastore
from application.instances import cache
from application.models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    
    db.init_app(app)
    migrate = Migrate(app, db)  # Set up Flask-Migrate

    api.init_app(app)
    app.security = Security(app, datastore)
    cache.init_app(app)
    
    with app.app_context():
        import application.views

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
