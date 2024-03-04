import { LogNamespace } from "./logger.types";

export default {
    logs: {
        dir: './logdir',
        maxFiles: 3,
        maxFileSize: 5242880,
        levels: {
            default: 'verbose'
        } as Record<LogNamespace | 'default', string>,
        enableConsole: false
    }
}