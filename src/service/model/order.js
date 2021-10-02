export default {
    model: 'com.rongji.egov.journal.service.model.Order',
    form: {
        id: {
            default: ''
        },
        pid: {
            default: '',
            validator: {
                required: true,
                message: '主文档尚未保存'
            }
        },
        paperId: {
            default: '',
            validator: {
                required: true,
                message: '报刊信息不允许为空'
            }
        },
        subscribeCopies: {
            default: 1,
            validator: {
                required: true,
                message: '订阅数不少于1份',
                validator(value){
                    return value>0
                }
            }
        },
        sortNo: {
            default: 1,
            validator: {
                required: true,
                message: '排序号宜为正整数'
            }
        },
    }
}
