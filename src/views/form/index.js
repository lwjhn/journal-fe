import PaperForm from "./paper-form"
import SubscriptionForm from "./subscription-form"
import StatPrintConfig from "./stat-print-config-form"
import OrderLimitForm from "./order-limit-form";
export default {
    ...PaperForm,
    ...SubscriptionForm,
    ...StatPrintConfig,
    ...OrderLimitForm,
}
