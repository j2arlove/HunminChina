import sqlite3
from flask import Flask
from flask import g
from flask import jsonify

app = Flask(__name__)
DATABASE = './hunmin.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/find/<string:text>')
def find(text):
    cur = get_db().cursor()
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE hunmin = "%s"' % text)]

    return jsonify(rows)
