# import mysql.connector
import pandas as pd

config = {
    'user': 'hw7',
    'password': 'CSE356hw7!',
    'host': '127.0.0.1',
    'database': 'hw7'
}

add_assist = ("INSERT INTO assists "
            "(player, club, pos, gp, gs, a, gwa, hma, rda, a90) "
            "VALUES (%(player)s, %(club)s, %(pos)s, %(gp)d, %(gs)d, %(a)d, %(gwa)d, %(hma)d, %(rda)d, %(a90)f)")

assist = {
    'player': '',
    'club': '',
    'pos': '',
    'gp': 0,
    'gs': 0,
    'a': 0,
    'gwa': 0,
    'hma': 0,
    'rda': 0,
    'a90': 0.0
}

def main(db, url):
    if db == 'sql':
        try:
            # cnx = mysql.connector.connect(**config)
            df = pd.read_csv(url)
            for index, row in df.iterrows():
                print(index, row)
        # except mysql.connector.Error as err:
        #     print(err)
        finally:
            pass
            # cnx.close()


if __name__ == "__main__":
    db = 'sql'
    url = 'https://raw.githubusercontent.com/jokecamp/FootballData/master/MLS/2017/assists.csv'
    main(db, url)