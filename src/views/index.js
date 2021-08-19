import DbInterface from "./DbInterface";
import form from "./form"

const journal = {
    ...DbInterface,
    ...form
}

export default {
    journal
}
