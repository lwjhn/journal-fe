import DbInterface from "./DbInterface";
import form from "./form"
import statistic from './statistic'

const journal = {
    ...DbInterface,
    ...form,
    ...statistic
}

export default {
    journal
}
