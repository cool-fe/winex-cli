<template>
  <div class="home-query-setting">
    <div class="scroll-content">
      <div class="query-item">
        <div class="query-item-left">{{ inpatientStatus.name }}</div>
        <div class="query-item-right">
          <span
            :class="{ 'query-item-cell': true, 'is-active': i === inpatientStatus.activeIndex }"
            @click="handleQueryItem(inpatientStatus, cell, '', i)"
            v-for="(cell, i) in inpatientStatus.list"
            :key="i"
            >{{ cell.label }}</span
          >
        </div>
      </div>
      <div v-show="inpatStatusSubItem.list" class="query-item sub">
        <div class="query-item-left"></div>
        <div class="query-item-right">
          <span
            :class="{ 'query-item-cell': true, 'is-active': i === inpatStatusSubItem.activeIndex }"
            @click="handleQueryItem(inpatStatusSubItem, cell, '', i)"
            v-for="(cell, i) in inpatStatusSubItem.list"
            :key="i"
            >{{ cell.label }}</span
          >
          <span
            v-show="inpatientStatus.activeIndex === 2 || inpatientStatus.activeIndex === 3"
            class="details-date"
          >
            指定起止日期
            <el-date-picker
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
              'is-active': item.activeIndex === '' || item.activeIndex === undifined
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
    </div>
    <div class="footer-content">
      <el-button class="btn" @click.native="queryDialogFlag = true">存为我的查询</el-button>
      <div>
        <el-button class="btn" type="default" @click="closeSelf">取消</el-button>
        <el-button class="btn" type="primary" @click="handleQuery">查询</el-button>
      </div>
    </div>
    <query-dialog
      :queryDialog="queryDialogFlag"
      @closeDialog="queryDialogFlag = false"
      @updateList="
        () => {
          this.$emit('updateList');
          this.closeSelf();
        }
      "
      :saveCondition="saveCondition"
    />
  </div>
</template>

<script>
  // import { createNamespacedHelpers } from 'vuex'
  import queryDialog from './queryDialog.vue';
  import { reqQueryCondition } from '../api/index';

  // const { mapActions, mapGetters, mapState } = createNamespacedHelpers('list')

  export default {
    name: 'querySetting',
    components: { queryDialog },
    computed: {
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
          if (n !== 0) {
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
        dateRange: '',
        inpatientStatus: {
          name: '住院状态',
          key: 'bedBusinessStatus', // s是否有人
          activeIndex: 0,
          list: [
            {
              value: '',
              label: '在区',
              activeIndex: 0,
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
              label: '待入区'
            },
            {
              value: '1',
              label: '已出区',
              activeIndex: 0,
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
          // {
          // 	name: '范围',
          // 	key: isNurse ? 'nurseId' : 'doctorId',
          // 	activeIndex: 0,
          // 	list: [{
          // 		value: '',
          // 		label: '全院'
          // 	}, {
          // 		value: employeeId,
          // 		label: '我的患者'
          // 	}]
          // },
          // {
          // 	name: '费用情况',
          // 	key: 'dischargeSettlementFlag', // 出院结算标志
          // 	activeIndex: 0,
          // 	list: [{
          // 		value: '',
          // 		label: '全部'
          // 	}, {
          // 		value: '98175',
          // 		label: '已结算'
          // 	}, {
          // 		value: '98176',
          // 		label: '未结算'
          // 	}]
          // }
          // {
          // 	name: '病人标记',
          // 	key: 'inpatientStatus', // 住院状态代码
          // 	activeIndex: 0,
          // 	list: [
          // 		{ label: '全部', value: '1' },
          // 		{ label: '病重', value: '1' },
          // 		{ label: '病危', value: '1' },
          // 		{ label: '死亡', value: '1' },
          // 		{ label: '待出院', value: '1' },
          // 		{ label: '请假外出', value: '1' }
          // 	]
          // }
        ],
        queryList: [],
        queryDialogFlag: false
      };
    },
    methods: {
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
          this.$emit('closeSelf');
        }, 300);
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
        if (index !== '' && this.inpatientStatus.activeIndex !== 0) return false;
        if (!item.hasOwnProperty('activeIndex')) {
          this.$set(item, 'activeIndex', i);
        } else {
          item.activeIndex = i;
        }
      }
    },
    created() {
      reqQueryCondition({})
        .then((res) => {
          if (res && res.success) {
            this.queryList = res.data;
          }
        })
        .catch((err) => {
          console.log(err, 45555);
        });
    }
  };
</script>
