import parseArg from 'minimist';

const config = {
    alias: {
        p: 'port',
        m: 'mode'
    },
    default: {
        port: 8080,
        mode: 'FORK'
    }
};

const { port, mode } = parseArg(process.argv.slice(2), config);


export { 
    port, 
    mode
};