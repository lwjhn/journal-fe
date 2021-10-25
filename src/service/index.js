import project from './project'
import lib from './utils'
import models from './model'
import apis from './apis'
import query from './query'

Number.prototype.toRoundFixed = function (length) {
    if (!length) {
        length = 0
    }
    let src = `${this}`
    if (src.indexOf('.') === -1)
        src += '.'
    src += new Array(length + 1).join('0')
    if (new RegExp(`^([+-])?(\\d+(\\.\\d{0,${length+1}})?)\\d*$`).test(src)) {
        let principal = `0${RegExp.$2}`, sign = RegExp.$1, fraction = RegExp.$3.length, nonOverflow = true
        if (fraction === length + 2) {
            fraction = principal.match(/\d/g)
            if (parseInt(fraction[fraction.length - 1]) > 4) {
                for (let i = fraction.length - 2; i >= 0; i--) {
                    fraction[i] = parseInt(fraction[i]) + 1
                    if (fraction[i] === 10) {
                        fraction[i] = 0
                        nonOverflow = i !== 1
                    } else break
                }
            }
            principal = fraction.join('').replace(new RegExp(`(\\d+)(\\d{${length}})\\d$`), '$1.$2')
        }
        if (nonOverflow) principal = principal.substr(1)
        return (sign + principal).replace(/\.$/, '')
    }
    return `${this}`
}

export default {
    models,
    ...project,
    ...apis,
    ...lib,
    ...query
}
