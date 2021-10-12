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
                <el-form class="courts-form" label-width="140px" size="small">
                    <el-row v-for="(row, index) in where" :key="index">
                        <el-col v-for="(col, subindex) in row"
                                :key="subindex" :span="col.span ? col.span : 24/row.length">
                            <search-panel :config="col" v-if="col"></search-panel>
                        </el-col>
                    </el-row>
                </el-form>
            </el-tab-pane>
            <el-tab-pane name="stat-result" v-loading="result.loading">
                <span slot="label" class="fs-base">统计结果</span>
                <div class="stat-result-box" v-if="result.page && result.page > 0">
                    <table class="fs-base tab-result"
                           v-if="result.page > 0 && result.columns && result.columns.length>0"
                           v-for="pIndex of Math.ceil((result.data.length=== 0 ? 1 : result.data.length) / result.page)"
                           :key="pIndex">
                        <colgroup v-if="typeof result.tgroup === 'function'"
                                  v-html="result.tgroup.call(_self, pIndex, result.page)"></colgroup>
                        <colgroup v-else>
                            <col :width="80"><!--<col :span="result.columns.length">-->
                            <col v-for="(item,index) in result.columns" :key="index"
                                 :width="item.width ? item.width : ''" v-if="!item.hidden">
                        </colgroup>
                        <thead v-html="result.thead.call(_self, pIndex, result.page)"
                               v-if="typeof result.thead === 'function'"></thead>
                        <thead v-else>
                        <tr>
                            <td>序号</td>
                            <td v-for="(item,index) in result.columns" :key="index" v-if="!item.hidden">
                                ${{item.label}}
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(row,index) in result.data.slice(result.page * (pIndex-1), result.page * pIndex)"
                            :key="index">
                            <td>{{ result.page * (pIndex - 1) + index + 1 }}</td>
                            <td v-for="(item,colIndex) in result.columns" :key="colIndex" v-if="!item.hidden">
                                {{
                                    typeof (item.format) == 'function' ? item.format.call(_self, item, row)
                                        : (row.hasOwnProperty(item.name) ? scope.row[item.name] : row[item.alias])
                                }}
                            </td>
                        </tr>
                        </tbody>
                        <tfoot v-html="result.tfoot.call(_self, pIndex, result.page)"
                               v-if="typeof result.tfoot === 'function'"></tfoot>
                    </table>
                    <div v-html="`<style>
                    @media print {
                        .stat-result-box table {
                            page-break-after: always;
                        }
                    }
                    .stat-result-title {
                         padding: 20px 20px 20px 20px !important;
                         font-size: 20px;
                         font-weight: bold;
                         text-align: center;
                         font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', SimSun, sans-serif;
                    }
                    .stat-result-box .text-align-left{
                        text-align: left;
                    }
                    .stat-result-box .text-align-center{
                        text-align: center;
                    }
                    .stat-result-box .text-align-right{
                        text-align: right;
                    }
                    .stat-result-box .none-border{
                        border-color: transparent!important;
                    }
                    .stat-result-box .none-border-has-bottom{
                        border-color: transparent!important;
                        border-bottom-color: black!important;
                    }
                    .stat-result-box .none-border-has-top{
                        border-color: transparent!important;
                        border-top-color: black!important;
                    }
                    .stat-result-box .none-border-bottom{
                        border-bottom-color: transparent!important;
                    }
                    .stat-result-box .none-border-top{
                        border-top-color: transparent!important;
                    }
                    .stat-result-box .none-border-top-right{
                        border-top-color: transparent!important;
                        border-right-color: transparent!important;
                    }
                    .stat-result-box .none-border-top-left{
                        border-top-color: transparent!important;
                        border-left-color: transparent!important;
                    }
                    .stat-result-box .none-border-bottom-right{
                        border-right-color: transparent!important;
                        border-bottom-color: transparent!important;
                    }
                    .stat-result-box .none-border-bottom-left{
                        border-bottom-color: transparent!important;
                        border-left-color: transparent!important;
                    }
                    .stat-result-box table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                        line-height: 1.5;
                    }
                    .stat-result-box table td {
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
import {query} from "./lib/stat"
import SearchPanel from '@rongji/rjmain-fe/packages/base-view/src/SearchPanel'
import print from 'o-ui/src/utils/print'

export default {
    name: "StatPrint",
    components: {SearchPanel},
    data() {
        return {
            fullscreenLoading: false,
            activeName: 'stat-basic',
            systemNo: this.$store.state.user.systemNo,
            ...config.call(this),
            result: {
                loading: false,
                columns: [],
                data: [],
                thead: undefined,
                tfoot: undefined,
                tgroup: undefined,
                page: 0
            },
        }
    },
    created() {

    },
    methods: {
        getResultData(pIndex) {
            return this.result.data.slice(this.result.columns.length * (pIndex - 1), result.columns.length * (pIndex - 1) + result.page)
        },
        callAnalysis() {
            this.activeName = 'stat-result'
            this.result.loading = true
            query.call(this, this.generateRequest(), (response, request, config) => {
                Object.assign(this.result, {thead: undefined, tfoot: undefined, page: 0})
                this.result.columns.splice(0, this.result.columns.length, ...config.fields)
                this.result.data = response.filter(o => o)   //this.result.data.splice(0,0 , ...response)
                if (typeof config.extend === 'function') config.extend.call(this)
                this.result.loading = false
            })
        },
        generateRequest,
        callPrint() {
            print($('.stat-result-box'))    //.clone().append($('#theme-style'))
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
        padding: 0 40px 80px 40px;
    }
}
</style>
