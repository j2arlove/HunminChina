import sqlite3
from flask import Flask
from flask import g
from flask import jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
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

def translate_rows(rows):
    return [{
        'id': r[0],
        'hunmin': r[1],
        'hunminWithoutSpace': r[2],
        'jamo': r[3],
        'simplified': r[4],
        'traditional': r[5],
        'intonation': r[6],
        'priority': r[7],
        'user': r[8]
    } for r in rows]

@app.route('/search/jamo/<string:text>')
def searchJamo(text):
    cur = get_db().cursor()
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}%" ORDER BY priority asc LIMIT 10'.format(text))]

    return jsonify(translate_rows(rows))

@app.route('/search/jamo_intonation/<string:text>/<string:intonation>')
def searchJamoIntonation(text, intonation):
    cur = get_db().cursor()
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}%" and intonation LIKE "{1}%" ORDER BY priority asc LIMIT 10'.format(text, intonation))]

    return jsonify(translate_rows(rows))