import subscriptionView, {tableAlias, beforeRequest} from "./SubscriptionNonJoin";
import service from "../../../service";

function category() {
    let type = this.$attrs.type === 'org'
    return [
        {
            expression: 'subscribeYear',
            label: '年度',
            width: '90px',
            desc: true,
            defaultValue: new Date().getFullYear() + 1
        },
        ...(!service.url.getUrlHashParam("govExpense") ? [{
            expression: `CASE ${tableAlias}govExpense WHEN TRUE THEN ? ELSE ? END`,
            value: ['公费', '自费'],
            label: '订阅类型',
            width: '100px',
            desc: true,
            criteria(item) {
                return {
                    expression: `${item.group.expression} = ${item.value === '公费' ? 'TRUE' : 'FALSE'}`
                }
            },
            group: {
                expression: `${tableAlias}govExpense`
            }
        }] : []),
        {
            expression: type ? 'subscribeOrg' : 'subscribeUser',
            label: type ? '订阅处室' : '订阅人',
            width: '210px',
            desc: true
        }
    ]
}

export default function () {
    return {
        ...subscriptionView.call(this),
        category: category.call(this),
        beforeRequest(query, category, isCategory) {
            beforeRequest.call(this, query, category, isCategory)
            if (!/all/i.test(service.url.getUrlHashParam("verifyStatus"))) {
                service.sql(query, `verifyStatus = 1 or verifyStatus = 2`)
            }
        }
    }
}
