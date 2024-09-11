import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import type { CurrentUser } from '@/models/user';
import GlobalLoading from '@/components/GlobalLoading';
import { getCurrentUser } from '@/services/user';
import './plugins/axios';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <GlobalLoading />,
};

/**
 * 全局初始状态
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * 
 * 异步获取初始状态
 * 
 * 该函数主要用于在应用启动时获取初始状态，包括当前用户信息等
 * 目前仅返回当前用户信息，如果需要更多初始状态信息，可以在此函数中扩展
 * 
 * @returns 返回一个Promise，解析为包含当前用户信息的对象
 * 可能的返回值结构为：
 * - currentUser: 当前用户信息对象，如果未登录则为undefined
 * 
 * 注意：该函数通过调用getCurrentUser函数获取当前用户信息，并在用户已登录的情况下，
 * 将最后登录时间保存到localStorage中
 */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: CurrentUser;
  fetchUserInfo?: () => Promise<CurrentUser | undefined>;
}> {
  // 获取当前用户信息
  const currentUser = await getCurrentUser();
  // 如果用户已登录，则更新localStorage中的最后登录时间
  if (currentUser) {
    localStorage.setItem('lastLoginTime', currentUser.lastLoginTime);
  }

  // 返回当前用户信息，如果未登录则返回undefined
  return {
    currentUser: currentUser ?? undefined,
  };
}

/**
 * 关闭默认布局
 */
export const layout = () => {
  return {
    menuHeaderRender: undefined,
    headerRender: false,
  };
};
