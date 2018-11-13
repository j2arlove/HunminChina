import csv, sqlite3, hgtk

con = sqlite3.connect("hunmin.db")
cur = con.cursor()
cur.execute("DROP TABLE hunmin;")
cur.execute("CREATE TABLE hunmin (hunmin, hunminWithoutSpace, jamo, simplified, traditional, intonation, priority, user);")

with open('hunmin.csv','r') as fin: # `with` statement available in 2.5+
    # csv.DictReader uses first line in file for column headings by default
    dr = csv.reader(fin) # comma is default delimiter
    next(dr)
    for line in dr:
        cur.execute("""
        INSERT INTO hunmin (hunmin, hunminWithoutSpace, jamo, simplified, traditional, intonation, priority, user)
        VALUES ("%s", "%s", "%s", "%s", "%s", "%s", "%s", 0)
        """ % (
            line[0],
            line[0].replace(" ", ""),
            hgtk.text.decompose(line[0].replace(" ", "")).replace('ᴥ', ''),
            line[1],
            line[2],
            line[3],
            line[4]
        ))
    #to_db = [(i['col1'], i['col2']) for i in dr]

con.commit()
con.close()
