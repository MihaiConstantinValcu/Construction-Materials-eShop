--
-- PostgreSQL database dump
--

-- Dumped from database version 14.0
-- Dumped by pg_dump version 14.0

-- Started on 2022-01-27 17:56:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 827 (class 1247 OID 16528)
-- Name: categorie_produse; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.categorie_produse AS ENUM (
    'interior',
    'exterior',
    'mixt'
);


ALTER TYPE public.categorie_produse OWNER TO postgres;

--
-- TOC entry 836 (class 1247 OID 16562)
-- Name: roluri; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roluri AS ENUM (
    'admin',
    'moderator',
    'comun'
);


ALTER TYPE public.roluri OWNER TO postgres;

--
-- TOC entry 830 (class 1247 OID 16536)
-- Name: tipuri_produse; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipuri_produse AS ENUM (
    'fier',
    'lemn',
    'compus'
);


ALTER TYPE public.tipuri_produse OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 16586)
-- Name: accesari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accesari (
    id integer NOT NULL,
    ip character varying(100) NOT NULL,
    user_id integer,
    pagina character varying(500) NOT NULL,
    data_accesare timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.accesari OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16585)
-- Name: accesari_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accesari_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accesari_id_seq OWNER TO postgres;

--
-- TOC entry 3358 (class 0 OID 0)
-- Dependencies: 213
-- Name: accesari_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accesari_id_seq OWNED BY public.accesari.id;


--
-- TOC entry 210 (class 1259 OID 16544)
-- Name: produse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produse (
    id integer NOT NULL,
    nume character varying(50) NOT NULL,
    descriere text,
    imagine character varying(300),
    categorie public.categorie_produse DEFAULT 'mixt'::public.categorie_produse,
    tip public.tipuri_produse DEFAULT 'compus'::public.tipuri_produse,
    pret numeric(8,2) NOT NULL,
    lungime numeric(8,2) NOT NULL,
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    culoare character varying(20),
    materiale character varying[],
    showroom boolean DEFAULT false NOT NULL,
    CONSTRAINT produse_lungime_check CHECK ((lungime > (0)::numeric))
);


ALTER TABLE public.produse OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 16543)
-- Name: produse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.produse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.produse_id_seq OWNER TO postgres;

--
-- TOC entry 3361 (class 0 OID 0)
-- Dependencies: 209
-- Name: produse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.produse_id_seq OWNED BY public.produse.id;


--
-- TOC entry 212 (class 1259 OID 16570)
-- Name: utilizatori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilizatori (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    nume character varying(100) NOT NULL,
    prenume character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    parola character varying(500) NOT NULL,
    data_inregistrarii timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    culoare_chat character varying(50) DEFAULT 'black'::character varying NOT NULL,
    rol public.roluri DEFAULT 'comun'::public.roluri NOT NULL,
    ocupatie character varying(50),
    cale_imagine character varying(100),
    salt character varying(500),
    confirmat_mail boolean DEFAULT false
);


ALTER TABLE public.utilizatori OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 16569)
-- Name: utilizatori_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilizatori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.utilizatori_id_seq OWNER TO postgres;

--
-- TOC entry 3364 (class 0 OID 0)
-- Dependencies: 211
-- Name: utilizatori_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilizatori_id_seq OWNED BY public.utilizatori.id;


--
-- TOC entry 3194 (class 2604 OID 16589)
-- Name: accesari id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari ALTER COLUMN id SET DEFAULT nextval('public.accesari_id_seq'::regclass);


--
-- TOC entry 3183 (class 2604 OID 16547)
-- Name: produse id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produse ALTER COLUMN id SET DEFAULT nextval('public.produse_id_seq'::regclass);


--
-- TOC entry 3189 (class 2604 OID 16573)
-- Name: utilizatori id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori ALTER COLUMN id SET DEFAULT nextval('public.utilizatori_id_seq'::regclass);


