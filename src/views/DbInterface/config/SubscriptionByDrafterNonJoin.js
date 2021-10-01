import subscriptionView, {tableAlias, beforeRequest} from "./SubscriptionNonJoin";
import service from '../../../service'

export default function () {
    return {
        ...subscriptionView.call(this),
        beforeRequest(query, category, isCategory) {
            beforeRequest.call(this, query, category, isCategory)
            if (this.$attrs.type) {
                service.sql(query, `verifyStatus = ? and ${tableAlias}draftUserNo = ?`, [this.$attrs.type, this.$store.state.user.username])
            }
        }
    }
}
