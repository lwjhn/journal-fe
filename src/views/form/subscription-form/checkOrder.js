import service from "../../../service";

/*
-- 必选刊物验证
SELECT group_concat(Paper.PUBLICATION), count(Paper.PUBLICATION)
FROM EGOV_JOURNAL_PAPER AS Paper
LEFT JOIN (
	SELECT Order.PAPER_ID AS id
	FROM EGOV_JOURNAL_SUBSCRIPTION AS Subscription
	LEFT JOIN EGOV_JOURNAL_ORDER AS Order ON Subscription.ID = Order.PID
	WHERE Subscription.GOV_EXPENSE is TRUE and ((Subscription.VERIFY_STATUS=1 or Subscription.VERIFY_STATUS=2) OR Subscription.id='1c9d791280804ffaa1fca5e20599004f') and Subscription.SUBSCRIBE_YEAR=2021 and Subscription.SUBSCRIBE_ORG='文电处'
) AS torder ON (torder.id = Paper.id)
WHERE Paper.REQUISITE IS TRUE AND Paper.IS_VALID IS TRUE AND torder.id IS NULL

--重复订阅验证
SELECT group_concat(Paper.PUBLICATION) AS publication, count(Paper.PUBLICATION) FROM EGOV_JOURNAL_PAPER AS Paper
INNER JOIN (
	SELECT Order.PAPER_ID AS id FROM EGOV_JOURNAL_SUBSCRIPTION AS Subscription
	LEFT JOIN EGOV_JOURNAL_ORDER AS Order ON Subscription.ID = Order.PID
	WHERE Subscription.GOV_EXPENSE is TRUE and ((Subscription.VERIFY_STATUS=1 or Subscription.VERIFY_STATUS=2) OR Subscription.id='1c9d791280804ffaa1fca5e20599004f') and Subscription.SUBSCRIBE_YEAR=2021 and Subscription.SUBSCRIBE_ORG='文电处'
	GROUP BY Order.PAPER_ID
	HAVING count(Order.PAPER_ID)>1
) AS tOrder ON tOrder.id = Paper.ID
 */

function request(year, company, id, user) {
    return [
        {   //时间及额度限制
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
                    "expression": "now"
                },
                {
                    "expression": "isValid",
                    "alias": service.camelToUpperUnderscore('isValid')
                },
                {
                    "expression": "requisite",
                    "alias": service.camelToUpperUnderscore('requisite')
                },
            ],
            "limit": [0, 1],
            "where": {
                "expression": "company = ?",   //"company = ? and subscribeYear = ?",
                "value": [
                    company     //,year
                ]
            }
        },
        {   //金额验证
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
        },
        {   //必选刊物验证
            "join": [
                {
                    "type": "LEFT",
                    "tableAlias": "tOrder",
                    "table":{
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
                                }
                            }
                        ],
                        "fields": [
                            {
                                "expression": "Order.paperId",
                                "alias": "id"
                            }
                        ],
                        "group": {
                            "expression": 'Order.paperId'
                        }
                    },
                    "on": {
                        "expression": "tOrder.id = Paper.id"
                    }
                }
            ],
            "where": {
                "expression": "Paper.requisite IS TRUE AND Paper.isValid IS TRUE AND tOrder.id IS NULL"
            },
            "model": service.models.paper.model,
            "tableAlias": "Paper",
            "fields": [{
                "expression": "group_concat(Paper.publication)",
                "alias": "publication"
            }, {
                "expression": "count(Paper.publication)",
                "alias": "count"
            }],
        },
        {   //重复订阅验证
            "join": [
                {
                    "type": "INNER",
                    "tableAlias": "tOrder",
                    "table":{
                        "where": {
                            "expression": "OrderLimit.RepeatVerify>0 and Subscription.govExpense is TRUE and Subscription.subscribeYear=? and (Subscription.id=? or ( (Subscription.verifyStatus=1 or Subscription.verifyStatus=2)) and Subscription.subscribeOrg=? AND (OrderLimit.RepeatVerify=1 OR (OrderLimit.RepeatVerify>1 AND Subscription.subscribeUser=?))  )",
                            "value": [year, id, company, user]
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
                                }
                            },
                            {
                                "type": "LEFT",
                                "tableAlias": "OrderLimit",
                                "table": {
                                    "model": service.models.orderLimit.model,
                                    "tableAlias": "tLimit",
                                    "fields": [
                                        {
                                            "expression": "tLimit.company",
                                            "alias": "company"
                                        },
                                        {
                                            "expression": "MIN(tLimit.repeatVerify)",
                                            "alias": "repeatVerify"
                                        }
                                    ],
                                    "group": {
                                        "expression": "tLimit.company"
                                    }
                                },
                                "on": {
                                    "expression": "Subscription.subscribeOrg = OrderLimit.company"
                                }
                            }
                        ],
                        "fields": [
                            {
                                "expression": "Order.paperId",
                                "alias": "id"
                            }
                        ],
                        "group": {
                            "expression": 'Order.paperId'
                        },
                        "having": "count(Order.paperId)>1"
                    },
                    "on": {
                        "expression": "tOrder.id = Paper.id"
                    }
                }
            ],
            "model": service.models.paper.model,
            "tableAlias": "Paper",
            "fields": [{
                "expression": "group_concat(Paper.publication)",
                "alias": "publication"
            }, {
                "expression": "count(Paper.publication)",
                "alias": "count"
            }],
        }
    ]
}

