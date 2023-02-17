const minRange = 1;
const maxRange = 1000;

export const generateRandomNumbers = (cant) => {
    const numbers = [];
    for (let i = 0; i < cant; i++){
        numbers.push(Math.floor((Math.random() * maxRange) + minRange))
    }
    return numbers;
};