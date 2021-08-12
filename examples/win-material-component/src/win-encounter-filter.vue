<template>
  <el-popover v-model="showQueryPopover" v-bind="attrs">
    <!--        内容-->
    <div class="home-query-setting">
      <div class="scroll-content">
        <div
          class="query-item"
          style="margin-bottom: 20px"
          v-if="plan && (mode === 'detail' || mode === 'edit')"
        >
          <div class="query-item-left">筛选方案</div>
          <div class="query-item-right">
            <el-input
              size="small"
              clearable
              style="display: inline-block; width: 200px; margin-top: -5px"
              v-model="plan.queryName"
            />
          </div>
        </div>
        <div class="query-item">
          <div class="query-item-left">{{ inpatientStatus.name }}</div>
          <div class="query-item-right">
            <span
              :class="{ 'query-item-cell': true, 'is-active': i === inpatientStatus.activeIndex }"
              @click="handleQueryItem(inpatientStatus, cell, '', i)"
              :style="{ order: cell.order }"
              v-show="cell.show"
              v-for="(cell, i) in inpatientStatus.list"
              :key="i"
            >
              {{ cell.label }}
            </span>
          </div>
        </div>
        <!-- 住院状态下面的时间 -->
        <div v-show="inpatStatusSubItem.list" class="query-item sub">
          <div class="query-item-left"></div>
          <div class="query-item-right">
            <span
              :class="{
                'query-item-cell': true,
                'is-active': i === inpatStatusSubItem.activeIndex
              }"
              @click="handleQueryItem(inpatStatusSubItem, cell, '', i)"
              v-for="(cell, i) in inpatStatusSubItem.list"
              :key="i"
              >{{ cell.label }}
            </span>
            <span v-show="[2, 3, 4].includes(inpatientStatus.activeIndex)" class="details-date">
              指定起止日期
              <el-date-picker
                style="width: 400px"
                :disabled="mode === 'view'"
                value-format="yyyy-MM-dd"
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              >
              </el-date-picker>
            </span>
          </div>
        </div>
        <div v-show="inpatientStatus.activeIndex === 2" class="query-item sub out-reason">
          <div class="query-item-left">出区原因</div>
          <div class="query-item-right">
            <span
              :class="{ 'query-item-cell': true, 'is-active': i === outAreaReason.activeIndex }"
              @click="handleQueryItem(outAreaReason, cell, '', i)"
              v-for="(cell, i) in outAreaReason.list"
              :key="i"
              >{{ cell.label }}</span
            >
          </div>
        </div>
        <div
          v-show="inpatientStatus.activeIndex === 0"
          :class="{ disable: isPatientList }"
          class="query-item"
          v-for="(item, index) in queryData"
          :key="index"
        >
          <div class="query-item-left">{{ item.name }}</div>
          <div class="query-item-right">
            <span
              :class="{ 'query-item-cell': true, 'is-active': i === item.activeIndex }"
              @click="handleQueryItem(item, cell, index, i)"
              v-for="(cell, i) in item.list"
              :key="i"
              >{{ cell.label }}</span
            >
          </div>
        </div>
        <div
          v-show="inpatientStatus.activeIndex === 0"
          v-for="item in queryList"
          :key="item.inpatQueryConditionClassId"
          class="query-item"
        >
          <div class="query-item-left">{{ item.queryConditionClassName }}</div>
          <div class="query-item-right">
            <span
              class="query-item-cell"
              :class="{
                'query-item-cell': true,
                'is-active': item.activeIndex === '' || item.activeIndex === undefined
              }"
              @click="handleQueryItem(item, cell, '', '')"
              >全部</span
            >
            <span
              :class="{ 'query-item-cell': true, 'is-active': i === item.activeIndex }"
              @click="handleQueryItem(item, cell, '', i)"
              v-for="(cell, i) in item.inpatQueryConditionTags"
              :key="i"
              >{{ cell.tagName }}</span
            >
          </div>
        </div>
        <!-- 其他状态 -->
        <div class="query-item" v-show="showOther && inpatientStatus.activeIndex === 0">
          <div class="query-item-left">{{ otherQuery.name }}</div>
          <div class="query-item-right">
            <span
              :class="{ 'query-item-cell': true, 'is-active': i === otherQuery.activeIndex }"
              v-for="(cell, i) in otherQuery.list"
              :key="i"
              @click="handleQueryItem(otherQuery, cell, '', i)"
            >
              {{ cell.label }}
            </span>
          </div>
        </div>
      </div>
      <div class="footer-content" v-if="mode === 'detail' || mode === 'edit'">
        <div></div>
        <div>
          <el-button class="btn" type="default" @click="closeSelf">取消</el-button>
          <el-button class="btn" type="primary" :disabled="!plan || !plan.queryName" @click="edit"
            >修改</el-button
          >
          <el-button class="btn" type="danger" plain @click="remove">删除</el-button>
        </div>
      </div>
      <div class="footer-content" v-else-if="mode === 'view'">
        <div></div>
        <div>
          <el-button class="btn" type="default" @click="closeSelf">取消</el-button>
        </div>
      </div>
      <div class="footer-content" v-else>
        <div>
          <el-button v-if="showSave" class="btn" @click.native="queryDialogFlag = true">
            {{ saveBtnText }}
          </el-button>
        </div>
        <div>
          <el-button class="btn" type="default" @click="closeSelf">取消</el-button>
          <el-button class="btn" v-if="showQueryBtn" type="primary" @click="handleQuery"
            >查询</el-button
          >
        </div>
      </div>
      <query-dialog
        :is-nurse="isNurse"
        :type="type"
        :title="saveBtnText"
        :queryDialog="queryDialogFlag"
        @closeDialog="queryDialogFlag = false"
        @updateList="
          () => {
            this.$emit('updateList');
            this.closeSelf();
          }
        "
        :saveCondition="saveCondition"
        v-bind="$attrs"
      />
    </div>
    <!--        内容end-->
    <div
      :class="{ 'search-confition-btn': true, 'is-active_sort': showQueryPopover }"
      slot="reference"
    >
      <span @click.stop="showPop">
        <slot>
          <i class="filter-img win-icon-filter"></i>
          <span>{{ isShowText ? '筛选' : '' }}</span>
        </slot>
      </span>
    </div>
  </el-popover>
