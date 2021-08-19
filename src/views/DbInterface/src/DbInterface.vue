<template>
    <base-view :view="import(`../config/${this.view}`)" v-bind="$attrs"></base-view>
</template>
<script>
export default {
    name: "DbInterface",
    props: {
        view: String
    }
}
</script>
