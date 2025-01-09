module.exports = class ResponseDispatcher {
    constructor() {
        this.key = "responseDispatcher";
    }
    dispatch(res, { ok, data, code, errors, message, msg }) {
        let statusCode = code ? code : (ok == true) ? 200 : 400;
        const errorObj = (ok == true) ? {} : { errors: errors || []}
        return res.status(statusCode).send({
            ok: ok || false,
            message: msg || message || '',
            data: data || null,
            ...errorObj
        });
    }
}