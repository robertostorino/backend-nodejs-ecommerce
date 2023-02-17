import { containerMongoose } from "../containers/containerMongoose.js";
const Usuario = new containerMongoose();

//-----------------------------------------//
//     Usuario
//-----------------------------------------//

const get = (req, res) => {
    const id = req.params.id
    if (id) {
        Usuario.get(id)
            .then(usuarios => {
                res.json(usuarios);
            })
            .catch(err => {
                res.json(err);
            })
    }
    else{
        Usuario.get()
            .then(usuarios => {
                res.render('index', {usuarios});
            })
            .catch(err => {
                res.json(err);
            })
    }
}

const add = (req, res) => {
    const newUsuario = {
        timestamp: Date.now(),
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    }
    Usuario.add(newUsuario)
        .then(id => {
            res.json({ id: id }, res.redirect('/productos'));
        })
        .catch(err => {
            res.json(err);
        })
}

const update = (req, res) => {
    const usuario = {
        timestamp: Date.now(),
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    }
    Usuario.update(req.params.id, usuario)
        .then(id => {
            res.json({ id: id });
        })
        .catch(err => {
            res.json(err);
        })
};

const Delete = (req, res) => {
    Usuario.delete( req.params.id)
        .then(id => {
            res.json({ id: id });
        })
        .catch(err => {
            res.json(err);
        })
};

export {
    get,
    add,
    update,
    Delete
};