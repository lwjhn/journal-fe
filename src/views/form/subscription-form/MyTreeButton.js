import {TreeButton} from "o-ui";
import ZTreeTransfer from "o-ui/packages/tree-transfer/src/ZTreeTransfer";
import TreeTransfer from "o-ui/packages/tree-transfer/src/TreeTransfer";
import AsycZTreeTransfer from "o-ui/packages/tree-transfer/src/AsycZTreeTransfer";
import $popbox from "o-ui/packages/popbox";

export default {
    name: 'MyTreeButton',
    methods: {
        iconClick () {
            const cps = this.dataSource === 'normal' ?
                (this.treeCore === 'ztree' ? ZTreeTransfer : TreeTransfer) : AsycZTreeTransfer;

            const expandTreeNode = this.target.map((item) => {
                return {
                    id: item.id,
                    label: item.label
                };
            });
            const componentProps = {
                multiplePattern: this.tree.multiplePattern || false, // 是否多选
                treeData: this.treeData, // 树形数据
                expandTreeNode: expandTreeNode, // 已经选择节点
                expandModel: this.tree.expandModel || 'id',
                isShowTargetList: this.tree.isShowTargetList,
                'unique': this.other.unique,
                'targetOrder': this.targetOrder,
                'asyncSetting': this.request.asyncSetting,
                'mixedFormat': this.mixedFormat,
                'orgInfos': this.orgInfos,
                'orgRelatedParam': this.innerOrgRelatedParam,
                'nodeHtml': this.nodeHtml,
                'chkboxType': this.tree.chkboxType,
                'notAutoExpand': this.tree.notAutoExpand
            }
            this.$emit('beforeOpenDialog', componentProps, this)
            // 调用树选择窗
            $popbox
                .open({
                    parent: this,
                    component: cps, // 树组件
                    componentProps,
                    title: this.tree.title || '选择',
                    isResize: this.tree.isResize || false,
                    isMax: this.tree.isMax || false,
                    canMinimize: this.tree.canMinimize || false,
                    canMaximum: this.tree.canMaximum || false,
                    isLayer: this.tree.isLayer || true,
                    isLayerClickClose: this.tree.isLayerClickClose || false,
                    isCoverObjectTag: this.tree.isCoverObjectTag || false,
                    area: this.tree.area,
                    appendToBody: this.tree.appendToBody || false
                })
                .then((data) => {
                    if (data) {
                        const ids = [];
                        const labels = [];
                        let targetMap = {};
                        let dataMap = {};

                        if (!this.tree.multiplePattern) {
                            this.target = data;
                        } else {
                            this.target.forEach(item => {
                                item.id && (targetMap[item.id] = item);
                            });

                            // 添加新增的
                            data.forEach((item) => {
                                // 没有的新增
                                if (!targetMap[item.id]) {
                                    this.target.push(item);
                                } else {  //已经有的赋值
                                    Object.assign(targetMap[item.id], item);
                                }
                                dataMap[item.id] = item;
                            });

                            // 去除删掉的，但是保留不在树上的值
                            for (let m = 0, l = this.target.length; m < l; m ++) {
                                if (!dataMap[this.target[m].id] && !this.target[m]._isNotTreeEle) {
                                    this.target[m] = null;
                                }
                            }

                            this.target = this.target.filter(i => i);
                        }

                        targetMap = {};
                        this.target.forEach((item, index) => {
                            if (!targetMap[item.id]) {
                                targetMap[item.id] = true;
                            } else {
                                this.target[index] = null;
                            }
                        });
                        this.target = this.target.filter(i => i);

                        this.target.forEach((item) => {
                            ids.push(item.id);
                            labels.push(item.label);
                        });
                        // 处理返回结果
                        this.resType === 'id' ? this.dealResultData(ids) : this.dealResultData(labels);
                        this.dataSource === 'async' && this.setEditInputData();
                        this.$emit('select-change', this.target, this.request);
                    }

                    this.$nextTick(() => {
                        this.textAreaEdit &&
                        this.$refs['textarea1'] &&
                        this.$refs['textarea1'].focus &&
                        this.$refs['textarea1'].focus();
                        this.calcHeight();
                    });
                });
        },
    },
    extends: TreeButton
}
