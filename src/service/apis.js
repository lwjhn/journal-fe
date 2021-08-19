export const project = 'journal'
export const apis = {
    baseUrl(queryType, model) {
        return `/${project}/normal/${queryType ? queryType : 'query'}/${model ? model : 'interface'}`
    },
    query(model) {
        return this.baseUrl('query', model)
    },
    queryPage(model) {
        return this.baseUrl('queryPage', model)
    },
    queries(model) {
        return this.baseUrl('queries', model)
    },
    update(model) {
        return this.baseUrl('update', model)
    },
    insert(model) {
        return this.baseUrl('insert', model)
    },
    delete(model) {
        return this.baseUrl('delete', model)
    }
}
export const viewUrl = function (model) {
    return {
        url: this.apis.queryPage(model),
        categoryUrl: this.apis.query(model)
    }
}
export default {
    project,
    apis,
    viewUrl
}
