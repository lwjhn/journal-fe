//系统配置表
export default {
    model: 'com.rongji.egov.journal.service.model.DbConfig',
    form: {
        id: {
            default: ''
        },
        panelUrl: {
            default: ''
        },
        panelHorizontal: {
            default: 5,
            validator: {
                required: true,
                message: '显示列数不允许小于1',
                validator(value) {
                    return value > 0
                }
            }
        },
        panelVertical: {
            default: 10,
            validator: {
                required: true,
                message: '显示行数不允许小于1',
                validator(value) {
                    return value > 0
                }
            }
        },
        panelItems: {
            default: [],
            parse(value) {
                return typeof value === 'string' ? JSON.parse(value) : (!value ? [] : value)
            }
        },
    }
}
