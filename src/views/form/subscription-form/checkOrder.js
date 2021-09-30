import service from "../../../service";

function request(year, company, id) {
    return [
        {
            "model": service.models.orderLimit.model,
            "fields": [
                {
                    "expression": "company"
                },
                {
                    "expression": "subscribeBegin",
                    "alias": service.camelToUpperUnderscore('subscribeBegin')
                },
                {
                    "expression": "subscribeEnd",
                    "alias": service.camelToUpperUnderscore('subscribeEnd')
                },
                {
                    "expression": "limitCount",
                    "alias": service.camelToUpperUnderscore('limitCount')
                },
                {
                    "expression": "limitCopies",
                    "alias": service.camelToUpperUnderscore('limitCopies')
                },
                {
                    "expression": "limitAmount",
                    "alias": service.camelToUpperUnderscore('limitAmount')
                },
                {
                    "expression" : "now"
                }
            ],
            "limit": [0, 1],
            "where": {
                "expression": "subscribeYear = ? and company = ?",
                "value": [
                    year, company
                ]
            }
        },
        {
            "where": {
                "expression": "Subscription.govExpense is TRUE and Subscription.subscribeYear=? and (Subscription.id=? or ( (Subscription.verifyStatus=1 or Subscription.verifyStatus=2)) and Subscription.subscribeOrg=?)",
                "value": [year, id, company]
            },
            "model": service.models.subscription.model,
            "tableAlias": "Subscription",
            "join": [
                {
                    "type": "LEFT",
                    "model": service.models.order.model,
                    "tableAlias": "Order",
                    "on": {
                        "expression": "Subscription.id = Order.pid"
                    },
                    "join": [
                        {
                            "type": "LEFT",
                            "model": service.models.paper.model,
                            "tableAlias": "Paper",
                            "on": {
                                "expression": "Order.paperId = Paper.id"
                            }
                        }
                    ]
                }
            ],
            "fields": [
                {
                    "expression": "Paper.journal",
                    "alias": "journal"
                },
                {
                    "expression": "sum(Order.subscribeCopies)",
                    "alias": "copies"
                },
                {
                    "expression": "sum(Paper.yearPrice * Order.subscribeCopies)",
                    "alias": "amount"
                }
            ],
            "group": {
                "expression": "Paper.journal"
            }
        }
    ]
}

export default function (year, company, id) {
    return new Promise((resolve, reject) => {
        if (!(year && company && id)) {
            return reject('参数错误！[check order limit .]')
        }
        this.$utils.ajax.post(
            service.apis.queries(),
            request.call(this, year, company, id)
        ).then(response => {
            if(response[0].length<1){
                return resolve(`未找到相关配置！${year} ${company} ${id}`)
            }
            let limit = response[0][0],
                begin = limit.subscribeBegin ? service.string2Date(limit.subscribeBegin) : new Date(),
                now = (limit.now ? service.string2Date(limit.now) : new Date()).getTime(),
                end = limit.subscribeEnd ? service.string2Date(limit.subscribeEnd) : new Date()
            if(begin.getTime()-now>0 || end.getTime()-now<0){
                return reject(`当前时段不允许订阅，允许订阅时间：${service.formatDate(begin, 'yyyy-MM-dd')} 至 ${service.formatDate(end, 'yyyy-MM-dd')}`)
            }

            let count = 0, copies = 0, amount = 0
            response[1].forEach(item => {
                /^报纸$/.test(item.journal) ? count+=item.copies : copies+=item.copies
                if (item.amount) amount += item.amount
            })
            let condition = `${year}年 ${company}，当前报数${count}，刊数${copies}，总金额${amount}。  允许报数${limit.limitCount}，刊数${limit.limitCopies}，总金额${limit.limitAmount}。`
            if(limit.limitCopies>0 && count>limit.limitCopies){
                return reject(`报数(${count})，超过限制：${limit.limitCopies} ！`)   //reject(`报数刊数超过限制！ ${condition}`)
            }
            if(limit.limitCount>0 && copies>limit.limitCount){
                return reject(`刊数(${count}) ，超过限制：${limit.limitCount} ！`)   //reject(`刊数超过限制！ ${condition}`)
            }
            if(limit.limitAmount>0 && amount>limit.limitAmount){
                return reject(`金额(${count})，超过限制：${limit.limitAmount} ！`)   //reject(`总金额超过限制！ ${condition}`)
            }
            resolve('校验完成')
        }).catch(err => {
            reject(err)
        })
    })
}
