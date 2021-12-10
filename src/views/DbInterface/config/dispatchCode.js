import service from "../../../service";
import {apis} from "../../../service/apis";

const template = `<?xml version="1.0" encoding="utf-8"?>
<PaperInBox>
    <PaperName></PaperName>
    <PostCodeOne></PostCodeOne>
    <PostCodeTwo></PostCodeTwo>
    <Number></Number>
    <DeptName></DeptName>
    <Count></Count>
    <dingyueren></dingyueren>
    <SendDept></SendDept>
    <Area></Area>
    <SendUser></SendUser>
</PaperInBox>`
const templateMap = {
    PaperName() {
        return document.querySelector('.journal_dispatch_box [name=publication]').value
    },
    PostCodeOne() {
        return document.querySelector('.journal_dispatch_box [name=postalDisCode]').value.replace(/-.*/g, '')
    },
    PostCodeTwo() {
        return document.querySelector('.journal_dispatch_box [name=postalDisCode]').value.replace(/.*-/g, '')
    },
    Number() {
        return document.querySelector('.journal_dispatch_box [name=period]').value
    },
    Area() {
        return 1
    },
    SendDept() {
        return this.$store.state.system.extraUserinfo.orgName
    },
    SendUser() {
        return this.$store.state.system.extraUserinfo.userName  //orgName
    },
    DeptName(rows) {
        return rows.map(row => row.subscribeOrg ? row.subscribeOrg : '').join(',')
    },
    dingyueren(rows) {
        return rows.map(row => row.subscribeUser ? row.subscribeUser : '').join(',')
    },
    Count(rows) {
        return rows.map(row => row.subscribeCopies ? row.subscribeCopies : '').join(',')
    }
}

export function dispatch(url) {
    if (!document.querySelector('[name=period]').value) {
        return service.warning.call(this, '请填写分发刊期！')
    }
    if (!Array.prototype.isPrototypeOf(this.selection) || this.selection.length < 1) {
        return service.warning.call(this, '请选择需要分发的文件！')
    }
    let request = template.replace(/<(\w+)>[^\s<>]*<\/\w+>/g, (item, label) => {
        return `<${label}>${service.encodeXML(templateMap[label].call(this, this.selection))}</${label}>`
    })

    let update = {
        model: service.models.order.model,
        values: {
            dispatched: true
        },
        where: {
            expression: `id IN (${this.selection.map(() => '?').join(', ')})`,
            value: this.selection.map(item => item.orderId)
        }
    }
    console.log('url--->', url, request)
    service.ajax.call(this, url, request, {
        header: {
            'Content-Type': 'application/xml;charset=UTF-8',
            'Accept': 'text/plain, */*',
        },
        responseType: 'text'
    }).then(response => {
        console.log('dispatch--->', response)
        service.ajax.call(this, apis.update(), update).then(response => {
            console.log(response)
            try {
                service.success.call(this, '分发完成！')
            } finally {
                this.refresh()
            }
        }).catch(e => {
            console.log(e)
        })
    }).catch(e => {
        console.log(e)
    })
}

export default dispatch
