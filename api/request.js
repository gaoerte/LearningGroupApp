/**
 * API 请求基础配置
 */
import config from '../config.js';

/**
 * 统一的 API 请求方法
 * @param {object} options 请求配置
 * @returns {Promise} 请求结果
 */
export function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    timeout = 10000
  } = options;

  return new Promise((resolve, reject) => {
    uni.request({
      url: url.startsWith('http') ? url : `${config.API_BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (error) => {
        reject(new Error(`网络请求失败: ${error.errMsg}`));
      }
    });
  });
}

/**
 * GET 请求
 */
export function get(url, params = {}, options = {}) {
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  });
}

/**
 * POST 请求
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT 请求
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE 请求
 */
export function del(url, options = {}) {
  return request({
    url,
    method: 'DELETE',
    ...options
  });
}
