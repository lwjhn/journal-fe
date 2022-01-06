import service from "../../../service";
import {apis} from "../../../service/apis";
import ajax from "@rongji/rjmain-fe/lib/ajax";

const template = `<?xml version="1.0" encoding="utf-8"?>
<PaperInBox>
    <PaperName></PaperName>
    <PsetCodeOne></PsetCodeOne>
    <PsetCodeTwo></PsetCodeTwo>
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
        return this.$el.querySelector('.journal_dispatch_box [name=publication]').value
    },
    PsetCodeOne() {
        return this.$el.querySelector('.journal_dispatch_box [name=postalDisCode]').value.replace(/-.*/g, '')
    },
    PsetCodeTwo() {
        return this.$el.querySelector('.journal_dispatch_box [name=postalDisCode]').value.replace(/.*-/g, '')
    },
    Number() {
        return this.$el.querySelector('.journal_dispatch_box [name=period]').value
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

function callAgent(url, selection){
    let request = template.replace(/<(\w+)>[^\s<>]*<\/\w+>/g, (item, label) => {
        return `<${label}>${service.encodeXML(templateMap[label].call(this, selection))}</${label}>`
    })
    console.log('url--->', url, request)
    const load = service.loading.call(this)
    ajax.post(url, 'param=' + encodeURIComponent(request), {
        dataType: 'text',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded', //'text/xml;charset=UTF-8',
            'Accept': 'text/plain',
        },
    }).then(response => {
        console.log('dispatch--->', response)
        try {
            service.success.call(this, '分发完成！')

            this.$nextTick(()=>{
                service.closeAllMessage.call(this)
                console.log(this, this.$parent)
                this.$parent.$emit('popBoxCloseEvent')
            })
        } finally {
            //this.refresh()
        }
    }).catch(e => {
        console.log(e)
    }).finally(()=>load.close())
}

export function dispatch(url) {
    if (!document.querySelector('[name=period]').value) {
        return service.warning.call(this, '请填写分发刊期！')
    }
    if (!Array.prototype.isPrototypeOf(this.selection) || this.selection.length < 1) {
        return service.warning.call(this, '请选择需要分发的文件！')
    }
    let selection = this.selection,
        company = this.$el.querySelector('.journal_dispatch_box .journal_dispatch_company input').value
    if(company && (company=company.trim())){
        company = company.split(/[,;，；、]\s|[,;，；、]/g).filter(o=>o.trim())
        if(company.length<1){
            return service.warning.call(this, '分发处室填写错误！')
        }
        if(this.selection.length>1){
            return service.error.call(this, '使用分发处室分发，仅允许选择一份文件！')
        }
        let doc = this.selection[0]
        if(!doc.subscribeCopies || typeof doc.subscribeCopies !== 'number'){
            return service.error.call(this, '选中的文件订阅份数为0，不允许使用分发处室分发！')
        }
        if(doc.subscribeCopies % company.length !== 0){
            return service.error.call(this, '请检查分发处室是否正确。选中的文件订阅份数为' + doc.subscribeCopies  + '，分发处室数量' + company.length)
        }
        let subscribeCopies = parseInt(doc.subscribeCopies / company.length)
        service.confirm.call(this, '确认订阅处室（' + doc.subscribeOrg +'）拆分为'+company.length+'个，每个处室订阅'+subscribeCopies+'份！ 分发处室如下：' + company.join(', '), 'info').then(res=>{
            if(res){
                callAgent.call(this, url, company.map(subscribeOrg=>Object.assign({}, doc, {
                    subscribeOrg,
                    subscribeCopies
                })))
            }
        })
    } else {
        callAgent.call(this, url, selection)
    }
}

export default dispatch
