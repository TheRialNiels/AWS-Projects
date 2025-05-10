import * as cors from '../../lib/cors-util.mjs'

import { expect } from 'chai'

describe('Test cors util', () => {
    it('use createOriginHeader to make a header for no origin', () => {
        const result = cors.createOriginHeader(undefined, [])
        expect(result).to.deep.equal({})
    })

    it('use createOriginHeader to make a header for a single origin', () => {
        const origin = 'https://amazon.com'
        const allowedOrigins = [origin]
        const result = cors.createOriginHeader(origin, allowedOrigins)
        expect(result).to.deep.equal({ 'Access-Control-Allow-Origin': origin })
    })

    it('use createOriginHeader to make a header for one of several origins', () => {
        const origin = 'https://amazon.com'
        const allowedOrigins = [
            'https://example.com',
            origin,
            'http://amazon.com',
        ]
        const result = cors.createOriginHeader(origin, allowedOrigins)
        expect(result).to.deep.equal({ 'Access-Control-Allow-Origin': origin })
    })

    it('use createOriginHeader to make a header for a disallowed origin', () => {
        const origin = 'https://not-amazon.com'
        const allowedOrigins = []
        const result = cors.createOriginHeader(origin, allowedOrigins)
        expect(result).to.deep.equal({})
    })

    it('use createOriginHeader to make a header for a disallowed origin', () => {
        const origin = 'https://not-amazon.com'
        const allowedOrigins = [
            'https://example.com',
            'https://amazon.com',
            'https://amplifyapp.com',
        ]
        const result = cors.createOriginHeader(origin, allowedOrigins)
        expect(result).to.deep.equal({})
    })

    it('use createPreflightResponse to make CORS preflight headers', () => {
        const origin = 'https://amazon.com'
        const allowedOrigins = [origin]
        const allowedMethods = ['CREATE', 'OPTIONS']
        const allowedHeaders = ['Authorization']
        const maxAge = 8400
        const result = cors.createPreflightResponse(
            origin,
            allowedOrigins,
            allowedMethods,
            allowedHeaders,
            maxAge,
        )
        expect(result).to.deep.equal({
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'CREATE,OPTIONS',
                'Access-Control-Allow-Headers': 'Authorization',
                'Access-Control-Max-Age': 8400,
            },
            statusCode: 204,
        })
    })

    it('compile pattern with no wildcards', () => {
        const pattern = 'https://amazon.com'
        const regex = cors.compileURLWildcards(pattern)
        expect(pattern).match(regex)
        expect('https://example.com').not.match(regex)
    })

    it('test pattern with wildcard', () => {
        const pattern = 'https://*'
        const regex = cors.compileURLWildcards(pattern)
        expect('https://example.com').match(regex)
    })

    it('test pattern with subdomain wildcard', () => {
        const pattern = 'https://*.amazon.com'
        const regex = cors.compileURLWildcards(pattern)
        expect('https://restaurants.amazon.com').match(regex)
        expect('https://amazon.com').not.match(regex)
        expect('https://x.y.z.amazon.com').match(regex)
        expect('https://restaurants.example.com').not.match(regex)
    })

    it('test pattern with subdomain wildcard against malicious input', () => {
        const pattern = 'https://*.amazon.com'
        const regex = cors.compileURLWildcards(pattern)
        expect('https://restaurants.amazon.com').match(regex)
        expect('https://my.website/restaurants.amazon.com').not.match(regex)
    })
})
