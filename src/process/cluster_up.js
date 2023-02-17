import { startServer } from "../../app.js";
import { sysInfo } from "./sysInfo.js";
import cluster from 'cluster'
import { logger } from "../config/logger.js";

export function clusterUp(port) {
    if (cluster.isPrimary) {
        logger.info("Executing app in cluster mode\n");
        const cpus = sysInfo().processors;

        // Forking to workers
        for (let i = 0; i < cpus; i++) cluster.fork();

        cluster.on("exit", (worker) => {
            logger.info(`Worker ${worker.process.pid} died Reliving ... \n`);
            cluster.fork();
        });

        cluster.on("listening", (worker) => {
            logger.info(
                `New Worker ${worker.process.pid} is alive and listening\n`
            );
        });
    } else {
        startServer(port)
    }
}