export default {
    model: 'com.rongji.egov.journal.service.model.Order',
    form: {
        id: {
            default: ''
        },
        pid: {
            default: ''
        },
        paperId: {
            default: '',
        },
        subscribeCopies: {
            default: 0,
            validator: {
                required: true,
            }
        },
        sortNo: {
            default: 0,
            validator: {
                required: true
            }
        },
    }
}
