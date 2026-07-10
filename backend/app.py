import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def create_app():
    
    app = Flask(__name__)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "https://ticketmast-murex.vercel.app",
                    "http://localhost:5173"
                ]
            }
        }
    )
    # DB config
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL',
        'postgresql://postgres:Adeoluwa2244@localhost:5432/ticketvault'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'change-me-in-production')

    db.init_app(app)

    # Register routes
    from routes.events import events_bp
    from routes.tickets import tickets_bp
    from routes.transfer import transfer_bp

    app.register_blueprint(events_bp, url_prefix='/api')
    app.register_blueprint(tickets_bp, url_prefix='/api')
    app.register_blueprint(transfer_bp, url_prefix='/api')

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