</template>

<script>
  import queryDialog from './queryDialog';
  import { reqQueryCondition, requestUpdatewQuery, requestDelPlan } from '../api/index';
  const maps = {
    in: '399544423',
    waitin: '399544424',
    waitchangearea: '399544425',
    changearea: '399544426',
    outarea: '399544427',
    discharged: '399544428'
  };

  export default {
    name: 'win-encounter-filter',
    components: { queryDialog },
    props: {
      isNurse: {
        type: Boolean,
        default: true
      },
      type: {
        type: [Number, String],
        default: 3
      },
      saveBtnText: {
        type: String,
        default: '存为我的查询'
      },
      showQueryBtn: {
        type: Boolean,
        default: true
      },
      showOther: {
        type: Boolean,
        default: false
      },
      showSave: {
        type: Boolean,
        default: false
      },
      isPatientList: {
        type: Boolean,
        default: false
      },
      isShowText: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      attrs() {
        return {
          'visible-arrow': false,
          placement: 'bottom-end',
          width: '800',
          'popper-class': 'query-setting-popover',
          trigger: 'click',
          ...this.$attrs
        };
      },
      // ...mapState(['SYSTEM_SUBJECT_ID']),
      // ...mapGetters(['JINDAL_CUR_WARD_ID']),
      saveCondition() {
        let status = this.inpatientStatus.activeIndex;
        if (status === 1) {
          return { type: 'waitin' };
        } else if (status === 0) {
          const data = this.queryList;
          let dateRange = this.inpatStatusSubItem.list[this.inpatStatusSubItem.activeIndex].value;
          let obj = {
            type: 'in'
          };
          if (dateRange) {
            obj.dateRange = dateRange;
            obj.dateType = '1';
          }
          let tagIds = [];
          let queryIds = [];
          data.forEach((item) => {
            if (!item.activeIndex && item.activeIndex !== 0) return false;
            tagIds.push(item.inpatQueryConditionTags[item.activeIndex].inpatQueryConditionTagId);
            queryIds.push(item.inpatQueryConditionTags[item.activeIndex].tagId);
          });
          obj.tagIds = tagIds;
          obj.queryIds = queryIds;
          let bedStatus = this.queryData;
          bedStatus.forEach((item) => {
            if (!item.activeIndex && item.activeIndex !== 0) return false;
            obj[item.key] = item.list[item.activeIndex].value;
          });

          if (this.showOther && this.otherQuery.activeIndex !== '') {
            obj[this.otherQuery.key] = this.otherQuery.list[this.otherQuery.activeIndex].value;
          }
          return obj;
        } else if (status === 2) {
          let obj = {
            type: 'outarea',
            dischargeOutcomeCode: this.outAreaReason.list[this.outAreaReason.activeIndex].value
          };
          if (this.dateRange) {
            obj.timeRange = {
              startDate: this.dateRange[0],
              endDate: this.dateRange[1]
            };
          } else {
            obj.dateRange = this.inpatStatusSubItem.list[this.inpatStatusSubItem.activeIndex].value;
          }
          return obj;
        } else if (status === 3) {
          let obj = {
            type: 'changearea'
          };
          if (this.dateRange) {
            obj.timeRange = {
              startDate: this.dateRange[0],
              endDate: this.dateRange[1]
            };
          } else {
            obj.dateRange = this.inpatStatusSubItem.list[this.inpatStatusSubItem.activeIndex].value;
          }
          return obj;
        } else if (status === 4) {
          // 已出院
          let obj = {
            type: 'discharged'
          };
          if (this.dateRange) {
            obj.timeRange = {
              startDate: this.dateRange[0],
              endDate: this.dateRange[1]
            };
          } else {
            obj.dateRange = this.inpatStatusSubItem.list[this.inpatStatusSubItem.activeIndex].value;
          }
          return obj;
        }
        return {};
      },
      inpatStatusSubItem() {
        return this.inpatientStatus.list[this.inpatientStatus.activeIndex];
      }
    },
    watch: {
      // SYSTEM_SUBJECT_ID () {
      // 	this.reset()
      // },
      // JINDAL_CUR_WARD_ID () {
      // 	this.reset()
      // },
      'inpatientStatus.activeIndex': {
        handler(n, o) {
          if (n !== 0 && !this.isPatientList) {
            this.queryData.forEach((item) => {
              item.activeIndex = 0;
            });
          }
          this.dateRange = null;
          this.outAreaReason.activeIndex = 0;
          if (this.inpatientStatus.list[o].list) {
            this.inpatientStatus.list[o].activeIndex = 0;
          }
        }
      },
      dateRange(n, o) {
        if (n) {
          this.inpatStatusSubItem.activeIndex = 'dateRange';
        } else {
          this.inpatStatusSubItem.activeIndex = 0;
        }
      }
    },
    data() {
      return {
        showQueryPopover: false,
        dateRange: '',
        mode: this.modeType || '',
        plan: null,
        inpatientStatus: {
          name: '住院状态',
          key: 'bedBusinessStatus', // 是否有人
          activeIndex: 0,
          list: [
            {
              value: '',
              label: '在区',
              order: 10,
              activeIndex: 0,
              show: true,
              list: [
                { value: '', label: '全部' },
                { value: '8-h', label: '8小时内' },
                { value: '24-h', label: '24小时内' },
                { value: '72-h', label: '72小时内' },
                { value: '7-d', label: '7天内' },
                { value: '10-d', label: '10天内' },
                { value: '14-d', label: '14天内' },
                { value: '14-END', label: '14天以上' }
              ]
            },
            {
              value: '0',
              label: '待入区',
              order: 20,
              show: this.isNurse
            },
            {
              value: '1',
              label: '已出区',
              activeIndex: 0,
              order: 30,
              show: true,
              list: [
                { value: '0-d', label: '当天' },
                { value: '1-d', label: '前1天' },
                { value: '2-d', label: '前2天' },
                { value: '3-d', label: '前3天' },
                { value: '5-d', label: '前5天' },
                { value: '7-d', label: '前7天' }
              ]
            },
            {
              value: '1',
              label: '已转区',
              activeIndex: 0,
              order: 40,
              show: true,
              list: [
                { value: '0-d', label: '当天' },
                { value: '1-d', label: '前1天' },
                { value: '2-d', label: '前2天' },
                { value: '3-d', label: '前3天' },
                { value: '5-d', label: '前5天' },
                { value: '7-d', label: '前7天' }
              ]
            },
            {
              value: '1',
              label: '已出院',
              activeIndex: 0,
              order: this.isNurse ? 50 : 11,
              show: true,
              list: [
                { value: '0-d', label: '当天' },
                { value: '1-d', label: '前1天' },
                { value: '2-d', label: '前2天' },
                { value: '3-d', label: '前3天' },
                { value: '5-d', label: '前5天' },
                { value: '7-d', label: '前7天' }
              ]
            }
          ]
        },
        outAreaReason: {
          name: '出区原因',
          activeIndex: 0,
          list: [
            { value: '', label: '全部' },
            { value: '64592', label: '治愈' },
            { value: '64593', label: '好转' },
            { value: '64594', label: '稳定' },
            { value: '136570', label: '恶化' },
            { value: '136571', label: '死亡' },
            { value: '136572', label: '其他' }
          ]
        },
        otherQuery: {
          name: '其它状态',
          key: 'otherStatus',
          activeIndex: '0',
          list: [
            {
              value: '',
              label: '全部',
              show: true
            },
            {
              value: '0',
              label: '我关注的病人',
              show: true
            },
            {
              value: '1',
              label: '我的病人',
              show: true
            }
          ]
        },
        queryData: [
          {
            name: '床位状态',
            key: 'bedBusinessStatus', // s是否有人
            activeIndex: 0,
            list: [
              {
                value: '',
                label: '全部'
              },
              {
                value: '0',
                label: '空床'
              },
              {
                value: '1',
                label: '有人'
              },
              {
                value: '2',
                label: '包床'
              }
            ]
          }
        ],
        queryList: [],
        queryDialogFlag: false
      };
    },
    mounted() {
      if (this.isPatientList) {
        this.queryData[0].activeIndex = 2;
      }
    },
    created() {
      if (this.isNurse) {
        this.otherQuery.list.push({
          value: '4',
          label: '我的护理组患者',
          show: this.isNurse
        });
      } else {
        this.otherQuery.list.push(
          ...[
            {
              value: '2',
              label: '授权患者',
              show: !this.isNurse
            },
            {
              value: '3',
              label: '我的医疗组患者',
              show: !this.isNurse
            },
            {
              value: '5',
              label: '会诊患者',
              show: !this.isNurse
            }
          ]
        );
      }
      reqQueryCondition({})
        .then((res) => {
          if (res && res.success) {
            if (res.data && res.data.length) {
              res.data = res.data.map((item) => {
                item.activeIndex = '';
                return item;
              });
            }
            this.queryList = res.data;
            this.$emit('ready');
            // this.initCondition()
          } else {
            this.$emit('ready');
          }
        })
        .catch((err) => {
          this.$emit('ready');
          console.log(err, 45555);
        });
    },
    methods: {
      showPop() {
        this.mode = '';
        this.initCondition({
          queryCondition: JSON.stringify({
            type: 'in',
            bedBusinessStatus: ''
          })
        });
        this.$nextTick(() => {
          this.showQueryPopover = !this.showQueryPopover;
        });
      },
      async remove() {
        let val = this.plan;
        console.log('删除', val);
        this.$confirm(`确定删除排序计划 [${val.queryName}]吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async (res) => {
          let data = await requestDelPlan({
            inpatQuerySchemeId: val.inpatQuerySchemeId,
            type: this.type
          });
          if (data && data.success) {
            this.$emit('deleteSortPlan', val.inpatQuerySchemeId);
            this.$message.success('删除成功');
            this.closeSelf();
          } else {
            mywinning.showMsg(data.errorDetail.message || '网络错误');
          }
        });
      },
      async edit() {
        let queryCondition = JSON.parse(JSON.stringify(this.saveCondition));
        let tagIds = queryCondition.tagIds;
        delete queryCondition.tagIds;
        delete queryCondition.queryIds;
        const params = {
          ...this.plan,
          appSystemCode: this.isNurse ? '951678' : '951677',
          defaultFlag: '98176',
          visibleFlag: '98175',
          tagIds,
          querySchemeTypeCode: maps[queryCondition.type],
          queryCondition: JSON.stringify(queryCondition),
          type: this.type
        };

        const data = await requestUpdatewQuery(params);

        if (data && data.success) {
          this.$message.success('编辑成功');
          this.$emit('updatePlan', this.plan);
          this.closeSelf();
        } else {
          mywinning.showMsg(data.errorDetail.message || '网络错误');
        }
      },
      detailCondition(plan, planList, mode) {
        this.plan = JSON.parse(JSON.stringify(plan));
        this.planList = planList;
        this.mode = mode || 'detail';
        this.initCondition(plan);

        this.showQueryPopover = true;
      },
      initCondition(plan) {
        //  const plans = [{"inpatQuerySchemeId":"142115857150377984","orgId":null,"employeeId":"57393746696202243","appRoleCode":null,"appSystemCode":"951678","visibleFlag":"98175","seqNo":0,"defaultFlag":"98176","queryName":"在区病人","queryCondition":"{\"type\":\"in\",\"bedBusinessStatus\":\"\"}","tags":[]},{"inpatQuerySchemeId":"142117091953475585","orgId":null,"employeeId":"57393746696202243","appRoleCode":null,"appSystemCode":"951678","visibleFlag":"98175","seqNo":1,"defaultFlag":"98176","queryName":"在区空床","queryCondition":"{\"type\":\"in\",\"bedBusinessStatus\":\"0\"}","tags":[]},{"inpatQuerySchemeId":"141979949318553601","orgId":null,"employeeId":"57393746696202243","appRoleCode":null,"appSystemCode":"951678","visibleFlag":"98175","seqNo":1,"defaultFlag":"98176","queryName":"待入区的人","queryCondition":"{\"type\":\"waitin\"}","tags":[]},{"inpatQuerySchemeId":"142117611644518401","orgId":null,"employeeId":"57393746696202243","appRoleCode":null,"appSystemCode":"951678","visibleFlag":"98175","seqNo":1,"defaultFlag":"98176","queryName":"在区查询方案","queryCondition":"{\"type\":\"in\",\"dateRange\":\"8-h\",\"dateType\":\"1\",\"bedBusinessStatus\":\"2\"}","tags":[{"inpatQueryConditionTagId":"110800168291411970","tagId":"4304571987","tagName":"待转区","tagSeqNo":null},{"inpatQueryConditionTagId":"141738200683304962","tagId":"399016401","tagName":"疼痛","tagSeqNo":null},{"inpatQueryConditionTagId":"139050880372695043","tagId":"399016400","tagName":"防跌倒","tagSeqNo":null},{"inpatQueryConditionTagId":"110800075949615105","tagId":"4303920452","tagName":"新患者","tagSeqNo":null},{"inpatQueryConditionTagId":"141742600852566017","tagId":"399291252","tagName":"护理等级","tagSeqNo":null}]}]

        //  const plans = [{"inpatQuerySchemeId":"142115857150377984","orgId":null,"employeeId":"57393746696202243","appRoleCode":null,"appSystemCode":"951678","visibleFlag":"98175","seqNo":0,"defaultFlag":"98176","queryName":"在区病人","queryCondition":"{\"type\":\"in\",\"bedBusinessStatus\":\"\"}","tags":[]},{"inpatQuerySchemeId":"142134211693117440","orgId":null,"employeeId":"57393746696202243","appRoleCode":null,"appSystemCode":"951678","visibleFlag":"98175","seqNo":1,"defaultFlag":"98176","queryName":"在区方案","queryCondition":"{\"type\":\"in\",\"dateRange\":\"8-h\",\"dateType\":\"1\",\"bedBusinessStatus\":\"2\"}","tags":[{"inpatQueryConditionTagId":"110800168291411969","tagId":"4303920459","tagName":"预出院","tagSeqNo":null},{"inpatQueryConditionTagId":"141738200683304960","tagId":"399016400","tagName":"防跌倒","tagSeqNo":null},{"inpatQueryConditionTagId":"139050880372695040","tagId":"399016399","tagName":"防褥疮","tagSeqNo":null},{"inpatQueryConditionTagId":"110800198356183040","tagId":"399016535","tagName":"赤贫","tagSeqNo":null},{"inpatQueryConditionTagId":"110800075949615105","tagId":"4303920452","tagName":"新患者","tagSeqNo":null},{"inpatQueryConditionTagId":"141742600852566017","tagId":"399291252","tagName":"护理等级","tagSeqNo":null}]}]
        //  const plan = plans[plans.length-1]
        const condition = JSON.parse(plan.queryCondition);
        const tags = plan.tags || [];

        switch (condition.type) {
          case 'waitin':
            this.inpatientStatus.activeIndex = 1;
            break;
          case 'in':
            this.inpatientStatus.activeIndex = 0;
            this.inpatStatusSubItem.activeIndex = 0;
            this.otherQuery.activeIndex = 0;
            if (condition.dateType === '1') {
              // this.inpatStatusSubItem.activeIndex
              this.$nextTick(() => {
                this.inpatStatusSubItem.activeIndex = this.inpatStatusSubItem.list.findIndex(
                  (item) => item.value === condition.dateRange
                );
              });
            }
            const ql = this.queryList;
            ql.forEach((item) => {
              item.activeIndex = '';
            });
            if (tags) {
              tags.forEach((tag) => {
                ql.forEach((item, qlIndex) => {
                  const idx = item.inpatQueryConditionTags.findIndex(
                    (tagItem) =>
                      tagItem.tagId === tag.tagId &&
                      tagItem.inpatQueryConditionTagId === tag.inpatQueryConditionTagId
                  );
                  if (idx !== -1) {
                    item.activeIndex = idx;
                  }
                });
              });
            }
            this.queryData.forEach((item) => {
              if (item.key in condition) {
                item.activeIndex = 0;
                let idx = item.list.findIndex((it) => it.value === condition[item.key]);
                if (idx !== -1) {
                  item.activeIndex = idx;
                }
              } else {
                item.activeIndex = 0;
              }
            });
            let otherValue = condition[this.otherQuery.key];
            if (otherValue) {
              let idx = this.otherQuery.list.findIndex((it) => it.value === otherValue);
              if (idx !== -1) {
                this.otherQuery.activeIndex = idx;
              }
            }
            break;
          case 'outarea':
          case 'changearea':
          case 'discharged':
            this.inpatientStatus.activeIndex =
              condition.type === 'outarea' ? 2 : condition.type === 'changearea' ? 3 : 4;
            let index = this.outAreaReason.list.findIndex(
              (item) => item.value === condition.dischargeOutcomeCode
            );
            this.outAreaReason.activeIndex = 0;
            if (index !== -1) {
              this.$nextTick(() => {
                this.outAreaReason.activeIndex = index;
              });
            }
            if (condition.timeRange) {
              this.$nextTick(() => {
                this.dateRange = [condition.timeRange.startDate, condition.timeRange.endDate];
              });
            } else {
              let index = this.inpatStatusSubItem.list.findIndex(
                (item) => item.value === condition.dateRange
              );
              this.inpatStatusSubItem.activeIndex = 0;
              if (index !== -1) {
                this.$nextTick(() => {
                  this.inpatStatusSubItem.activeIndex = index;
                });
              }
            }
            break;
        }
      },
      reset() {
        this.inpatientStatus.activeIndex = 0;
        this.queryList.map((item) => {
          if (item.hasOwnProperty('activeIndex')) {
            item.activeIndex = '';
          }
        });
      },
      closeSelf() {
        setTimeout(() => {
          this.showQueryPopover = false;
        }, 30);
      },
      async handleQuery() {
        let queryIds;
        let data = JSON.parse(JSON.stringify(this.saveCondition));
        if (data.queryIds) {
          queryIds = data.queryIds;
          delete data.queryIds;
        }
        delete data.tagIds;
        this.$emit('selfQuery', {
          queryName: '其他',
          queryCondition: JSON.stringify(data),
          queryIds
        });
        this.$emit('resetActive');
        this.closeSelf();
      },
      handleQueryItem(item, cell, index, i) {
        if (this.mode === 'view') return;
        if (this.isPatientList && item.name === '床位状态') return false;
        if (index !== '' && this.inpatientStatus.activeIndex !== 0) return false;
        this.$set(item, 'activeIndex', i);
      }
    }
  };
</script>
<style lang="scss" scoped>
  .search-confition-btn {
    display: flex;
    align-items: center;
    margin-left: 10px;
    box-sizing: border-box;
    color: #7e89a4;
    font-size: 16px;
    cursor: pointer;
    outline: 0;
    .filter-img {
      font-size: 20px;
      margin-right: 8px;
    }
  }

  .is-active_sort {
    color: var(--COLOR-NORMAL, #2d5afa);
    border-color: transparent;
  }

  .search-confition-btn:hover {
    color: var(--COLOR-NORMAL, #2d5afa);

    i {
      color: var(--COLOR-NORMAL, #2d5afa);
    }
  }
</style>
<style lang="scss">
  .query-setting-popover {
    padding: 0 16px;
    /*height: 378px;*/
    display: flex;
    flex-direction: column;
    background: #fff;
    box-sizing: border-box;
    margin-top: 30px;

    .scroll-content {
      flex: 1;
      overflow-y: auto;
      padding: 32px 0 16px 0;

      .query-item {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .details-date {
          height: 32px;
          line-height: 32px;
          display: inline-flex;
          align-items: center;

          .el-date-editor {
            margin-left: 10px;
            height: 32px !important;
            line-height: unset !important;
            .el-range-separator {
              box-sizing: content-box;
            }
            .el-range-separator,
            .el-input__icon {
              line-height: 24px;
            }
          }
        }

        &.sub {
          .query-item-cell {
            margin-bottom: 10px;
            margin-right: 10px !important;
          }
        }
        &.disable {
          .query-item-cell {
            cursor: not-allowed !important;
            &.is-active {
              color: #666666;
              background-color: #eee;
            }
          }
        }

        &.sub.out-reason {
          .query-item-cell {
            margin-bottom: unset;
            margin-right: 10px !important;
          }
        }

        &.disabled {
          .query-item-left {
            color: #999999;
          }

          .query-item-right .query-item-cell {
            cursor: not-allowed !important;
            color: #999999;

            &.is-active {
              color: #999999;
              background-color: rgba(204, 204, 204, 0.3);
            }
          }
        }

        .query-item-left {
          width: 70px;
          text-align: right;
          font-size: 16px;
          color: #666666;
          margin-right: 16px;
        }

        .query-item-right {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          .details-date {
            font-size: 16px;
            color: #333;
            margin-bottom: 16px;
          }

          .query-item-cell {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            height: 24px;
            min-width: 80px;
            line-height: 24px;
            font-size: 16px;
            cursor: pointer;
            color: #333;
            padding: 0 10px;
            box-sizing: border-box;
            margin-right: 24px;
            margin-bottom: 16px;
            text-align: left;
          }

          .is-active {
            // padding: 0px;
            border-radius: 4px;
            text-align: center;
            background: #eef2fd;
            color: var(--COLOR-NORMAL, #2d5afa);
          }
        }
      }
    }

    .footer-content {
      text-align: right;
      border-top: 1px solid #e2eaff;
      padding: 16px 0;
      display: flex;
      justify-content: space-between;

      // .el-button--primary {
      //     background: #5A7BEF
      // }
    }

    .btn {
      height: 32px;
      padding: 0px 16px;
    }
  }

  .query-setting-popover.el-popover {
    // margin-top: 55px;
    // transform:translateY(30px)
  }
</style>
