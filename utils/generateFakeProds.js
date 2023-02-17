import { faker } from "@faker-js/faker";
faker.locale = 'en';

const generateFakeProds = () => {
    return {
        title: faker.commerce.productName(),
        price: faker.commerce.price(),
        thumbnail: faker.image.avatar()
    }
};

export { generateFakeProds };