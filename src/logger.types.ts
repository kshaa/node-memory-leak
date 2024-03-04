export const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5,
}
export type LogLevel = keyof typeof LEVELS
export const logLevels = Object.keys(LEVELS) as LogLevel[]

export type LogNamespace = string 
export const logNamespaces: LogNamespace[] = [
    'service.000',
    'service.001',
    'service.002',
    'service.003',
    'service.004',
    'service.005',
    'service.006',
    'service.007',
    'service.008',
    'service.009',
    'service.010',
    'service.011',
    'service.012',
    'service.013',
    'service.014',
    'service.015',
    'service.016',
    'service.017',
    'service.018',
    'service.019',
    'service.020',
    'service.021',
    'service.022',
    'service.023',
    'service.024',
    'service.025',
    'service.026',
    'service.027',
    'service.028',
    'service.029',
    'service.030',
    'service.031',
    'service.032',
    'service.033',
    'service.034',
    'service.035',
    'service.036',
    'service.037',
    'service.038',
    'service.039',
    'service.040',
    'service.041',
    'service.042',
    'service.043',
    'service.044',
]

export type LogOptions = {
    dir?: string
    maxLogSize?: number
    disableDefaultTransports?: boolean
}
