import lib from '@rongji/rjmain-fe/packages/base-view/lib/utils'
import dialog from "./dialog";

export default {
    ...lib,
    ...dialog,
    queryFields(model, nonUnderscore) {
        if (!model)
            return new Error('the parameter of model is null')
        let fields = []
        for (let key in model) {
            if (model.hasOwnProperty(key))
                fields.push({
                    expression: key,
                    alias: nonUnderscore ? key : lib.camelToUpperUnderscore(key)
                })
        }
        if (fields.length < 1)
            return new Error('can not find any filed in the model . ')
        return fields
    },
    modelDefaults(model) {
        let res = {}, conf
        for (let key in model) {
            if (model.hasOwnProperty(key))
                res[key] = (conf = model[key]) ? conf.default : undefined
        }
        return res
    },
    modelValidators(model) {
        let res = {}, conf
        for (let key in model) {
            if (model.hasOwnProperty(key) && (conf = model[key]) && conf.validator)
                res[key] = conf.validator
        }
        return res
    }
}
