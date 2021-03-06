import lib from "../utils";
import {apis} from '../apis'

function getInt(value, defaultValue) {
    return isNaN(value = parseInt(value)) ? (defaultValue ? defaultValue : 0) : value
}

function query(api, model, exp, value, offset, limit, before) {
    const request = lib.sql({
        fields: lib.queryFields(model.form),
        model: model.model,
        limit: [offset ? offset : 0, limit ? limit : 1]
    }, exp, value)
    if(typeof before == "function"){
        before(request)
    }
    return this.$utils.ajax.post(api, request)
}

export function selectOne(model, exp, value, before) {
    return query.call(this, apis.query(), model, exp, value, 0, 2, before)
}

export function select(model, exp, value, offset, limit, before) {
    return query.call(this, apis.query(), model, exp, value, getInt(offset, 0), getInt(limit, 2), before)
}

export function selectPage(model, exp, value, offset, limit, before) {
    return query.call(this, apis.queryPage(), model, exp, value, getInt(offset, 0), getInt(limit, 2), before)
}

export function selects(request) {
    return this.$utils.ajax.post(apis.queries(), request)
}

export function ajax(api, request, config){
    return this.$utils.ajax.post(api, request, config)
}

export function get(api, request, config){
    return this.$utils.ajax.get(api, request, config)
}

export function insert(model, values) {
    if (model.form)
        lib.modelFormat(model.form, values)
    return this.$utils.ajax.post(apis.insert(), {
        model: model.model,
        values
    })
}

export function update(model, values, exp, value) {
    if (model.form)
        lib.modelFormat(model.form, values)
    return this.$utils.ajax.post(apis.update(), lib.sql({
        model: model.model,
        values
    }, exp, value))
}

export function deleter(model, exp, value) {
    if (!exp)
        throw new Error('the parameter of expression must not be null .');
    return this.$utils.ajax.post(apis.delete(), lib.sql({
        model: model.model
    }, exp, value))
}

export default {
    select,
    selectOne,
    selectPage,
    selects,
    insert,
    update,
    delete: deleter,
    ajax,
    get
}
