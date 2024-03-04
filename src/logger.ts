import { isError, isNumber } from 'lodash'
import path from 'path'
import { SPLAT } from 'triple-beam'
import winston, { format, transports } from 'winston'
import * as Transport from 'winston-transport';
import config from './config'
import { logLevels, LogNamespace, LogOptions } from './logger.types'

const OBJECTS = Symbol.for('objects')

const enumerateErrorFormat = format((info) => {
  info[OBJECTS] = []

  if (isError(info)) {
    info[OBJECTS].push(info)
  } else {
    info[OBJECTS].push(info.message ?? info)
  }
  if (info[SPLAT]) info[OBJECTS].push(...info[SPLAT])

  return info
})

function formatObject(object: unknown) {
  try {
    if (typeof object === 'string' || typeof object === 'number') {
      return object
    }

    if (isError(object)) {
      return `\n${object.stack}`
    }

    if (typeof object === 'object') {
      return `\n${JSON.stringify(object, null, 2)}`
    }

    return object
  } catch (err) {
    return `Failed to format object: ${err}`
  }
}

const expandAll = format((info) => {
  info.message = info[OBJECTS].map(formatObject).join(' ')
  return info
})

function textFormat(withLevel = true) {
  return format.printf((info) => {
    const { timestamp, message, level } = info
    const output = withLevel ? `${timestamp} - ${level}: ${message}` : `${timestamp}: ${message}`
    return output
  })
}

const defaultErrorTransport = new transports.File({
  level: 'error',
  filename: path.join(config.logs.dir, 'errors.log'),
  format: format.combine(enumerateErrorFormat(), expandAll(), textFormat()),
  maxFiles: config.logs.maxFiles,
  maxsize: config.logs.maxFileSize,
  tailable: true,
  options: { mode: 0o755, flags: 'a' },
})

const defaultServiceTransport = new transports.File({
  level: isNumber(config.logs.levels.default) ? logLevels[config.logs.levels.default] : config.logs.levels.default,
  filename: path.join(config.logs.dir, 'service.log'),
  format: format.combine(enumerateErrorFormat(), expandAll(), textFormat()),
  maxFiles: config.logs.maxFiles,
  maxsize: config.logs.maxFileSize,
  tailable: true,
  options: { mode: 0o755, flags: 'a' },
})

const container = new winston.Container({})

export function getLogger(namespace: LogNamespace, opt: LogOptions = {}): winston.Logger {
  let level = config.logs.levels?.[namespace] || config.logs.levels.default
  if (isNumber(level)) level = logLevels[level] // backward compatibility for supporting integer level

  const customTransports: Transport[] = []
  if (!opt.disableDefaultTransports) {
    customTransports.push(defaultServiceTransport)
    customTransports.push(defaultErrorTransport)

    if (config.logs.enableConsole) {
      customTransports.push(
        new transports.Console({
          level,
          format: format.combine(
            enumerateErrorFormat(),
            expandAll(),
            format.label({ label: namespace, message: true }),
            format.colorize({ message: true }),
            format.timestamp(),
            textFormat(false)
          ),
        })
      )
    }
  }

  customTransports.push(
    new transports.File({
      level,
      filename: path.join(opt.dir || config.logs.dir, `${namespace}.log`),
      format: format.combine(enumerateErrorFormat(), expandAll(), textFormat()),
      maxFiles: config.logs.maxFiles,
      maxsize: opt.maxLogSize || config.logs.maxFileSize,
      tailable: true,
      options: { mode: 0o755, flags: 'a' },
    })
  )

  return container.add(namespace, {
    level,
    format: format.combine(format.timestamp()),
    transports: customTransports,
  })
}
