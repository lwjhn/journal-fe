import PaperForm from "./paper-form"
import SubscriptionForm from "./subscription-form"
import StatPrintConfig from "./stat-print-config-form"
import OrderLimitForm from "./order-limit-form";
import UploadForm from "./upload-form";
import DbConfigForm from "./db-config-form"
export default {
    ...PaperForm,
    ...SubscriptionForm,
    ...StatPrintConfig,
    ...OrderLimitForm,
    ...UploadForm,
    ...DbConfigForm
}
