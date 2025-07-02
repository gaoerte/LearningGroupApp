// test/dead-loop-test.js
// 死循环问题测试脚本

import { safeTestAPI } from '../utils/apiTester-safe.js';
import { safePerf } from '../utils/performance-safe.js';

console.log('🔍 开始死循环问题测试...');

// 测试1: 检查安全性能监控器
console.log('1. 测试安全性能监控器...');
try {
  safePerf.start('test_timer');
  setTimeout(() => {
    const duration = safePerf.end('test_timer');
    console.log(`✅ 性能监控器正常，耗时: ${duration}ms`);
  }, 100);
} catch (error) {
  console.error('❌ 性能监控器测试失败:', error);
}

// 测试2: 检查API测试器
console.log('2. 测试API测试器...');
try {
  // 创建一个简单的测试函数
  const simpleTest = () => Promise.resolve({ success: true, data: 'test' });
  
  safeTestAPI.runSingleTest('简单测试', simpleTest).then(result => {
    if (result) {
      console.log('✅ API测试器正常');
    } else {
      console.log('⚠️ API测试器返回空结果');
    }
  }).catch(error => {
    console.error('❌ API测试器测试失败:', error);
  });
} catch (error) {
  console.error('❌ API测试器初始化失败:', error);
}

// 测试3: 检查循环引用
console.log('3. 检查循环引用...');
try {
  // 模拟多次调用，检查是否会导致死循环
  for (let i = 0; i < 10; i++) {
    safePerf.start(`loop_test_${i}`);
    safePerf.end(`loop_test_${i}`);
  }
  console.log('✅ 循环调用测试通过');
} catch (error) {
  console.error('❌ 循环调用测试失败:', error);
}

// 测试4: 内存泄漏检查
console.log('4. 内存泄漏检查...');
try {
  const initialMemory = safePerf.export();
  
  // 执行一些操作
  for (let i = 0; i < 50; i++) {
    safePerf.safeRecordMetric(`test_metric_${i}`, { value: i });
  }
  
  const afterMemory = safePerf.export();
  
  if (Object.keys(afterMemory.metrics).length <= 50) {
    console.log('✅ 内存管理正常');
  } else {
    console.log('⚠️ 可能存在内存泄漏');
  }
} catch (error) {
  console.error('❌ 内存泄漏检查失败:', error);
}

console.log('🎉 死循环问题测试完成');

export default {
  runTest: () => {
    console.log('Dead loop test runner executed');
  }
};
