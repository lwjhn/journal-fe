<template>
    <el-form inline
             label-position="left"
             label-suffix=":">
        <search-box v-if="forms" :search="forms"></search-box>
    </el-form>
</template>

<script>
import {form, query} from "./config"
import SearchBox from '@rongji/rjmain-fe/packages/base-view/src/SearchBox'

import service from '../../../service'

export default {
    name: "UploadForm",
    components: {SearchBox},
    data() {
        return {
            form
        }
    },
    computed: {
        forms() {
            let forms = []
            for (let key in this.form) {
                forms.push(form[key])
            }
            return forms.sort((a, b) => -a.index + b.index)
        }
    }
}
</script>

<style scoped>

</style>
