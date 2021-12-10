import lib from '@rongji/rjmain-fe/packages/base-view/lib/utils'
import dialog from "./dialog";
import service from "../index";

const url = {
    getUrlList: function (url, arg, sep) {
        return unescape(this.getUrlParam.apply(this, arguments))
    },
    getUrlParam: function (url, arg, sep) {
        let reg = new RegExp('(^|\\?|#|' + (sep = sep ? sep : '&') + ')' + arg + '=([^' + sep + ']*)(' + sep + '|$)', 'i');
        return (reg = (url ? url : location.search).match(reg)) ? reg[2] : ''
    },
    setUrlParam: function (url, arg, val, sep) {
        if (!arg) return url
        let pattern = new RegExp('(^|\\?|#|' + (sep = sep ? sep : '&') + ')' + arg + '=([^' + sep + ']*)(' + sep + '|$)', 'i')
        let res = url.match(pattern)
        return res ? (url.replace(pattern, res[1] + arg + '=' + val + res[3])) : (url + ((new RegExp(sep + '$')).test(url) ? '' : sep) + arg + '=' + val)
    },
    getUrlHashParam: function (arg, sep) {
        return this.getUrlParam(window.location.hash, arg, sep);
    },
    setUrlHashParam: function (arg, val, sep) {
        return window.location.hash = this.setUrlParam(window.location.hash, arg, val, sep);
    },
    getHostFromURL: function (sUrl, defHost) {
        return this.getUrlHost(sUrl, defHost && typeof (defHost) == 'string' ? {
            host: defHost,
            protocol: location.protocol
        } : undefined).host;
    },
    getUrlHost: function (sUrl, def) {
        if (!(def && typeof (def) == 'object' && def.hasOwnProperty('host') && def.hasOwnProperty('protocol'))) def = location;
        let res = (typeof (sUrl) == 'string' ? sUrl : '').match(/^(http:|https:|ws:|wss:|:)?\/\/([^\/\\\?&#\=]*)/i);
        return res && res[2] ? ({
            protocol: res[1] && res[1] != ':' ? res[1] : def.protocol,
            host: res[2]
        }) : def
    },
    matchUrl: function (url) {
        let res = (typeof (url) == 'string' ? url : '').match(/^((http:|https:|ws:|wss:|:)?[\/\\]{2,}(([^:\/\\\?&#\=]*)(:(\d*))?))?([^\?#]*)([^#]*)(#.*)?/i);
        return {
            href: res[0],
            origin: res[1] ? res[1].replace(/(\\|\/){2,}/g, '//') : '',
            protocol: res[2] == ':' ? '' : res[2],
            host: res[3],
            hostname: res[4],
            port: res[6] ? res[6] : '',
            pathname: res[7] ? res[7].replace(/(\\|\/)+/g, '/') : '/',
            search: res[8],
            hash: res[9] ? res[9] : ''
        }
    },
    getUrl: function (url, base) {
        let res = this.matchUrl(url);
        if (!res.protocol) res.protocol = location.protocol;
        if (!res.hostname) {
            let pathname;
            if (typeof (base) == 'string' && (base = this.matchUrl(base)).host) {
                res.hostname = base.hostname;
                res.host = base.hostname + (base.port && base.port != '80' ? ':' + base.port : '');
                if (!base.protocol) res.protocol = base.protocol;
                pathname = base.pathname;
            } else {
                res.hostname = location.hostname;
                res.host = location.host;
                pathname = location.pathname;
            }
            if (/^(\.\.\/)/.test(res.pathname)) {
                res.pathname = res.pathname.replace(/^(\.\.\/)/, pathname.replace(/(.*)(\/.*\/.*)$/, function () { return arguments[1] + '/' }))
            } else if (/^(.\/)/.test(res.pathname)) {
                res.pathname = res.pathname.replace(/^(\.\/)/, pathname.replace(/(.*)(\/.*)$/, function () { return arguments[1] + '/' }))
            } else if (!/^\//.test(res.pathname)) {
                res.pathname = pathname.replace(/(.*)(\/.*)$/, function () { return arguments[1] + '/' }) + res.pathname
            }
        }
        res.origin = res.protocol + '//' + res.host;
        res.href = res.origin + (/^(\/|\\)/.test(res.pathname) ? '' : '/') + res.pathname + res.search + res.hash
        return res;
    },
    newUrl: function (url, base) {
        base = typeof (base) == 'string' ? base : location.origin + location.pathname;
        try {
            return new URL(url, base);
        } catch (e) {
            return this.getUrl(url, base);	//ie
        }
    }
}

export default {
    ...lib,
    ...dialog,
    url,
    queryFields(model, nonUnderscore, prefix) {
        if (!model)
            return new Error('the parameter of model is null')
        let fields = []
        for (let key in model) {
            if (model.hasOwnProperty(key))
                fields.push({
                    expression: prefix ? prefix + key : key,
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
                res[key] = (conf = model[key]) ? (typeof conf.default === 'function' ? conf.default.call(this, key, conf) : conf.default) : undefined
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
    },
    modelFormat(model, map, parseKey) {
        if (!parseKey)
            parseKey = 'format'     //format, parse , ...
        let conf, parse
        for (let key in map) {
            if ((conf = model[key]) && typeof (parse = conf[parseKey]) == 'function') {
                map[key] = parse.call(this, map[key])
            }
        }
    },
    modelAlias(model) {
        return model.replace(/.*\./, '')
    },
    encodeXML(code) {
        return (typeof code !== 'string') ? code :
            code.replace(/"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g,
                $0 => `&#${(($0 = $0.charCodeAt(0)) === 0x20) ? 0xA0 : $0};`
            )
    }
}
