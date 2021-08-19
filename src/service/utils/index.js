import lib from '@rongji/rjmain-fe/packages/base-view/lib/utils'

export default {
    ...lib,
    openForm(id, component, componentProps) {
        this.$popbox.open({
            id,
            component,
            parent: this,
            componentProps,
            isMax: true,
            isShowHeader: false,
            canMaximum: true,
            canMinimize: true,
            canRefresh: true
        }).then(res => {
            this.refresh();
        });
    },
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
