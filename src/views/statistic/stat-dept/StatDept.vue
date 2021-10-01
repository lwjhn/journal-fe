<template>
    <div class="stat-box">
        <div class="stat-tool-bar">
            <el-button v-if="activeName==='stat-result'" @click="callPrint"
                       icon="el-icon-printer">打印
            </el-button>
            <el-button v-loading.fullscreen.lock="fullscreenLoading" @click="callAnalysis" type="primary"
                       icon="el-icon-search">统计
            </el-button>
        </div>
        <el-tabs v-model="activeName">
            <el-tab-pane class="form" name="stat-basic">
                <span slot="label" class="fs-base">选项</span>
                <el-form class="courts-form"
                         label-width="140px"
                         size="small">
                    <el-row v-for="(row, index) in where"
                            :key="index">
                        <el-col v-for="(col, subindex) in row"
                                :key="subindex"
                                :span="col.span ? col.span : 24/row.length">
                            <search-panel :config="col"></search-panel>
                        </el-col>
                    </el-row>
                </el-form>
            </el-tab-pane>
            <el-tab-pane name="stat-result" v-loading="result.loading">
                <span slot="label" class="fs-base">统计结果</span>
                <div class="stat-result-box">
                    <div class="stat-result-title">
                        {{ this.result.title }}
                    </div>
                    <table class="fs-base tab-result" v-if="result.columns && result.columns.length>0">
                        <colgroup>
                            <col :width="80"><!--<col :span="result.columns.length">-->
                            <col v-for="(item,index) in result.columns" :key="index" :width="item.width ? item.width : ''">
                        </colgroup>
                        <thead>
                        <tr>
                            <td>序号</td>
                            <td v-for="(item,index) in result.columns" :key="index" v-if="!item.hidden">{{
                                    item.label
                                }}
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(row,index) in result.data" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td v-for="(item,colIndex) in result.columns" :key="colIndex" v-if="!item.hidden">
                                {{
                                    typeof (item.format) == 'function' ? item.format.call(_self, item, row)
                                        : (row.hasOwnProperty(item.name) ? scope.row[item.name] : row[item.alias])
                                }}
                            </td>
                        </tr>
                        </tbody>
                        <tfoot v-html="result.tfoot" v-if="result.tfoot">
                        </tfoot>
                    </table>
                    <div v-html="`<style>
                     .stat-result-title {
                         padding: 20px 20px 30px 20px;
                         font-size: 20px;
                         font-weight: bold;
                         text-align: center;
                         font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', SimSun, sans-serif;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                    }
                    table td {
                        padding: 5px;
                        border: 1px solid black;
                        text-align: center;
                    }
                    </style>`"></div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import config, {generateRequest} from "./lib/config"
import {query, footTable} from "./lib/stat"
import SearchPanel from '@rongji/rjmain-fe/packages/base-view/src/SearchPanel'
import print from 'o-ui/src/utils/print'

//\o-ui\src\utils\print.js
export default {
    name: "StatDept",
    components: {SearchPanel},
    data() {
        return {
            fullscreenLoading: false,
            activeName: 'stat-basic',
            systemNo: this.$store.state.user.systemNo,
            ...config.call(this),
            result: {
                loading: false,
                title: '',
                columns: [],
                data: [],
                tfoot:''
            },
        }
    },
    created() {

    },
    methods: {
        callAnalysis() {
            this.activeName = 'stat-result'
            this.result.loading = true
            this.result.tfoot=''
            let request = this.generateRequest()
            let mode = this.where[this.where.length - 1][0]
            query.call(this, request, mode.value, (response, fields, mode) => {
                this.result.title = mode
                this.result.columns.splice(0, this.result.columns.length, ...fields)
                this.result.data = response.filter(o => o)   //this.result.data.splice(0,0 , ...response)
                this.result.tfoot=this.footTable(response, request)
                this.result.loading = false
            })
        },
        generateRequest,
        footTable,
        callPrint(){
            print($('.stat-result-box'))
        }
    }
}
</script>

<style lang="scss" scoped>
.stat-box {
    background-color: white;
    padding: 10px 20px;
    height: 100%;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .stat-tool-bar {
        display: block;
        position: absolute;
        right: 40px;
        z-index: 8000;
    }

    .stat-result-box {
        height: calc(100vh - 200px);
        overflow-y: auto;
        padding-bottom: 80px;
    }
}
</style>
