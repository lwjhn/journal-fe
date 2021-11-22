<template>
    <el-select v-model="option.postalDisCode"
               @change="postalDisCode=>{
                               if(!postalDisCode){
                                   return option.publication = undefined
                               }
                               let paper = paperList.find(o=>o.postalDisCode===postalDisCode)
                               if(paper){
                                   option.publication = paper.publication
                               }
                           }"
               v-bind="config"
    >
        <el-option
            v-for="item in paperList"
            :key="item.id"
            :label="`${item.publication} （ ${item.postalDisCode} ）`"
            :value="item.postalDisCode">
            {{ item.publication }}<span class="postalDisCode">{{ item.postalDisCode }}</span>
        </el-option>
    </el-select>
</template>

<script>
export default {
    name: "SelectPanel",
    props: {
        option: Object,
        paperList: Array,
        config: Object
    }
}
</script>

<style scoped>
/deep/ .postalDisCode{
    margin-left: 10px;
    color: gray;
}
</style>
