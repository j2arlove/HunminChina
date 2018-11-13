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

@app.route('/search/jamo/<string:text>')
def searchJamo(text):
    cur = get_db().cursor()
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}%"'.format(text))]

    return jsonify(rows)

@app.route('/search/jamo_intonation/<string:text>/<string:intonation>')
def searchJamoIntonation(text, intonation):
    cur = get_db().cursor()
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}%" and intonation LIKE "{1}%"'.format(text, intonation))]

    return jsonify(rows)