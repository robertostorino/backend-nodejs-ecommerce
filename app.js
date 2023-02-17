import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import { containerMongoose } from './src/containers/containerMongoose.js';
import { normalize, schema } from 'normalizr';
import { fakerProducts} from './src/controllers/controller.productos.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
// import FileStore from 'session-file-store';
// import MongoStore from 'connect-mongo';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
// Passport
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
// Bcrypt
import bcrypt from 'bcrypt';
import { sysInfo } from './src/process/sysInfo.js';
import MongoStore from 'connect-mongo'
import { fork } from 'child_process';
import compression from 'compression';
// Logger
import { logRequest, logNotImplementedRequest } from './src/middlewares/middleware.logs.js';
import { logger } from './src/config/logger.js';

//--------------------------------//
// DOTENV
//--------------------------------//
import dotenv from 'dotenv';
dotenv.config();

export function startServer(port){
    //--------------------------------//
    // NORMALIZR
    //--------------------------------//
    // import util from 'util';
    function print(objeto) {
        logger.info(util.inspect(objeto,false,12,true))
    };

    //----------------------//
    // Para usar __dirname  //
    //----------------------//
    // Para poder guardar archivos sin problemas
    // import path from 'path';
    // import { fileURLToPath } from 'url';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    //--------------------------------//
    // BCRYPT
    //--------------------------------//
    // Hash password
    //  Using bcrypt, verify password
    const passwordOk = (password, user) => {
        return bcrypt.compareSync(password, user.password);
    };

    //  Using bcrypt, encrypt password
    const createHash = (password) => {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    };

    //  Initializations
    const app = express(); //creo la app en express
    const httpServer = createServer(app);  //Creo la del server en http importando express
    const io = new Server(httpServer); //Creo un server de socketIO con el httpServer
    const chat = new containerMongoose();
    const productos = new containerMongoose();
    const usuarios = new containerMongoose();

    /* ------------------------------- */
    /*      HANDLEBARS                 */
    /* ------------------------------- */
    app.engine('handlebars', handlebars.engine()); // Indico que voy a utilizar el engine de Handlebars

    //  Views setting
    app.set('views', './views');
    app.set('view engine', 'handlebars');

    app.use(express.static('./public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(logRequest); // Aplica el middleware de logger logRequest en toda la app.

    //  Settings
    app.use('/static', express.static('/public')); // Mediante el middleware express.static, indico la ruta que tendrán mis ficheros estáticos


    httpServer.listen(port, () => {
        console.log("Server online on: ", `${process.env.HOST}:${port}`)
    });

    httpServer.on("error", (error) => console.log("Error en servidor", error));

    /* ------------------------------- */
    /*  Persistencia por Mongo  Atlas  */
    /* ------------------------------- */
    // import MongoStore from 'connect-mongo'
    const advancedOptions = { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    };
    //------------------------------------------------//

    app.use(cookieParser(process.env.COOKIE));
    app.use(session({
        /* ------------------------------- */
        /*  Express Session                */
        /* ------------------------------- */
        store: MongoStore.create({
            mongoUrl: process.env.MONGOOSE_URL,
            mongoOptions: advancedOptions,
            collectionName: 'sessions',
            ttl: 1 * (1000 * 60)
        }),

        secret: process.env.SESSION_SECRET,
        resave: false,
        rolling: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 10 * (1000 * 60)
        }
    }));
    //------------------------------------------------//

    //-------------------------//
    // Middleware de Passport //
    //-----------------------//
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((username, done) => {
        try {
            return done(null, username);
        } catch (error) {
            return done(error);
        }
    });

    passport.deserializeUser((username, done) => {
        const user = usuarios.getUser(username);
        return done(null, user)
    });

    //-----------------------------//
    // Passport Middleware Register
    //-----------------------------//
    passport.use('register', new LocalStrategy ({
        passReqToCallback: true
        }, async (req, username, password, done) => {
            const { email } = req.body
            
            const userAlreadyRegistered = await usuarios.getUser(username);
            
            if (userAlreadyRegistered) {
                console.log('usuario en uso');
                return done(null, false)
            }

            const newUser = {
                username,
                email,
                password: createHash(password)
            }

            usuarios.createUser(newUser);

            // Done es el callback de verificacion como next. El 1º arg de Done: si hubo un error o no. El 2º arg: objeto
            done(null, newUser);

        }
    ));

    //--------------------//
    // Passport Login     //
    //--------------------//
    passport.use('login', new LocalStrategy(
        async (username, password, done) => {
            
            const user = await usuarios.getUser(username);
            
            if (!user) {
                return done(null, false, console.log('Usuario o contraseña incorrectos' ));
            } 
            
            if (!passwordOk(password, user)) {
                    return done('password incorrecta', user)
            } 
            
            user.contador = 0; //Dentro de usuario crea la variable contador inicializada en 0

            return done(null, user)

        }
    ))

    //------------------//
    // Rutas Middleware //
    //------------------//
    const requireAuthentication = (req, res, next) => {
        return req.isAuthenticated() ? next() : res.redirect("/login");
    };

    //-------------------//
    // Rutas 
    //-------------------//
    // RUTA REGISTER
    app.get('/register', (req, res) => {
        res.render('register')
    });

    app.post('/register', passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/'}));

    app.get('/failregister', (req, res)=> {
        res.render('failregister')
    });

    // Rutas de login
    app.get('/login', (req, res) => {
        if (req.isAuthenticated()){
            res.render('/')
        } else {
            res.render('login')
        }
    });

    app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/' }))

    app.get('/faillogin', (req, res) => {
        res.render('faillogin')
    })

    //  Rutas index
    app.get("/", requireAuthentication, async  (req, res) => {
        const usuario = req.session.passport.user.username
        const username = await usuarios.getUser(usuario)
        res.render(
                'index', 
                { user: username.username })
    });

    //  Rutas Logout
    app.get('/logout', (req, res) => {
        const username = req.session.username;
        req.session.destroy( err => {
            if (!err) {
                res.render('logout', { username })
            } else {
                res.send({ status: 'logout error', body: err })
            }
        })
    });

    // Rutas: Productos Test
    app.get("/api/productos-test", fakerProducts);  // Route for fake products

    // Ruta: Info (bloqueante)
    // app.get("/info", (req, res) => {
    //     console.log(req.url)
    //     res.render('info', {info: sysInfo()})
    // });
    // Ruta: Info
    app.get("/info", (req, res) => {
        res.render('info', {info: sysInfo()})
    });

    //  Ruta: Info (con compresión GZIP)
    app.get("/infoCompGzip", compression(), (req, res) => {
        res.render('info', {info: sysInfo()})
    });

    //  Ruta: Randoms
    app.get("/api/randoms", (req, res) => {
        //cant recibe el numero por query y lo convierte a tipo Number
        // Si no recibe valor, entonces por defecto es 100000000
        const cant = req.query.cant ? Number(req.query.cant) : 100000000;
        const forked = fork(path.resolve(process.cwd(), "./src/process/getNumbersCount.js"));
        forked.on("message", (numbers) => res.json(numbers));
        forked.send({ cant });
    });

    //  Rutas No Implementadas
    app.get('*', logNotImplementedRequest, (req, res) => {
        const { url, method } = req;
        // res.send(`Ruta ${method} ${url} no esta implementada`);
        res.send(`Requested route ${url} with ${method} method is not implemented`);
    });

    /* ------------------------------- */
    /*      SOCKETS                    */
    /* ------------------------------- */
    // Conexión realizada. Detecta cada socket de un cliente que se conecte
    io.on("connection", async (socket) => {
        // let messages = toSocketMessages();
            let listaMensajes = await chat.getChat()
            let strin = JSON.stringify(listaMensajes)
            let data = JSON.parse(strin)
            //  Mensaje original
            let mensajes = {
                id: 'backendCoder09',
                messages: data
            };
            // SCHEMA DESING
            const authorSchema = new schema.Entity("author",{},{idAttribute: "email"});
            const messageSchema = new schema.Entity("message", {
                author: authorSchema
            });
            const messagesSchema = new schema.Entity("messages", {
                messages: [messageSchema]
            });
            //  Mensaje Normalizado
            let messagesNorm = normalize(mensajes, messagesSchema);
            let messages = messagesNorm;
            let normalized = messagesNorm;
            //  Obtiene la longitud de los mensajes original y normalizado
            const lengthObjetoOriginal = JSON.stringify(mensajes).length;
            const lengthObjNormalizado = JSON.stringify(messagesNorm).length;
        // let products = toSocketProducts();
            let products = await productos.get();
        
        //  PRODUCTOS
        socket.emit("products", products);
        socket.on("newProduct", async (data) => {
            // await insertProduct(data)
            await productos.add(data);               
            // products = await toSocketProducts();
            products = await productos.get();
            io.sockets.emit("products", products); //Envia productos actualizados
        });
        //MENSAJES
        socket.emit("messages", messages);
        socket.on("newMessage", async (data) => {
            // await insertMessage(data);
                // Insert a message
                if (listaMensajes.length === 0) {
                    return await chat.addChat({...data, fyh: new Date().toLocaleString(), id: 1})
                }
                await chat.addChat({...data, fyh: new Date().toLocaleString(), id: listaMensajes.length +1});
            // messages = await toSocketMessages();
                listaMensajes = await chat.getChat()
                strin = JSON.stringify(listaMensajes)
                data = JSON.parse(strin)
                //  Mensaje original
                mensajes = {
                    id: 'backendCoder09',
                    messages: data
                };
                // SCHEMA DESING
                const authorSchema = new schema.Entity("author",{},{idAttribute: "email"});
                const messageSchema = new schema.Entity("message", {
                    author: authorSchema
                });
                const messagesSchema = new schema.Entity("messages", {
                    messages: [messageSchema]
                });
                //  Mensaje Normalizado
                const messagesNorm = normalize(mensajes, messagesSchema);
                let messages = messagesNorm;
                console.log("Objeto Normalizado");
                print(messagesNorm);
                console.log("  ---------   ");
            io.sockets.emit("messages", messages);
        });
    });
}