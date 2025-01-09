module.exports = ({ meta, config, managers }) =>{
    return ({req, res, next})=>{
        if(!req.params.id) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 400, errors: 'bad request', message: 'Id params is required' });
        }
        next(req.params);
    }
}