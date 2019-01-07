import sqlite3
import math
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
        'jamo': r[2],
		'chosung': r[3],
        'simplified': r[4],
        'traditional': r[5],
        'intonation': r[6],
        'priority': r[7]
    #   'user': r[9],
    } for r in rows]

@app.route('/search/jamo/<string:text>/<int:offset>/<int:count>')
def searchJamo(text, offset, count):
    if count > 10: 
        return jsonify({ "error": "count should be less than 10" })

    cur = get_db().cursor()
    count_num = [row for row in cur.execute('SELECT COUNT(*) FROM hunmin WHERE jamo LIKE "{0}%" OR chosung LIKE "{0}%"'.format(text))][0][0]
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}%" OR chosung LIKE "{0}%" ORDER BY hunmin and priority asc LIMIT {1} OFFSET {2}'.format(text, count, offset))]

    return jsonify({
        'candidates': translate_rows(rows),
        'count': count_num,
    })

@app.route('/search/jamo_intonation/<string:text>/<string:intonation>/<int:offset>/<int:count>')
def searchJamoIntonation(text, intonation, offset, count):
    if count > 10: 
        return jsonify({ "error": "count should be less than 10" })
   
    cur = get_db().cursor()
    count_num = [row for row in cur.execute('SELECT COUNT(*) FROM hunmin WHERE (jamo LIKE "{0}%" OR chosung LIKE "{0}%") and intonation LIKE "{1}%"'.format(text, intonation))][0][0]
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE (jamo LIKE "{0}%" OR chosung LIKE "{0}%") and intonation LIKE "{1}%" ORDER BY hunmin and priority asc LIMIT {2} OFFSET {3}'.format(text, intonation, count, offset))]

    return jsonify({
        'candidates': translate_rows(rows),
        'count': count_num,
    })

@app.route('/search/hunmin/<string:text>')
def searchHunmin(text):
    cur = get_db().cursor()
    count_num = [row for row in cur.execute('SELECT COUNT(*) FROM hunmin WHERE jamo LIKE "{0}"'.format(text))][0][0]
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}" ORDER BY priority asc'.format(text))]
    
    return jsonify({
        'candidates': translate_rows(rows),
        'count': count_num,
    })