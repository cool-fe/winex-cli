<template>
  <el-dialog
    width="400px"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
    :modal="true"
    :visible.sync="queryDialog"
    :title="$attrs.title || '存为常用查询'"
    :before-close="handleClose"
    custom-class="query-dialog-class"
  >
    <div class="query-dialog-content" @click.stop>
      <span class="_title">方案名称</span>
      <el-input v-model="conditionGroupName" placeholder="请输入方案名称"></el-input>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="default" @click="handleClose()">取消</el-button>
      <el-button type="primary" :loading="btnLoading" @click="handleSave">保 存</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { requestAddnewQuery } from '../api/index';
  /**
 *  399544423 1 在区   - 启用 -
 399544424 2 待入区   - 启用 -
 399544425 3 待转区   - 启用 -
 399544426 4 已转区   - 启用 -
 399544427 5 已出区   - 启用 -
 399544428 6 已出院
 */
  const maps = {
    in: '399544423',
    waitin: '399544424',
    waitchangearea: '399544425',
    changearea: '399544426',
    outarea: '399544427',
    discharged: '399544428'
  };
  export default {
    props: {
      queryDialog: {
        type: Boolean,
        default: false
      },
      type: {
        type: [Number, String],
        default: 3
      },
      saveCondition: {
        type: Object,
        default: () => {
          return {};
        }
      },
      isNurse: {
        type: Boolean,
        default: true
      },
      visiblePlan: {
        type: Array
      }
    },
    data() {
      return {
        conditionGroupName: '',
        btnLoading: false
      };
    },
    methods: {
      async handleSave() {
        if (this.conditionGroupName === '') return;
        this.btnLoading = true;
        let queryCondition = JSON.parse(JSON.stringify(this.saveCondition));
        let tagIds = queryCondition.tagIds;
        delete queryCondition.tagIds;
        delete queryCondition.queryIds;
        const params = {
          appSystemCode: this.isNurse ? '951678' : '951677',
          defaultFlag: '98176',
          visibleFlag: '98175',
          tagIds,
          querySchemeTypeCode: maps[queryCondition.type],
          queryCondition: JSON.stringify(queryCondition),
          queryName: this.conditionGroupName,
          type: this.type,
          seqNo: this.$attrs.seqNo
        };

        const data = await requestAddnewQuery(params);

        if (data && data.success) {
          this.$message.success('保存成功');
          this.handleClose();
          this.conditionGroupName = '';
          this.$emit('updateList');
        } else {
          mywinning.showMsg(data.errorDetail.message || '网络错误');
        }

        this.btnLoading = false;
      },
      handleClose(done) {
        this.$emit('closeDialog');
        done && done();
      }
    }
  };
</script>

<style lang="scss">
  .query-dialog-class {
    .el-dialog__body {
      padding: 20px 20px 0 20px;
    }

    .el-dialog__title {
      font-size: 14px;
    }

    .el-dialog__header {
      padding: 16px 20px;
      background: #e0e5f4;
      border-top-left-radius: 7px;
      border-top-right-radius: 7px;

      .el-dialog__close {
        position: relative;
        top: -4px;
        right: -6px;

        &::before {
          font-size: 28px;
        }
      }
    }

    .el-input__inner {
      height: 32px;
      line-height: 32px;
    }

    .dialog-footer {
      .el-button {
        // background: #5A7BEF;
        // border-color: #5A7BEF;
        padding: 8px 27px;
      }

      .el-button--default {
        background: #fff;
        border: 1px solid #c9c9c9;
      }
    }
  }
</style>
<style lang="scss" scoped>
  .query-dialog-class {
    .query-dialog-content {
      width: 320px;
      padding-bottom: 100px;
      display: flex;
      // justify-content: space-around;
      align-items: center;

      ._title {
        display: inline-block;
        font-size: 14px;
        width: 77px;
        margin-right: 16px;
      }
    }
  }
</style>
