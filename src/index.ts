import { getLogger } from './logger'
import { LEVELS, logNamespaces } from './logger.types'
import { faker } from '@faker-js/faker';

function randomNth<A>(xs: A[]): A {
    return xs[Math.floor((Math.random() * xs.length))];
} 

const logGenerators: (() => unknown)[] = (function () {
    const a = faker.lorem.sentences
    const b = faker.company.catchPhrase
    const c = faker.finance.bitcoinAddress
    const d = () => ({
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        gender: faker.person.gender()
    })
    const e = () => ({
        collation: faker.database.collation(),
        currency: faker.finance.currency()
    })
    const f = () => ({
        buzz: faker.company.buzzNoun(),
        currency: faker.finance.creditCardIssuer()
    })
    const g = () => ({
        a: e(),
        b: [d(), e(), f()]
    })
    const h = () => ({
        a: g(),
        b: [g(), g(), g()]
    })

    return [
        a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
    ]
})()

const generateLog = (): unknown => {
    const generator = randomNth(logGenerators)
    const value = generator()

    return value
}

const generateLogs = (n: number): unknown[] => {
    return [...Array(10).keys()].map(() => { return generateLog() })
}

// For every namespace, produce N logs every M milliseconds
const n = 200
const m = 50
for (const ns of logNamespaces) {
    const logger = getLogger(ns)
    setInterval(() => {
        const logs = generateLogs(n)
        for (const log of logs) {
            const level = randomNth(Object.keys(LEVELS))
            logger.log(level, log)
        }
    }, m)
}
