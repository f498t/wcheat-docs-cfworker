---- user table
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, uuid TEXT UNIQUE NOT NULL, username TEXT);
INSERT INTO users (uuid, username) VALUES ('00000000-00000000', 'admin'), ('9afeageg-5e1gegsf', 'test'), ('5agergut-36dgdadsf', 'fc25'), ('isfegjaef-gj4643df', 'sfeasvede');

---- account table
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    uuid TEXT, 
    email TEXT UNIQUE, 
    password TEXT, 
    appcode TEXT, 
    status INTEGER, 
    enable_status INTEGER, 
    access_token TEXT, 
    coins INTEGER, 
    dr_level INTEGER, 
    stage_id INTEGER, 
    champions_points INTEGER, 
    transformarket_unlocked BOOLEAN, 
    record TEXT, 
    updated_at DATETIME, 
    CONSTRAINT `ACCOUNTS_FK_UUID` FOREIGN KEY (uuid) REFERENCES users(uuid)
    );

INSERT INTO accounts(uuid, email, password, appcode) VALUES ('00000000-00000000', 'robertgonzalez1996@hemimetamml.ru', '4HLveHmQ5AKf', 'PG272F3VIJCXQMK2'), ('9afeageg-5e1gegsf', 'karenkilman1915@superparml.ru', 'IdvlSArhFYX6', 'BA22QHVM4CALLMSX');