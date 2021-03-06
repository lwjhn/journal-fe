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
            service.success.call(this, '???????????????')

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
        return service.warning.call(this, '????????????????????????')
    }
    if (!Array.prototype.isPrototypeOf(this.selection) || this.selection.length < 1) {
        return service.warning.call(this, '?????????????????????????????????')
    }
    let selection = this.selection,
        textarea = this.$el.querySelector('.journal_dispatch_box .journal_dispatch_company textarea').value
    if(textarea && (textarea=textarea.trim())){
        let company = [], sum = 0, name, value
        textarea.split(/[,;?????????]\s|[,;?????????\s]/g).forEach(key=>{
            if(!(key=key.trim()) || !(name = key.replace(/\s*[(???\[][\d]*[)???\]]*$/g,''))){
                return
            }
            value = (value = key.match(/[(???\[](\d*)[)???\]]*$/g))
                && (value = parseInt(value[0].replace(/[(???\[)???\]]/g,'')))>0 ? value : 1
            sum += value
            company.push({subscribeOrg: name, subscribeCopies: value, subscribeUser: name})
        })
        if(company.length<1){
            return service.warning.call(this, '???????????????????????????')
        }
        if(this.selection.length>1){
            return service.error.call(this, '?????????????????????????????????????????????????????????')
        }
        let doc = this.selection[0]
        if(!doc.subscribeCopies || typeof doc.subscribeCopies !== 'number'){
            return service.error.call(this, '??????????????????????????????0???????????????????????????????????????')
        }
        if(doc.subscribeCopies < sum){
            return service.error.call(this, '??????????????????????????????????????????????????????????????????' + doc.subscribeCopies  + '??????????????????????????????' + sum)
        }
        service.confirm.call(this, '?????????????????????' + doc.subscribeOrg +'????????????'+company.length+'?????? ?????????????????????' + company.map(o=>`${o.subscribeOrg}???${o.subscribeCopies}???`).join('???'), 'none').then(res=>{
            if(res){
                callAgent.call(this, url, company.map(o=>Object.assign({}, doc, o)))
            }
        })
    } else {
        callAgent.call(this, url, selection)
    }
}

export default dispatch
