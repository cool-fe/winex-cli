/* eslint-disable-next-line  */
import config from './apiConfig.js';

/* eslint-disable-next-line */
const base = config.base;
const inpatientEnc = config.inpatientEncounter;
const personCis = config.personCis;

// :查询床位卡筛选分组配置列表
export const QUERY_CONDITION = `${inpatientEnc}/api/v1/app_inpatient_encounter/query_condition/query/by_example`;

export const ALLERGY_DELETE = `${personCis}/api/v1/person_cis/allergen_category/delete`;

// 新增筛选条件方案
export const ADD_NEW_QUERY = `${inpatientEnc}/api/v1/app_inpatient_encounter/inpatient_query_settings/save`;
export const UPDATE_QUERY = `${inpatientEnc}/api/v1/app_inpatient_encounter/inpatient_query_settings/update`;

export const DELETE_PLAN = `${inpatientEnc}/api/v1/app_inpatient_encounter/inpatient_query_settings/delete`;
