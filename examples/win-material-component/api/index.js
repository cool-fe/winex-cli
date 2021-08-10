import Request from '@winfe/win-request';

import * as url from './url-constants';

console.log(999, Request);

const filterReq = new Request({});

const req = function req(arg, name) {
  return new Promise((resolve, reject) => {
    filterReq.service
      .post(name, arg)
      .then(async (res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const reqQueryCondition = function () {
  return req.call(this, ...arguments, url.QUERY_CONDITION);
};

export const requestAddnewQuery = function () {
  return req.call(this, ...arguments, url.ADD_NEW_QUERY);
};

export const requestUpdatewQuery = function () {
  return req.call(this, ...arguments, url.UPDATE_QUERY);
};

export const requestDelPlan = function () {
  return req.call(this, ...arguments, url.DELETE_PLAN);
};

//
