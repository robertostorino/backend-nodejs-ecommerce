import { normalize, denormalize, schema } from "normalizr";

const mensajes = {
    id: '100',
    messages: [
        {
            author: {
                email: 'r@gmail.com',
                nombre: 'Roberto',
                apellido: 'Storino',
                edad: '36',
                alias: 'Rober',
                avatar: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/454.jpg'
            },
            dateAndTime: '12/1/2023, 09:44:03',
            text: 'Primer mensaje de Roberto',
            id: 0
        },
        {
            author: {
                email: 'r@gmail.com',
                nombre: 'Roberto',
                apellido: 'Storino',
                edad: '36',
                alias: 'Rober',
                avatar: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/454.jpg'
            },
            dateAndTime: '12/1/2023, 09:44:23',
            text: 'Segundo mensaje de Roberto',
            id: 1
        },
        {
            author: {
                email: 'r@gmail.com',
                nombre: 'Roberto',
                apellido: 'Storino',
                edad: '36',
                alias: 'Rober',
                avatar: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/454.jpg'
            },
            dateAndTime: '12/1/2023, 09:45:37',
            text: 'Tercer mensaje de Roberto',
            id: 5
        },
        {
            author: {
                email: 'l@gmail.com',
                nombre: 'Laura',
                apellido: 'Polansky',
                edad: '34',
                alias: 'Lau',
                avatar: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/433.jpg'
            },
            dateAndTime: '12/1/2023, 09:45:27',
            text: 'Primer mensaje de Laura',
            id: 2
        },
        {
            author: {
                email: 'l@gmail.com',
                nombre: 'Laura',
                apellido: 'Polansky',
                edad: '34',
                alias: 'Lau',
                avatar: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/433.jpg'
            },
            dateAndTime: '12/1/2023, 10:01:27',
            text: 'Segundo mensaje de Laura',
            id: 8
        }
    ]
}


/////////       DEFINIR SCHEMAS      /////////

//  Defino un esquema de autor. 
//  Los datos del autor se almacenar??n en el objeto authorSchema
const authorSchema = new schema.Entity("author", {}, 
    { idAttribute: 'email' }
);

//  Defino un esquema de mensaje. 
//  Los datos del mensaje se almacenar??n en el objeto messageSchema
const messageSchema = new schema.Entity("message", 
    { author: authorSchema, }
);

//  Defino un esquema de mensajes. 
//  Los datos de los mensajes se almacenar??n en el objeto messagesSchema
const messagesSchema = new schema.Entity("messages", 
    { messages: [messageSchema], }
);



//  utils
import util from 'util';
import { logger } from "../config/logger";

function print(objeto) {
    logger.info(util.inspect(objeto, false, 12, true))
};

logger.info("Objeto Original");
print(mensajes);
logger.info("  ---------   ");

//  NORMALIZADO
//  Primer par??metro: el nombre del objeto => messageWithId
//  Segundo par??metro: el nombre del esquema => messagesSchema
const normalizedMessage = normalize(mensajes,messagesSchema);
logger.info("Objeto Normalizado");
print(normalizedMessage);
logger.info("  ---------   ");

//  DESNORMALIZAR
//  Primer par??metro: el resultado del objeto normalizado
//  Segundo par??metro: el schema
//  Tercer par??metro: las entidades del objeto normalizado
const denormalizedMessage = denormalize(normalizedMessage.result, messagesSchema, normalizedMessage.entities);
logger.info("Objeto DesNormalizado");
print(denormalizedMessage);
logger.info("  ---------   ");

//  LENGTH

const lengthObjetoOriginal = JSON.stringify(mensajes).length;
const lengthObjNormalizado = JSON.stringify(normalizedMessage).length;
const lengthObjDenormalizado = JSON.stringify(denormalizedMessage).length;

//  CALCULO DE PORCENTAJE

const porcentajeCompresion = ( original, normalizado ) => {
    return  Math.trunc(100 - ( (100 * normalizado) / original ));
}


//  IMPRESIONES

logger.info('-----OBJETO ORIGINAL-----');
logger.info('Longitud del objeto original: ' + lengthObjetoOriginal +'\n');

logger.info('-----OBJETO NORMALIZADO-----');
logger.info('Longitud del objeto normalizado: ' + lengthObjNormalizado +'\n');

logger.info('-----OBJETO DENORMALIZADO-----');
logger.info('Longitud del objeto denormalizado: ' + lengthObjDenormalizado +'\n');

logger.info('-----PORCENTAJE DE COMPRESION-----');
logger.info('Porcentaje de compresi??n: ' + porcentajeCompresion(lengthObjetoOriginal, lengthObjNormalizado) +'%');







// export { messagesSchema, normalizeMessage };