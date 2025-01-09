module.exports = ({ meta, config, managers }) => {
    return ({ req, res, next }) => {
        if (!req.headers.token) {
            console.log('token required but not found')
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized', message: 'Authorization token is required' });
        }
        let decoded = null;
        try {
            decoded = managers.token.verifyLongToken({ token: req.headers.token });
            if (!decoded) {
                console.log('failed to decode-1')
                return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized', message: 'Invalid or expired token passed' });
            };
        } catch (err) {
            console.log('failed to decode-2')
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized', message: 'Invalid or expired token passed' });
        }
        next(decoded);
    }
}