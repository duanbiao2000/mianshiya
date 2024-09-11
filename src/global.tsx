import { Button, message, notification } from 'antd';
import defaultSettings from '../config/defaultSettings';
const { pwa } = defaultSettings;
const isHttps = document.location.protocol === 'https:';

/**
 * 清除所有缓存
 * 
 * 此函数通过调用Service Worker的caches接口来删除应用的所有缓存文件
 * 它首先获取所有缓存的键(keys)，然后对每个键调用caches.delete方法来删除对应的缓存
 * 如果获取键或删除缓存的过程中发生错误，则通过console.log输出错误信息
 * 
 * 注意：此函数的执行前提是window.caches存在，即Service Worker被支持
 */
const clearCache = () => {
  // 检查caches对象是否存在，这个对象在Service Worker环境中可用
  if (window.caches) {
    // 获取所有缓存的键
    caches
      .keys()
      .then((keys) => {
        // 遍历所有缓存键，删除对应的缓存
        keys.forEach((key) => {
          caches.delete(key);
        });
      })
      .catch((e) => console.log(e)); // 如果发生错误，输出错误信息
  }
};

// 如果PWA功能已启用
if (pwa) {
  // 当离线时通知用户
  window.addEventListener('sw.offline', () => {
    message.warning('当前处于离线状态');
  }); // 在页面上弹出一个提示，询问用户是否要使用最新版本

  // 当有新版本时处理更新
  window.addEventListener('sw.updated', (event: Event) => {
    // 将事件对象强制转换为CustomEvent类型
    const e = event as CustomEvent;

    // 重新加载Service Worker并清除缓存
    const reloadSW = async () => {
      // 检查ServiceWorkerRegistration中是否有处于等待状态的Service Worker
      const worker = e.detail && e.detail.waiting;

      if (!worker) {
        return true;
      } 
      // 通过MessageChannel向等待中的Service Worker发送skip-waiting事件
      await new Promise((resolve, reject) => {
        const channel = new MessageChannel();

        channel.port1.onmessage = (msgEvent) => {
          if (msgEvent.data.error) {
            reject(msgEvent.data.error);
          } else {
            resolve(msgEvent.data);
          }
        };

        worker.postMessage(
          {
            type: 'skip-waiting',
          },
          [channel.port2],
        );
      });
      clearCache();
      window.location.reload();
      return true;
    };

    // 创建一个唯一的键值，用于关闭通知
    const key = `open${Date.now()}`;
    // 创建一个按钮，用于触发重新加载
    const btn = (
      <Button
        type="primary"
        onClick={() => {
          notification.close(key);
          reloadSW();
        }}
      >
        {'刷新'}
      </Button>
    );
    // 打开通知，提示用户有新内容并提供刷新按钮
    notification.open({
      message: '有新内容',
      description: '请点击“刷新”按钮或者手动刷新页面',
      btn,
      key,
      onClose: async () => null,
    });
  });
} else if ('serviceWorker' in navigator && isHttps) {
  // 如果不在PWA模式下，但Service Worker功能可用且网站在HTTPS下运行，则注销Service Worker
  const { serviceWorker } = navigator;

  // 注销所有已注册的Service Workers
  if (serviceWorker.getRegistrations) {
    serviceWorker.getRegistrations().then((sws) => {
      sws.forEach((sw) => {
        sw.unregister();
      });
    });
  }

  // 注销当前注册的Service Worker（如果有）
  serviceWorker.getRegistration().then((sw) => {
    if (sw) sw.unregister();
  });
  clearCache(); // 清除缓存
}