--
-- TOC entry 3351 (class 0 OID 16586)
-- Dependencies: 214
-- Data for Name: accesari; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3347 (class 0 OID 16544)
-- Dependencies: 210
-- Data for Name: produse; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (1, 'Amorsa', 'Se da pe perete', 'amorsa.png', 'mixt', 'compus', 89.30, 70.00, '2022-01-25 16:50:05.598679', 'alb', '{aracet,apa}', false);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (2, 'Caramida', 'Chestie din care faci case', 'caramida.png', 'exterior', 'compus', 3.00, 20.00, '2022-01-25 16:50:05.598679', 'rosu', '{argila,nisip,apa}', false);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (3, 'Cheie Franceza', 'Cheie pentru diverse tipuri de suruburi', 'cheie_franceza.png', 'mixt', 'fier', 35.40, 30.00, '2022-01-25 16:50:05.598679', 'gri', '{fier}', true);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (4, 'Ciment', 'Pui pe jos si se face drumul', 'ciment.png', 'exterior', 'compus', 14.60, 60.00, '2022-01-25 16:50:05.598679', 'gri', '{alitul,belitul,celitul}', true);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (5, 'Dala de Piatra', 'Pui pe jos si se face poteca', 'dala_piatra.png', 'exterior', 'compus', 10.00, 20.00, '2022-01-25 16:50:05.598679', 'gro', '{piatra}', false);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (6, 'Grinda', 'Grinda de lemn pentru diverse constructii', 'grinda.png', 'mixt', 'lemn', 45.00, 230.00, '2022-01-25 16:50:05.598679', 'galben', '{lemn}', false);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (7, 'Lemn', 'Copac procesat', 'lemn.png', 'mixt', 'lemn', 50.00, 100.00, '2022-01-25 16:50:05.598679', 'galben', '{lemn}', true);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (8, 'Mortar', 'Amestec de var, nisip, apa, ciment sau ipsos', 'mortar.png', 'mixt', 'compus', 70.00, 50.00, '2022-01-25 16:50:05.598679', 'gri', '{var,nisip,apa,ciment}', false);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (9, 'Nisip', 'Se gaseste pe plaja', 'nisip.png', 'exterior', 'compus', 30.00, 50.00, '2022-01-25 16:50:05.598679', 'bej', '{nisip}', false);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (10, 'Parchet', 'Lemn de pus pe jos in casa', 'parchet.png', 'interior', 'lemn', 70.00, 120.00, '2022-01-25 16:50:05.598679', 'maro', '{nisip}', false);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (11, 'Sarma', 'Fir metalic subtire', 'sarma.png', 'mixt', 'fier', 5.00, 70.00, '2022-01-25 16:50:05.598679', 'negru', '{fier}', true);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (12, 'Surub', 'Tija cilindrica, filetata, de otel', 'surub.png', 'mixt', 'fier', 0.30, 3.00, '2022-01-25 16:50:05.598679', 'gri', '{fier}', true);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (13, 'Teava', 'Piesa de metal de forma cilindrica si goala in interior', 'tevi.png', 'mixt', 'fier', 18.00, 60.00, '2022-01-25 16:50:05.598679', 'gri', '{fier}', false);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (14, 'Tigla', 'Placa folosita la invelit casele', 'tigla.png', 'exterior', 'compus', 120.00, 300.00, '2022-01-25 16:50:05.598679', 'rosu', '{tigla}', false);
INSERT INTO public.produse (id, nume, descriere, imagine, categorie, tip, pret, lungime, data_adaugare, culoare, materiale, showroom) VALUES (15, 'Tub de fier', 'Teava cu diametrul mai mare', 'tuburi_fier.png', 'mixt', 'fier', 6.50, 90.00, '2022-01-25 16:50:05.598679', 'gri', '{fier}', true);


