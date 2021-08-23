import subscriptionView from "./Subscription";
import service from '../../../service'

import {tableAlias, beforeRequest, paperAlias} from "./Subscription";

function category() {
    return [
        {
            expression: 'subscribeYear',
            label: '年度',
            width: '90px',
            desc: true,
            defaultValue: new Date().getFullYear()
        },
        {
            expression: `${paperAlias}paperType`,
            label: '报刊类型',
            width: '130px'
        },
        {
            expression: `CASE ${tableAlias}govExpense WHEN TRUE THEN ? ELSE ? END`,
            value: ['公费', '自费'],
            label: '订阅类型',
            width: '100px',
            criteria(item) {
                return {
                    expression: `${item.group.expression} = ${item.value === '公费' ? 'TRUE' : 'FALSE'}`
                }
            },
            group: {
                expression: `${tableAlias}govExpense`
            }
        }
    ]
}

export default function () {
    return {
        ...subscriptionView.call(this),
        category: category.call(this),
        columns: [
            {
                expression: tableAlias + 'publication',
                alias: 'publication',
                label: '报刊名称',
                width: '200px',
            },
            {
                expression: 'sum(subscribeCopies)',
                alias: 'count',
                label: '份数',
                width: '200px',
                sortable: true,
            },
            {
                expression: `sum(${paperAlias}yearPrice * subscribeCopies)`,
                alias: 'amount',
                label: '金额',
                width: '200px',
                sortable: true,
            },
            {
                format(){
                    return ''
                }
            }
        ],
        buttons: [],
        rowClick() {
        },
        beforeRequest(query, category, isCategory) {
            beforeRequest.call(this, query, category, isCategory, true)
            if (!isCategory) {
                query.group = {
                    expression: `${tableAlias}publication`
                }
            }
            service.sql(query, `verifyStatus = ? and ${tableAlias}subscribeOrgNo = ?`, [2, this.$store.state.user.orgNo])
        },
        afterRequest(request, response, isCategory) {
            if (!isCategory && response.list) {
                let c = 0, a = 0, cols = 0
                response.list.map(o => {
                    cols++
                    let {count, amount} = o
                    if (typeof count === 'number')
                        c += count
                    if (typeof amount === 'number')
                        a += amount
                })
                response.list.push({
                    publication: '总计：' + cols + '类',
                    count: `总计：${c}份`,
                    amount: '总金额：' + a
                })
                console.log(response)
            }
            debugger
        }
    }
}
