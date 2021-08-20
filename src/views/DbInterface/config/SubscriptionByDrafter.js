import subscriptionView from "./Subscription";
import service from '/src/service'

export default function () {
    return {
        ...subscriptionView.call(this),
        beforeRequest(query, category, isCategory) {
            if (this.$attrs.type) {
                service.sql(query, 'verifyStatus = ? and draftUserNo = ?', [this.$attrs.type, this.$store.state.user.username])
            }
        }
    }
}
