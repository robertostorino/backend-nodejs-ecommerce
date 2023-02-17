import { containerMongoose } from "../containers/containerMongoose.js";
import {generateFakeProds} from "../../utils/generateFakeProds.js"
import { logger } from "../config/logger.js";
const Producto = new containerMongoose();

// Generate fake prods
async function fakerProducts (req, res) {
    let productsFaker = []; //   Generate an empty product's array
    let cant = req.query.cant || 5;
    for (let i = 0; i < cant; i++) {
        //It'll generate products and then save them
        let newProduct = generateFakeProds(); //Generate product with faker
        // console.log(newProduct);
        productsFaker.push(newProduct); //Shows new products
        logger.info(productsFaker)
    }
    let exist = productsFaker.length > 0 ? true : false; // Flag if there are products exist is true, else false
    logger.info(exist);
    res.render("fake", { products: productsFaker, listExists: exist, layout: false}); // Render fake products
}

//-----------------------------------------//
//     PRODUCTO
//-----------------------------------------//

const get = (req, res) => {
    const id = req.params.id
    if (id) {
        Producto.get(id)
            .then(productos => {
                res.json(productos);
            })
            .catch(err => {
                res.json(err);
            })
    }
    else{
        Producto.get()
            .then(productos => {
                res.render('index', {productos});
            })
            .catch(err => {
                res.json(err);
            })
    }
}

const add = (req, res) => {
    const newProducto = {
        timestamp: Date.now(),
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        codigo: req.body.codigo,
        precio: req.body.precio,
        foto: req.body.foto,
        stock: req.body.stock,
    }
    Producto.add(newProducto)
        .then(id => {
            res.json({ id: id }, res.redirect('/productos'));
        })
        .catch(err => {
            res.json(err);
        })
}

const update = (req, res) => {
    const producto = {
        timestamp: Date.now(),
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        codigo: req.body.codigo,
        precio: req.body.precio,
        foto: req.body.foto,
        stock: req.body.stock,
    }
    Producto.update(req.params.id, producto)
        .then(id => {
            res.json({ id: id });
        })
        .catch(err => {
            res.json(err);
        })
};

const Delete = (req, res) => {
    Producto.delete( req.params.id)
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
    Delete,
    fakerProducts
};