function replaceComma(value){
    return typeof value ==='string' ? value.replace(/,/g, '、') : ''
}

export default function (year, company, id, user) {
    return new Promise((resolve, reject) => {
        if (!(year && company && id)) {
            return reject('参数错误！[check order limit .]')
        }
        this.$utils.ajax.post(
            service.apis.queries(),
            request.call(this, year, company, id, user)
        ).then(response => {
            let limit = response[0].length<1 ? {isValid: false, requisite: true} : response[0][0]
            if (limit.requisite && response[2].length > 0 && response[2][0].count>0) {
                return reject(`发现有必选报刊：${replaceComma(response[2][0].publication)}未订阅，请确认！`)
            }
            if (response[3].length > 0 && response[3][0].count>0) {
                return reject(`发现有重复订阅的报刊：${replaceComma(response[3][0].publication)}，请确认！`)
            }

            if (!limit.isValid){  // (response[0].length < 1) {
                return resolve(`未找到相关配置！${company} ${id}`)  //${year}
            }
            let begin = limit.subscribeBegin ? service.string2Date(limit.subscribeBegin) : new Date(),
                now = (limit.now ? service.string2Date(limit.now) : new Date()).getTime(),
                end = limit.subscribeEnd ? service.string2Date(limit.subscribeEnd) : new Date()
            if (begin.getTime() - now > 0 || end.getTime() - now < 0) {
                return reject(`当前时段不允许订阅，允许订阅时间：${service.formatDate(begin, 'yyyy-MM-dd')} 至 ${service.formatDate(end, 'yyyy-MM-dd')}`)
            }

            let count = 0, copies = 0, amount = 0
            response[1].forEach(item => {
                /^报纸$/.test(item.journal) ? count += item.copies : copies += item.copies
                if (item.amount) amount += item.amount
            })
            let condition = `${year}年 ${company}，当前报数${count}，刊数${copies}，总金额${amount}。  允许报数${limit.limitCount}，刊数${limit.limitCopies}，总金额${limit.limitAmount}。`
            if (limit.limitCopies > 0 && count > limit.limitCopies) {
                return reject(`本处室的报数超出限额：${limit.limitCopies} ，请确认！`)   //reject(`报数刊数超过限制！ ${condition}`)
            }
            if (limit.limitCount > 0 && copies > limit.limitCount) {
                return reject(`本处室的刊数超出限额：${limit.limitCount} ，请确认！`)   //reject(`刊数超过限制！ ${condition}`)
            }
            if (limit.limitAmount > 0 && amount > limit.limitAmount) {
                return reject(`本处室的报刊订阅金额超出限额：${limit.limitAmount} 元，请确认！`)   //reject(`总金额超过限制！ ${condition}`)
            }
            resolve('校验完成')
        }).catch(err => {
            reject(err)
        })
    })
}
