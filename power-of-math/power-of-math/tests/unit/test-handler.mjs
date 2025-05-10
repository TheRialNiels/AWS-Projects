import { expect } from 'chai'
import { handler } from '../../app.mjs'

describe('Tests handler', () => {
    let context
    const testEvent = {
        body: {
            base: 5,
            exponent: 5,
        },
        headers: {
            Origin: 'https://www.example.com',
        },
    }

    before(() => {
        process.env.TABLE_NAME = 'PowerOfMathDatabase'
    })

    it('verifies successful response', async () => {
        const result = await handler(testEvent, context)

        expect(result).to.be.an('object')
        expect(result.statusCode).to.equal(200)
        expect(result.body).to.be.a('string')

        const response = JSON.parse(result.body)
        expect(response).to.be.a('string')
        expect(response).to.equal('Your result is: 3125')
    })
})
