<template>
    <div>
        <div class="tag-panel" v-if="option && option.postalDisCode"
             :title="option.publication + ' ' + option.postalDisCode"
             @click="dispatch"
        >{{ option.publication }}<span class="postalDisCode">{{ option.postalDisCode }}</span></div>
        <div class="tag-panel disabled" v-else>{{ index }}</div>
    </div>
</template>

<script>
import service from '../../../service'
import view from '../../DbInterface'

export default {
    name: "TagPanel",
    props: {
        option: Object,
        index: Number
    },
    methods: {
        dispatch() {
            if (!(this.option && this.option.postalDisCode))
                return
            service.openForm.call(this, {
                id: this.option.postalDisCode,
                component: view.DbInterface,
                componentProps: Object.assign({
                    view: 'Dispatch'
                }, this.option),
                isShowHeader: true,
                isMax: false,
                canRefresh: false,
                area: {
                    width: Math.min(1000, document.body.clientWidth * 0.9),
                    height: Math.min(800, document.body.clientHeight * 0.9)
                }
            })
        }
    }
}
</script>

<style scoped>
</style>