--
-- TOC entry 3349 (class 0 OID 16570)
-- Dependencies: 212
-- Data for Name: utilizatori; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.utilizatori (id, username, nume, prenume, email, parola, data_inregistrarii, culoare_chat, rol, ocupatie, cale_imagine, salt, confirmat_mail) VALUES (14, 'Admin', 'Mihai', 'Valcu', 'mihai.c.valcu@gmail.com', '6b01cf334a2e354623d3c1cc1693997110b5151eaa6461558afe1768bb65e613', '2022-01-26 22:54:48.342431', 'red', 'admin', 'student', '', 'cRejb74ee86bb36927025e8335501a823dfa8529f67a6e73aa3783eb7706a1e3bd3c1b57bf5e3a3673a8', true);
INSERT INTO public.utilizatori (id, username, nume, prenume, email, parola, data_inregistrarii, culoare_chat, rol, ocupatie, cale_imagine, salt, confirmat_mail) VALUES (18, 'Mihai', 'Admin', 'Admin', 'mihai.c.valcu@gmail.com', '6b01cf334a2e354623d3c1cc1693997110b5151eaa6461558afe1768bb65e613', '2022-01-26 23:24:14.978382', 'green', 'admin', 'somer', '', '44CWd538657a5b8eaa2e2f81224a2f27da5eda6a2e5cfa2a8030478437ae5e2a92529094209e2adab0ca', true);
INSERT INTO public.utilizatori (id, username, nume, prenume, email, parola, data_inregistrarii, culoare_chat, rol, ocupatie, cale_imagine, salt, confirmat_mail) VALUES (17, 'student65889', 'Studentescu', 'Student', 'micovala.magazin@gmail.com', '6b01cf334a2e354623d3c1cc1693997110b5151eaa6461558afe1768bb65e613', '2022-01-26 23:06:02.745554', 'black', 'comun', 'noAnswer', '', 'bg4A16865771d4df6f7084532650c2d655c1351ddfcb8175dc8a2a9012a2637197434c15fbc02fcb6e9b', true);


--
-- TOC entry 3366 (class 0 OID 0)
-- Dependencies: 213
-- Name: accesari_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accesari_id_seq', 7160, true);


--
-- TOC entry 3367 (class 0 OID 0)
-- Dependencies: 209
-- Name: produse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.produse_id_seq', 15, true);


--
-- TOC entry 3368 (class 0 OID 0)
-- Dependencies: 211
-- Name: utilizatori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilizatori_id_seq', 18, true);


--
-- TOC entry 3205 (class 2606 OID 16594)
-- Name: accesari accesari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT accesari_pkey PRIMARY KEY (id);


--
-- TOC entry 3197 (class 2606 OID 16558)
-- Name: produse produse_nume_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produse
    ADD CONSTRAINT produse_nume_key UNIQUE (nume);


--
-- TOC entry 3199 (class 2606 OID 16556)
-- Name: produse produse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produse
    ADD CONSTRAINT produse_pkey PRIMARY KEY (id);


--
-- TOC entry 3201 (class 2606 OID 16581)
-- Name: utilizatori utilizatori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT utilizatori_pkey PRIMARY KEY (id);


--
-- TOC entry 3203 (class 2606 OID 16583)
-- Name: utilizatori utilizatori_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT utilizatori_username_key UNIQUE (username);


--
-- TOC entry 3206 (class 2606 OID 16595)
-- Name: accesari accesari_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT accesari_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.utilizatori(id);


--
-- TOC entry 3357 (class 0 OID 0)
-- Dependencies: 214
-- Name: TABLE accesari; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.accesari TO mihai2;


--
-- TOC entry 3359 (class 0 OID 0)
-- Dependencies: 213
-- Name: SEQUENCE accesari_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.accesari_id_seq TO mihai2;


--
-- TOC entry 3360 (class 0 OID 0)
-- Dependencies: 210
-- Name: TABLE produse; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.produse TO mihai1;
GRANT ALL ON TABLE public.produse TO mihai2;


--
-- TOC entry 3362 (class 0 OID 0)
-- Dependencies: 209
-- Name: SEQUENCE produse_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.produse_id_seq TO mihai1;
GRANT ALL ON SEQUENCE public.produse_id_seq TO mihai2;


--
-- TOC entry 3363 (class 0 OID 0)
-- Dependencies: 212
-- Name: TABLE utilizatori; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.utilizatori TO mihai1;
GRANT ALL ON TABLE public.utilizatori TO mihai2;


--
-- TOC entry 3365 (class 0 OID 0)
-- Dependencies: 211
-- Name: SEQUENCE utilizatori_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.utilizatori_id_seq TO mihai1;
GRANT ALL ON SEQUENCE public.utilizatori_id_seq TO mihai2;


-- Completed on 2022-01-27 17:56:59

--
-- PostgreSQL database dump complete
--

