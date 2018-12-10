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

def translate_rows(rows,end_num):
    return [{
        'id': r[0],
        'hunmin': r[1],
    #    'hunminWithoutSpace': r[2],
    #    'jamo': r[3],
	#	'chosung': r[4],
        'simplified': r[5],
        'traditional': r[6],
        'intonation': r[7],
        'priority': r[8],
    #    'user': r[9],
        'page': end_num
    } for r in rows]

@app.route('/search/jamo/<string:text>')
def searchJamo(text):
    cur = get_db().cursor()
    count_num = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}%" OR chosung LIKE "{0}%" ORDER BY hunmin and priority'.format(text))]
    page_end = math.ceil(len(count_num)/10)
    print(page_end)
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}%" OR chosung LIKE "{0}%" ORDER BY hunmin and priority asc LIMIT 10 OFFSET 0*10'.format(text))]
    return jsonify(translate_rows(rows,page_end))

@app.route('/search/jamo_intonation/<string:text>/<string:intonation>')
def searchJamoIntonation(text, intonation):
    cur = get_db().cursor()
    count_num = [row for row in cur.execute('SELECT * FROM hunmin WHERE (jamo LIKE "{0}%" OR chosung LIKE "{0}%") and intonation LIKE "{1}%" ORDER BY hunmin and priority'.format(text, intonation))]
    page_end = math.ceil(len(count_num)/10)
    print(page_end)
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE (jamo LIKE "{0}%" OR chosung LIKE "{0}%") and intonation LIKE "{1}%" ORDER BY hunmin and priority asc LIMIT 10 OFFSET 0*10'.format(text, intonation))]

    return jsonify(translate_rows(rows,page_end))

@app.route('/search/hunmin/<string:text>')
def searchHunmin(text):
    cur = get_db().cursor()
    count_num = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}" ORDER BY hunmin and priority'.format(text))]
    page_end = math.ceil(len(count_num)/10)
    print(page_end)
    rows = [row for row in cur.execute('SELECT * FROM hunmin WHERE jamo LIKE "{0}" ORDER BY hunmin and priority asc LIMIT 10 OFFSET 0*10'.format(text))]
    
    return jsonify(translate_rows(rows,page_end))
