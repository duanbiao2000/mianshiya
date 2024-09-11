/**
 * 根据当前用户的身份，判断用户是否有特定的访问权限。
 * 
 * 此函数用于确定用户是否为管理员、是否已登录、以及是否被封号。
 * 它通过检查当前用户的信息（如果提供）来做出这些判断。
 * 
 * @param initialState 应用程序的初始状态，可能包含当前用户的信息。
 *                     用户信息的格式由 `/models/user` 中定义。
 * @returns 返回一个对象，该对象包含用户是否为管理员、是否已登录、以及是否被封号的布尔值。
 */
import type { CurrentUser } from '@/models/user';

export interface AccessType {
  canAdmin: boolean; // 是否为管理员
  canUser: boolean; // 是否已登录
  isBan: boolean; // 是否被封号
}

export default function access(initialState: { currentUser?: CurrentUser | undefined }): AccessType {
  const { currentUser } = initialState || {};
  return {
    // 判断当前用户是否为管理员
    canAdmin: currentUser?.authority === 'admin',

    // 判断是否存在当前用户
    canUser: !!currentUser,

    // 判断当前用户是否被禁用
    isBan: currentUser?.authority === 'ban',
  };
}
