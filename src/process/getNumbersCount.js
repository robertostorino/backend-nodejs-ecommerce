import { generateRandomNumbers } from "./genRandomNums.js";
import { logger } from "../config/logger.js";
const countNumbers = (numbers) => {
    const uniques = new Set(numbers); //Números sin repetir
    const data = {};
    uniques.forEach((number) => {
        const count = numbers.filter((item) => item === number).length;
        data[number] = count;
    });
    return data;
};

process.on("message", ({ cant }) => {
    logger.info('Hilo iniciado: ' + process.pid);
    const randomNumbers = generateRandomNumbers(cant);
    const counter = countNumbers(randomNumbers);
    process.send(counter);
});
