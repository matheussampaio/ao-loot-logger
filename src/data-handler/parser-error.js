class ParserError extends Error {
    constructor(msg, event) {
        super(msg)

        this.event = event
    }
}

module.exports = ParserError
