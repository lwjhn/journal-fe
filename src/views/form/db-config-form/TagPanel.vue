<template>
    <div>
        <div class="tag-panel" v-if="option && option.postalDisCode"
             :title="option.publication + ' ' + option.postalDisCode"
        >{{ option.publication }}<span class="postalDisCode">{{ option.postalDisCode }}</span></div>
        <div class="tag-panel disabled" v-else>{{index}}</div>
    </div>
</template>

<script>
export default {
    name: "TagPanel",
    props: {
        option: Object,
        index: Number
    }
}
</script>

<style scoped>
</style>
