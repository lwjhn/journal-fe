import lib from "../utils";
import {apis} from '../apis'

export default {
    selectOne(model, exp, value) {
        return this.$utils.ajax.post(apis.query(), lib.sql({
            fields: lib.queryFields(model.form),
            model: model.model,
            limit: [0, 2]
        }, exp, value))
    },
    insert(model, values) {
        return this.$utils.ajax.post(apis.insert(), {
            model: model.model,
            values
        })
    },
    update(model, values, exp, value){
        return this.$utils.ajax.post(apis.update(), lib.sql({
            model: model.model,
            values
        }, exp, value))
    },
    delete(model, exp, value) {
        if(!exp)
            throw new Error('the parameter of expression must not be null .');
        return this.$utils.ajax.post(apis.delete(), lib.sql({
            model: model.model
        }, exp, value))
    },
}
