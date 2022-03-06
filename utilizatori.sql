CREATE TYPE roluri AS ENUM('admin', 'moderator', 'comun');

CREATE TABLE IF NOT EXISTS utilizatori(
	id serial PRIMARY KEY,
  	username VARCHAR(50) UNIQUE NOT NULL,
  	nume VARCHAR(100) NOT NULL,
  	prenume VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL,
	parola VARCHAR(500) NOT NULL,
	data_inregistrarii TIMESTAMP DEFAULT current_timestamp,
	culoare_chat VARCHAR(50) NOT NULL DEFAULT 'black',
	rol roluri NOT NULL DEFAULT 'comun',
	ocupatie VARCHAR(50),
	cale_imagine VARCHAR(100),
	salt character varying(200),
	confirmat_mail boolean DEFAULT false
}