export default {
    model: 'com.rongji.egov.journal.service.model.StatPrintConfig',
    form: {
        id: {
            default: ''
        },
        sortNo: {
            default: 0
        },
        Company: {
            default: '',
            validator: {
                required: true,
                maxLength: 100
            }
        },
        postalCode: {
            default: ''
        },
        transactor: {
            default: '',
            validator: {
                required: true,
                maxLength: 100
            }
        },
        phoneNo: {
            default: '',
            validator: {
                required: true,
                maxLength: 100
            }
        },
        address: {
            default: '',
            validator: {
                required: true,
                maxLength: 256
            }
        }
    }
}
