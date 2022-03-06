CREATE TYPE categorie_produse AS ENUM('interior', 'exterior', 'mixt');
CREATE TYPE tipuri_produse AS ENUM('fier', 'lemn', 'compus');

CREATE TABLE IF NOT EXISTS produse (
	id serial PRIMARY KEY,
	nume VARCHAR(50) UNIQUE NOT NULL,
	descriere TEXT,
	imagine VARCHAR(300),
	categorie categorie_produse DEFAULT 'mixt',
	tip tipuri_produse DEFAULT 'compus',
	pret NUMERIC(8,2) NOT NULL,
	lungime NUMERIC(8,2) NOT NULL CHECK (lungime>0),
	data_adaugare TIMESTAMP DEFAULT current_timestamp,
	culoare VARCHAR(20),
	materiale VARCHAR [],
	showroom BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO produse(nume, descriere, imagine, categorie, tip, pret, lungime, culoare, materiale, showroom) VALUES
('Amorsa','Se da pe perete','amorsa.png','mixt','compus',89.30,70,'alb','{"aracet","apa"}',FALSE),
('Caramida','Chestie din care faci case','caramida.png','exterior','compus',3, 20,'rosu','{"argila", "nisip","apa"}',FALSE),
('Cheie Franceza','Cheie pentru diverse tipuri de suruburi','cheie_franceza.png','mixt','fier',35.40, 30,'gri','{"fier"}',TRUE),
('Ciment','Pui pe jos si se face drumul','ciment.png','exterior','compus',14.60,60,'gri','{"alitul","belitul","celitul"}',TRUE),
('Dala de Piatra','Pui pe jos si se face poteca','dala_piatra.png','exterior','compus',10,20,'gro','{"piatra"}',FALSE),
('Grinda','Grinda de lemn pentru diverse constructii','grinda.png', 'mixt','lemn', 45,230,'galben','{"lemn"}',FALSE),
('Lemn','Copac procesat','lemn.png','mixt','lemn', 50,100,'galben','{"lemn"}',TRUE),
('Mortar','Amestec de var, nisip, apa, ciment sau ipsos','mortar.png','mixt','compus', 70,50,'gri','{"var","nisip","apa","ciment"}',FALSE),
('Nisip','Se gaseste pe plaja','nisip.png','exterior','compus', 30,50,'bej','{"nisip"}',FALSE),
('Parchet','Lemn de pus pe jos in casa','parchet.png','interior','lemn', 70,120,'maro','{"nisip"}',FALSE),
('Sarma','Fir metalic subtire','sarma.png', 'mixt','fier',5,70,'negru','{"fier"}',TRUE),
('Surub','Tija cilindrica, filetata, de otel','surub.png','mixt','fier', 0.3,3,'gri','{"fier"}',TRUE),
('Teava','Piesa de metal de forma cilindrica si goala in interior','tevi.png','mixt','fier', 18,60,'gri','{"fier"}',FALSE),
('Tigla','Placa folosita la invelit casele','tigla.png','exterior','compus', 120,300,'rosu','{"tigla"}',FALSE),
('Tub de fier','Teava cu diametrul mai mare','tuburi_fier.png','mixt','fier', 6.5,90,'gri','{"fier"}',TRUE)