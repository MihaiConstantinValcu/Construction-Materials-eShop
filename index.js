const express = require("express");
const fs = require('fs');
const sharp = require('sharp');
const ejs = require('ejs');
const { Client } = require("pg");
const path = require('path');
const sass = require('sass');
const formidable = require('formidable');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');
const xmljs = require('xml-js');
const request = require('request');
const html_to_pdf = require('html-pdf-node');
var QRCode = require('qrcode');
const helmet = require('helmet');

var app = express();

app.set("view engine", "ejs");
console.log("__dirname: ", __dirname);


app.use(helmet.frameguard());

app.use(["/produse_cos", "/cumpara"], express.json({ limit: '2mb' }));

app.use(["/contact"], express.urlencoded({ extended: true }));

app.use(session({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: false
}));


app.use("/*", function(req, res, next) {
    res.locals.utilizator = req.session.utilizator;
    next();
});

var client;
if (process.env.SITE_ONLINE) {
    protocol = "https://";
    numeDomeniu = "salty-journey-38170.herokuapp.com/"
    client = new Client({
        user: 'bahzkfbjvkndgb',
        password: 'bf5e8cb5832044973e161d05403890358f5a45aeae0675b5435f47f8202215e5',
        database: 'df6812jiovjoqg',
        host: 'ec2-54-159-126-187.compute-1.amazonaws.com',
        port: 5432,
        ssl: {
            rejectUnauthorized: false
        }
    });

} else {
    client = new Client({ user: 'mihai2', password: 'parolaSimpla', database: 'caramidaDB', host: 'localhost', port: 5432 });
    protocol = "http://";
    numeDomeniu = "localhost:8080";
}

client.connect();

var ipuri_active = {};


app.use(function(req, res, next) {
    let ipReq = getIp(req);
    let ip_gasit = ipuri_active[ipReq + "|" + req.url];

    timp_curent = new Date();
    if (ip_gasit) {

        if ((timp_curent - ip_gasit.data) < 5 * 1000) {
            if (ip_gasit.nr > 10) {
                res.send("<h1>Prea multe cereri intr-un interval scurt. Ia te rog sa fii cuminte, da?!</h1>");
                ip_gasit.data = timp_curent
                return;
            } else {

                ip_gasit.data = timp_curent;
                ip_gasit.nr++;
            }
        } else {
            ip_gasit.data = timp_curent;
            ip_gasit.nr = 1;
        }
    } else {

        ipuri_active[ipReq + "|" + req.url] = { nr: 1, data: timp_curent };

    }
    let comanda_param = `insert into accesari(ip, user_id, pagina) values ($1::text, $2,  $3::text)`;
    if (ipReq) {
        var id_utiliz = req.session.utilizator ? req.session.utilizator.id : null;
        client.query(comanda_param, [ipReq, id_utiliz, req.url], function(err, rez) {
            if (err) console.log(err);
        });
    }
    next();
});

function stergeAccesariVechi() {
    let comanda = `delete from accesari where now() - data_accesare > interval '10 minutes'`;
    client.query(comanda, function(err, rez) {
        if (err) console.log(err);
    });
    let timp_curent = new Date();
    for (let ipa in ipuri_active) {
        if (timp_curent - ipuri_active[ipa].data > 2 * 60 * 1000) {
            console.log("Am deblocat ", ipa);
            delete ipuri_active[ipa];
        }
    }
}


setInterval(stergeAccesariVechi, 10 * 60 * 1000);



app.use("/resurse", express.static(__dirname + "/resurse"));

let header_optiuni = []
client.query('select distinct categorie from produse', (err, res) => {
    if (err) {
        console.log(err)
        return
    }
    for (let x of res.rows) {
        header_optiuni.push(x.categorie)
    }
})

app.use((req, res, next) => {
    res.locals.optiuni = header_optiuni
    next()
})

