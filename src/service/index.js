import lib from "./utils";
import models from './model'
import apis from './apis'
import query from './query'

export default {
    models,
    ...apis,
    ...lib,
    ...query
}
