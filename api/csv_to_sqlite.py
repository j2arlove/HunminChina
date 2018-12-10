import csv, sqlite3, hgtk

con = sqlite3.connect("hunmin.db")
cur = con.cursor()
cur.execute("DROP TABLE hunmin;")
cur.execute("CREATE TABLE hunmin (id, hunmin, hunminWithoutSpace, jamo, chosung, simplified, traditional, intonation, priority, user);")

with open('hunmin.csv','r',encoding='utf-8') as fin: # `with` statement available in 2.5+
    # csv.DictReader uses first line in file for column headings by default
    dr = csv.reader(fin) # comma is default delimiter
    next(dr)
    count = 0
    for line in dr:
        cur.execute("""
        INSERT INTO hunmin (id, hunmin, hunminWithoutSpace, jamo, chosung, simplified, traditional, intonation, priority, user)
        VALUES ("%d", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", 0)
        """ % (
            count,
            line[0],
            line[0].replace(" ", ""),
            hgtk.text.decompose(line[0].replace(" ", "")).replace('ᴥ', ''),
			''.join([jamo[0] for jamo in hgtk.text.decompose(line[0].replace(" ", "")).split('ᴥ') if len(jamo) > 0]),
            line[1],
            line[2],
            line[3],
            line[4]
        ))
        count += 1
    #to_db = [(i['col1'], i['col2']) for i in dr]

con.commit()
con.close()