app.get("/produse", function(req, res) {
    let query = "select * from produse where 1=1"
    let params = []
    if (req.query && req.query.categorie) {
        query += "and categorie=$1"
        params.push(req.query.categorie)
    }
    client.query(query, params, function(err, rez) {
        if (err) {
            console.log(err)
            return;
        }

        let days = ["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"]
        let months = ["Ianuarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Noiembrie", "Decembrie"]

        for (row of rez.rows) {
            data = new Date(row.data_adaugare)
            let newData = data.getDate() + "-" + months[(data.getMonth())] + "-" + data.getFullYear() + " [" + days[data.getDay(data)] + "]"
            row.data_adaugare = newData;

            if (row.showroom)
                row.showroom = "Da";
            else row.showroom = "Nu";
        }

        res.render("pagini/produse", { produse: rez.rows });
    })
})

app.get("/produs/ar_ent_:id", function(req, res) {
    query = "select * from produse where id = $1"
    client.query(query, [req.params.id], function(err, rez) {
        if (!err) {

            res.render("pagini/produs", { prod: rez.rows[0] });
        } else {
            console.log(err);
        }
    })
})


async function trimitefactura(username, email, numefis) {
    var transp = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth: {
            user: "micovala.magazin@gmail.com",
            pass: "parolaSimpla"
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    await transp.sendMail({
        from: "micovala.magazin@gmail.com",
        to: email,
        subject: "Cont nou",
        text: "Bine ai venit in comunitatea Micovala. Username-ul tau este " + username,
        html: '<p>Bine ai venit in comunitatea Micovala. Username-ul tau este <span style="font-weight: bold; color: green;" + username +"</span></p>',
    })
    console.log("trimis mail");
}







app.post("/produse_cos", function(req, res) {

    var iduri = []
    for (let elem of req.body.ids_prod) {
        let num = parseInt(elem);
        if (!isNaN(num))
            iduri.push(num);
    }
    if (iduri.length == 0) {
        res.send("eroare");
        return;
    }

    query = "select id, nume, pret, gramaj, calorii, categorie, imagine from prajituri where id in ($1)"
    client.query(query, [iduri], function(err, rez) {

        res.send(rez.rows);


    });


});


app.post("/cumpara", function(req, res) {
    if (!req.session.utilizator) {
        res.write("Nu puteti cumpara daca nu sunteti logat!");
        res.end();
        return;
    }
    query = "select id, nume, pret, gramaj, calorii, categorie, imagine from prajituri where id in ($1)"
    client.query(query, [req.body.ids_prod], function(err, rez) {

        let rezFactura = ejs.render(fs.readFileSync("views/pagini/factura.ejs").toString("utf8"), { utilizator: req.session.utilizator, produse: rez.rows, protocol: protocol, domeniu: numeDomeniu });
        let options = { format: 'A4', args: ['--no-sandbox'] };

        let file = { content: rezFactura };

        html_to_pdf.generatePdf(file, options).then(function(pdf) {
            if (!fs.existsSync("./temp"))
                fs.mkdirSync("./temp");
            var numefis = "./temp/test" + (new Date()).getTime() + ".pdf";
            fs.writeFileSync(numefis, pdf);
            trimitefactura(req.session.utilizator.username, req.session.utilizator.email, numefis);
            res.write("Totu bine!");
            res.end();
        });



    });


});



app.get("/ceva", function(req, res) {
    console.log("Am primit o cerere");
    if (req.session.utilizator)
        res.write("<p style='color:red'>" + req.session.utilizator.username + " " + req.session.utilizator.prenume + "</p>");
    else
        res.write("<p>Nu esti logat!</p>");
    res.end();
});


function creeazaImagini() {
    var buf = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf-8");
    obImagini = JSON.parse(buf);
    console.log(obImagini);
    for (let imag of obImagini.imagini) {
        let nume_imag, extensie;
        [nume_imag, extensie] = imag.cale_fisier.split(".")
        let dim_mic = 150

        imag.mic = `${obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp`
        console.log(imag.mic);
        imag.mare = `${obImagini.cale_imagini}/${imag.cale_fisier}`;
        if (!fs.existsSync(imag.mic))
            sharp(__dirname + "/" + imag.mare).resize(dim_mic).toFile(__dirname + "/" + imag.mic);
    }
}

creeazaImagini();


app.get("*/galerie-animata.css.map", function(req, res) {
    res.sendFile(path.join(__dirname, "temp/galerie-animata.css.map"));
});


app.get("*/galerie-animata.css", function(req, res) {
    res.setHeader("Content-Type", "text/css");
    let sirScss = fs.readFileSync("./resurse/scss/galerie-animata.scss").toString("utf-8");

    let nrImag = 7 + Math.floor(Math.random() * 4);
    while (nrImag == 10) {
        nrImag = 7 + Math.floor(Math.random() * 4);
    }
    console.log(nrImag);
    let rezScss = ejs.render(sirScss, { nrImagine: nrImag });
    fs.writeFileSync("./temp/galerie-animata.scss", rezScss);

    let cale_css = path.join(__dirname, "temp", "galerie-animata.css");
    let cale_scss = path.join(__dirname, "temp", "galerie-animata.scss");
    sass.render({ file: cale_scss, sourceMap: true }, function(err, rezCompilare) {
        console.log(rezCompilare);
        if (err) {
            console.log(`eroare: ${err.message}`);
            res.end();
            return;
        }
        fs.writeFileSync(cale_css, rezCompilare.css, function(err) {
            if (err) { console.log(err); }
        });
        res.sendFile(cale_css);
    });


});



function getIp(req) {
    var ip = req.headers["x-forwarded-for"];
    if (ip) {
        let vect = ip.split(",");
        return vect[vect.length - 1];
    } else if (req.ip) {
        return req.ip;
    } else {
        return req.connection.remoteAddress;
    }
}


app.get(["/", "/index", "/home"], function(req, res) {
    var rezultat;
    client.query("select username, nume from utilizatori where id in (select distinct user_id from accesari where now() - data_accesare < interval '5 minutes' )").then(function(rezultat) {
        console.log("rezultat", rezultat.rows);
        var evenimente = []
        var locatie = "";

        request('https://secure.geobytes.com/GetCityDetails?key=7c756203dbb38590a66e01a5a3e1ad96&fqcn=109.99.96.15',
            function(error, response, body) {
                if (error) { console.error('error:', error) } else {
                    var obiectLocatie = JSON.parse(body);
                    locatie = obiectLocatie.geobytescountry + " " + obiectLocatie.geobytesregion
                }


                var texteEvenimente = ["Eveniment important", "Festivitate", "Prajituri gratis", "Zi cu soare", "Aniversare"];
                dataCurenta = new Date();
                for (i = 0; i < texteEvenimente.length; i++) {
                    evenimente.push({ data: new Date(dataCurenta.getFullYear(), dataCurenta.getMonth(), Math.ceil(Math.random() * 27)), text: texteEvenimente[i] });
                }
                console.log(evenimente)
                res.render("pagini/index", { evenimente: evenimente, locatie: locatie, utiliz_online: rezultat.rows, ip: getIp(req), imagini: obImagini.imagini, cale: obImagini.cale_galerie, mesajLogin: req.session.mesajLogin });
                req.session.mesajLogin = null;

            });


    }, function(err) { console.log("eroare", err) });

});


sirAlphaNum = "";
v_intervale = [
    [48, 57],
    [65, 90],
    [97, 122]
];
for (let interval of v_intervale) {
    for (let i = interval[0]; i <= interval[1]; i++)
        sirAlphaNum += String.fromCharCode(i);
}
console.log(sirAlphaNum);


function genereazaToken(lungime) {
    sirAleator = "";
    for (let i = 0; i < lungime; i++) {
        sirAleator += sirAlphaNum[Math.floor(Math.random() * sirAlphaNum.length)];
    }
    return sirAleator
}

function genereazaTokenConfirmare(username, lungime) {
    sirAleator = "";
    for (let i = 0; i < 4; i++) {
        sirAleator += Math.floor(Math.random() * 10).toString();
    }
    sirAleator += crypto.scryptSync(username, parolaCriptare, lungime).toString('hex').replace(/[^a-z0-9]/gi, " ").replace(/\s+/g, "0");;
    return sirAleator
}

async function trimiteMail(username, email, token) {
    var transp = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth: {
            user: "micovala.magazin@gmail.com",
            pass: "parolaSimpla"
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    await transp.sendMail({
        from: "micovala.magazin@gmail.com",
        to: email,
        subject: "Cont nou",
        text: "Bine ai venit in comunitatea Micovala. Username-ul tau este " + username,
        html: `<p>Bine ai venit in comunitatea Micovala. Username-ul tau este <span style='font-weight: bold; color: green;'> ${username}</span></p>
        <p><a href='http://${numeDomeniu}/confirmare/${username}/${token}'>Click aici pentru confirmare</p>`,
    })
    console.log("trimis mail");
}

parolaCriptare = numeDomeniu;


app.get("/confirmare/:user/:token", function(req, res) {
    console.log("ce e bwei asta");
    console.log(req.params.usertext + "   " + req.params.token)
    queryUpdate = `update utilizatori set confirmat_mail=true where username = $1::text and salt= $2::text `;
    client.query(queryUpdate, [req.params.user, req.params.token], function(err, rez) {
        if (err) {
            console.log(err);
            res.render("pagini/eroare", { err: "Eroare baza date" });
            return;
        }
        if (rez.rowCount > 0) {
            res.render("pagini/confirmare");
        } else {
            res.render("pagini/eroare", { err: "Eroare link" });
        }
    });

});

app.post("/inreg", function(req, res) {
    var formular = new formidable.IncomingForm();
    var username;
    var caleImagine = "";
    formular.parse(req, function(err, campuriText, campuriFile) {
        console.log(campuriText);
        console.log("Email: ", campuriText.email);
        var eroare = "";
        if (!campuriText.username)
            eroare += "Username-ul trebuie sa fie completat";
        if (!campuriText.nume)
            eroare += "Numele trebuie sa fie completat";
        if (!campuriText.prenume)
            eroare += "Prenumele trebuie sa fie completat";
        if (!campuriText.parola)
            eroare += "Parola trebuie sa fie completata";
        if (!campuriText.rparola)
            eroare += "Parola trebuie sa fie completata din nou";
        if (!campuriText.email)
            eroare += "Email-ul trebuie sa fie completat";

        if (!campuriText.nume.match("^[-\sa-zA-Z]+$"))
            eroare += "Numele trebuie sa contina doar litere mici/mari, cratima si spatii ";
        if (!campuriText.prenume.match("^[-\sa-zA-Z]+$"))
            eroare += "Prenumele trebuie sa contina doar litere mici/mari, cratima si spatii ";

        if (eroare != "") {
            res.render("pagini/inregistrare", { err: eroare });
            return;
        }

        queryVerifUtiliz = ` select * from utilizatori where username= $1::text `;
        console.log(queryVerifUtiliz)

        client.query(queryVerifUtiliz, [campuriText.username], function(err, rez) {
            if (err) {
                console.log(err);
                res.render("pagini/inregistrare", { err: "Eroare baza date" });
            } else {
                if (rez.rows.length == 0) {

                    var criptareParola = crypto.scryptSync(campuriText.parola, parolaCriptare, 32).toString('hex');
                    var token = genereazaTokenConfirmare(campuriText.username, 40);
                    var queryUtiliz = `insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, ocupatie, salt, cale_imagine) values ($1::text,$2::text,$3::text, $4::text ,$5::text,$6::text,$7::text ,$8::text,$9::text)`;
                    client.query(queryUtiliz, [campuriText.username, campuriText.nume, campuriText.prenume, criptareParola, campuriText.email, campuriText.culoareText, campuriText.ocupatie, token, caleImagine], function(err, rez) { //TO DO parametrizati restul de query
                        if (err) {
                            console.log(err);
                            res.render("pagini/inregistrare", { err: "Eroare baza date" });
                        } else {
                            trimiteMail(campuriText.username, campuriText.email, token);
                            res.render("pagini/inregistrare", { err: "", raspuns: "Date introduse" });
                        }
                    });
                } else {
                    eroare += "Username-ul mai exista. ";
                    res.render("pagini/inregistrare", { err: eroare });
                }
            }
        });
    });
    formular.on("field", function(nume, val) {
        console.log("----> ", nume, val);
        if (nume == "username")
            username = val;
    })
    formular.on("fileBegin", function(nume, fisier) {
        if (!fisier.originalFilename)
            return;
        folderUtilizator = __dirname + "/resurse/utilizatori/" + username + "/";
        console.log("----> ", nume, fisier);
        if (!fs.existsSync(folderUtilizator)) {
            fs.mkdirSync(folderUtilizator);
            v = fisier.originalFilename.split(".");
            fisier.filepath = folderUtilizator + "poza." + v[v.length - 1];
            caleImagine = fisier.filepath;
        }

    })
    formular.on("file", function(nume, fisier) {
        console.log("fisier uploadat");
    });
});

app.post("/login", function(req, res) {
    var formular = new formidable.IncomingForm();

    formular.parse(req, function(err, campuriText, campuriFile) {
        console.log(campuriText);

        var querylogin = `select * from utilizatori where username= $1::text `;
        client.query(querylogin, [campuriText.username], function(err, rez) {
            if (err) {
                res.render("pagini/eroare", { mesaj: "Eroare baza date. Incercati mai tarziu." });
                return;
            }
            if (rez.rows.length != 1) {
                res.render("pagini/eroare", { mesaj: "Username-ul nu exista." });
                return;
            }
            var criptareParola = crypto.scryptSync(campuriText.parola, parolaCriptare, 32).toString('hex');
            console.log(criptareParola);
            console.log(rez.rows[0].parola);
            if (criptareParola == rez.rows[0].parola && rez.rows[0].confirmat_mail) {
                console.log("totul ok");
                req.session.mesajLogin = null;
                if (req.session) {
                    req.session.utilizator = {
                        id: rez.rows[0].id,
                        username: rez.rows[0].username,
                        nume: rez.rows[0].nume,
                        prenume: rez.rows[0].prenume,
                        culoare_chat: rez.rows[0].culoare_chat,
                        email: rez.rows[0].email,
                        rol: rez.rows[0].rol
                    }
                }
                res.redirect("/index");
            } else {
                req.session.mesajLogin = "Login esuat";
                res.redirect("/index");
            }

        });


    });
});

app.post("/profil", function(req, res) {
    console.log("profil");
    if (!req.session.utilizator) {
        res.render("pagini/eroare", { mesaj: "Nu sunteti logat." });
        return;
    }
    var formular = new formidable.IncomingForm();

    formular.parse(req, function(err, campuriText, campuriFile) {
        console.log(err);
        console.log(campuriText);
        var criptareParola = crypto.scryptSync(campuriText.parola, parolaCriptare, 32).toString('hex');

        var queryUpdate = `update utilizatori set nume=$1::text, prenume=$2::text, email=$3::text, culoare_chat=$4::text where username= $5::text and parola=$6::text `;

        client.query(queryUpdate, [campuriText.nume, campuriText.prenume, campuriText.email, campuriText.culoareText, req.session.utilizator.username, criptareParola], function(err, rez) {
            if (err) {
                console.log(err);
                res.render("pagini/eroare", { mesaj: "Eroare baza date. Incercati mai tarziu." });
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount == 0) {
                res.render("pagini/profil", { mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa." });
                return;
            }

            req.session.utilizator.nume = campuriText.nume;
            req.session.utilizator.prenume = campuriText.prenume;

            req.session.utilizator.culoare_chat = campuriText.culoareText;
            req.session.utilizator.email = campuriText.email;

            res.render("pagini/profil", { mesaj: "Update-ul s-a realizat cu succes." });

        });


    });
});


app.get("/logout", function(req, res) {
    req.session.destroy();
    res.locals.utilizator = null;
    res.redirect("/index");
});


app.get('/useri', function(req, res) {

    if (req.session && req.session.utilizator && req.session.utilizator.rol == "admin") {

        client.query("select * from utilizatori", function(err, rezultat) {
            if (err) throw err;
            res.render('pagini/useri', { useri: rezultat.rows });
        });
    } else {
        res.status(403).render('pagini/eroare', { mesaj: "Nu aveti acces" });
    }

});




app.post("/sterge_utiliz", function(req, res) {
    if (req.session && req.session.utilizator && req.session.utilizator.rol == "admin") {
        var formular = new formidable.IncomingForm()

        formular.parse(req, function(err, campuriText, campuriFisier) {
            var comanda = `delete from utilizatori where id=$1 and rol !='admin' `;
            client.query(comanda, [parseInt(campuriText.id_utiliz)], function(err, rez) {
                if (err)
                    console.log(err);
                else {
                    if (rez.rowCount > 0) {
                        console.log("sters cu succes");
                    } else {
                        console.log("stergere esuata");
                    }
                }
            });
        });
    }
    res.redirect("/useri");

});


caleXMLMesaje = "resurse/xml/contact.xml";
headerXML = `<?xml version="1.0" encoding="utf-8"?>`;

function creeazaXMlContactDacaNuExista() {
    if (!fs.existsSync(caleXMLMesaje)) {
        let initXML = {
            "declaration": {
                "attributes": {
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [{
                "type": "element",
                "name": "contact",
                "elements": [{
                    "type": "element",
                    "name": "mesaje",
                    "elements": []
                }]
            }]
        }
        let sirXml = xmljs.js2xml(initXML, { compact: false, spaces: 4 });
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesaje, sirXml);
        return false;
    }
    return true;
}


function parseazaMesaje() {
    let existaInainte = creeazaXMlContactDacaNuExista();
    let mesajeXml = [];
    let obJson;
    if (existaInainte) {
        let sirXML = fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson = xmljs.xml2js(sirXML, { compact: false, spaces: 4 });


        let elementMesaje = obJson.elements[0].elements.find(function(el) {
            return el.name == "mesaje"
        });
        let vectElementeMesaj = elementMesaje.elements ? elementMesaje.elements : [];
        console.log("Mesaje: ", obJson.elements[0].elements.find(function(el) {
            return el.name == "mesaje"
        }))
        let mesajeXml = vectElementeMesaj.filter(function(el) { return el.name == "mesaj" });
        return [obJson, elementMesaje, mesajeXml];
    }
    return [obJson, [],
        []
    ];
}

app.post("/contact", function(req, res) {
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] = parseazaMesaje();

    let u = req.session.utilizator ? req.session.utilizator.username : "anonim";
    let mesajNou = {
        type: "element",
        name: "mesaj",
        attributes: {
            username: u,
            data: new Date()
        },
        elements: [{ type: "text", "text": req.body.mesaj }]
    };
    if (elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else
        elementMesaje.elements = [mesajNou];
    console.log(elementMesaje.elements);
    let sirXml = xmljs.js2xml(obJson, { compact: false, spaces: 4 });
    console.log("XML: ", sirXml);
    fs.writeFileSync("resurse/xml/contact.xml", sirXml);

    res.render("pagini/contact", { utilizator: req.session.utilizator, mesaje: elementMesaje.elements })
});








app.get("/favicon.ico", function(req, res) {
    res.sendFile("/resurse/imagini/favicon.ico");
});

app.get("/*.ejs", function(req, res) {
    res.status(403).render("pagini/403");
});


app.get("/*", function(req, res) {
    console.log(req.url);
    res.render("pagini" + req.url, function(err, rezRandare) {
        if (err) {
            console.log(err.message);
            if (err.message.includes("Failed to lookup")) {
                res.status(404).render("pagini/404");
                return;
            } else {
                console.log(err);
                res.render("pagini/eroare");
            }
        } else
            res.send(rezRandare);
    });
});

var s_port = process.env.PORT || 8080;
app.listen(s_port);
console.log("Server pornit!!!!!!");