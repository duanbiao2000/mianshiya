import type { QuestionType } from '@/models/question';
import reviewStatusEnum, { reviewStatusInfoMap } from '@/constant/reviewStatusEnum';
import type { PageResult, PageSearchParams } from '@/services/common';
import type { CurrentUser } from '@/models/user';
import axios from 'axios';

export interface QuestionSearchParams extends PageSearchParams {
  _ids?: string[];
  notId?: string;
  name?: string;
  tags?: string[]; // 须包含全部标签才查出
  orTags?: string[]; // 包含任一标签就可查出
  priority?: number;
  reviewStatus?: number;
  userId?: string;
  link?: string;
  type?: number;
  difficulty?: number;
  hasReference?: boolean;
}

/**
 * 添加题目
 * @param params
 * @return 题目 id
 */
export function addQuestion(params: QuestionType) {
  if (!params.userId || !params.tags || params.tags.length < 1) {
    return false;
  }

  return axios
    .post('/question/add', params)
    .then((res: any) => {
      console.log(`addQuestion succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`addQuestion error`, e);
      return false;
    });
}

/**
 * 从 ES 搜索题目
 * @param params
 */
/**
 * 异步函数searchQuestions用于搜索问题
 * @param params QuestionSearchParams类型的参数，用于指定搜索条件
 * @returns 返回一个Promise，解析为PageResult<QuestionType>类型的搜索结果
 * 
 * 该函数的主要逻辑是构造搜索条件并调用后端API进行搜索
 * 1. 构造搜索条件condition，基于传入的params，默认条件为未删除状态
 * 2. 设置默认的排序键和排序方向，如果params中未指定
 * 3. 打印构造的搜索条件，以便于调试和日志记录
 * 4. 调用axios.post向'/question/search'端点发送POST请求，携带构造的搜索条件
 * 5. 请求成功后，打印成功信息并返回响应结果
 * 6. 如果发生错误，打印错误信息并返回false表示搜索失败
 */
export async function searchQuestions(
  params: QuestionSearchParams,
): Promise<PageResult<QuestionType>> {
  // 构造搜索条件，包括默认的未删除状态
  const condition = { isDelete: false, ...params };
  
  // 设置默认的排序键为'_score'，如果params中未指定
  if (!condition.orderKey) {
    condition.orderKey = '_score';
  }
  
  // 设置默认的排序方向为'desc'，如果params中未指定
  if (!condition.order) {
    condition.order = 'desc';
  }
  
  // 打印构造的搜索条件，便于调试
  console.log(condition);
  
  // 向'/question/search'端点发送POST请求，携带构造的搜索条件
  return axios
    .post('/question/search', condition)
    .then((res: any) => {
      // 请求成功，打印成功信息并返回响应结果
      console.log(`searchQuestions s`, res);
      return res;
    })
    .catch((e: any) => {
      // 请求失败，打印错误信息并返回false
      console.error(`searchQuestions e`, e);
      return false;
    });
}

/**
 * 分页搜索题目（直接调云数据库）
 * @param params
 */
/**
 * 异步函数：按页搜索问题
 * 根据提供的参数，搜索相应页面的问题，并返回搜索结果
 * 如果参数中的 pageSize 或 pageNum 小于1，返回空结果
 * 通过 axios 发送 POST 请求进行搜索，成功则返回搜索结果，失败则返回空结果
 * 
 * @param params - 搜索参数对象，包含 pageSize 和 pageNum 等
 * @returns 返回一个 Promise 对象，解析后的结果为 PageResult<QuestionType> 类型
 */
export async function searchQuestionsByPage(
  params: QuestionSearchParams,
): Promise<PageResult<QuestionType>> {
  // 默认参数设置：如果未指定，则 pageSize 和 pageNum 分别默认为12和1
  const { pageSize = 12, pageNum = 1 } = params;
  // 定义一个空结果对象，用于在搜索失败时返回
  const emptyResult = {
    data: [],
    total: 0,
  };

  // 如果 pageSize 或 pageNum 小于1，直接返回空结果
  if (pageSize < 1 || pageNum < 1) {
    return emptyResult;
  }

  // 发送 POST 请求搜索问题，成功或失败后分别处理结果
  return axios
    .post('/question/search/origin', params)
    .then((res: any) => {
      console.log('searchQuestionsByPage succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('searchQuestionsByPage error', e);
      return emptyResult;
    });
}

/**
 * 分页获取用户收藏的题目列表
 * @param currentUser
 * @param params
 */
/**
 * 异步函数searchUserFavourQuestions用于查询当前用户收藏的问题列表
 * 
 * @param currentUser 当前用户的信息，包含收藏的问题ID
 * @param params 问题查询参数，用于指定查询条件
 * @returns 返回一个Promise，解析为分页结果，包含问题数据列表和总数
 */
export async function searchUserFavourQuestions(
  currentUser: CurrentUser,
  params: QuestionSearchParams,
): Promise<PageResult<QuestionType>> {
  // 默认值，用于在用户未登录或无收藏问题时返回空数据列表和总数0
  const defaultValue = {
    data: [],
    total: 0,
  };

  // 如果当前用户未登录，则返回默认值
  if (!currentUser) {
    return defaultValue;
  }

  // 如果当前用户未收藏任何问题，则返回默认值
  if (!currentUser?.favourQuestionIds || currentUser.favourQuestionIds.length === 0) {
    return defaultValue;
  }

  // 设置查询参数，指定查询用户收藏的问题，且通过审核
  params.userId = undefined;
  params._ids = currentUser.favourQuestionIds;
  params.reviewStatus = reviewStatusEnum.PASS;

  // 根据设置的查询参数，调用函数查询分页问题数据并返回结果
  return searchQuestionsByPage(params);
}

/**
 * 增加分享数
 * @param questionId
 */
export function shareQuestion(questionId: string) {
  if (!questionId) {
    return false;
  }

  return axios
    .post('/question/share', {
      questionId,
    })
    .then((res: any) => {
      console.log('shareQuestion succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('shareQuestion error', e);
    });
}

/**
 * 删除题目
 * @param questionId
 */
export function deleteQuestion(questionId: string) {
  if (!questionId) {
    return false;
  }

  return axios
    .post('/question/delete', {
      questionId,
    })
    .then((res: any) => {
      console.log(`deleteQuestion succeed, id = ${questionId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`deleteQuestion error, id = ${questionId}`, e);
      return false;
    });
}

/**
 * 收藏（取消收藏）
 * @param questionId
 * @return 收藏数变化
 */
export function favourQuestion(questionId: string) {
  if (!questionId) {
    return 0;
  }

  return axios
    .post('/question/favour', {
      questionId,
    })
    .then((res: any) => {
      console.log('favourQuestion succeed', res);
      return res.data;
    })
    .catch((e: any) => {
      console.error('favourQuestion error', e);
      return 0;
    });
}

/**
 * 根据用户兴趣获取推荐题目
 * @param size
 */
export function listRecommendQuestions(size: number = 12) {
  return axios
    .post('/question/list/recommend', {
      size,
    })
    .then((res: any) => {
      console.log('listRecommendQuestions succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('listRecommendQuestions error', e);
      return [];
    });
}

/**
 * 修改题目
 * @param questionId
 * @param question
 */
export async function updateQuestion(questionId: string, question: Partial<QuestionType>) {
  if (!questionId || !question) {
    return false;
  }

  return axios
    .post('/question/update', {
      questionId,
      question,
    })
    .then((res: any) => {
      console.log(`updateQuestion succeed, id = ${questionId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`updateQuestion error, id = ${questionId}`, e);
      return false;
    });
}

/**
 * 根据 id 获取题目
 * @param questionId
 */
export function getQuestion(questionId: string) {
  if (!questionId) {
    return null;
  }

  return axios
    .post('/question/get', {
      id: questionId,
    })
    .then((res: any) => {
      console.log('getQuestion succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error(`getQuestion error, id = ${questionId}`, e);
      return null;
    });
}

/**
 * 审核题目
 * @param questionId
 * @param score
 * @param reviewStatus
 * @param reviewMessage
 */
export async function reviewQuestion(
  questionId: string,
  score: number,
  reviewStatus: number,
  reviewMessage?: string,
) {
  if (!questionId || !reviewStatusInfoMap[reviewStatus]) {
    return false;
  }

  return axios
    .post('/question/review', {
      questionId,
      score,
      reviewStatus,
      reviewMessage,
    })
    .then((res: any) => {
      console.log(`reviewQuestion succeed, id = ${questionId}`);
      return res;
    })
    .catch((e: any) => {
      console.error(`reviewQuestion error, id = ${questionId}`, e);
      return false;
    });
}

/**
 * 浏览题目
 * @param questionId
 */
export async function viewQuestion(questionId: string) {
  if (!questionId) {
    return false;
  }

  return axios
    .post('/question/view', {
      questionId,
    })
    .then((res: any) => {
      console.log(`viewQuestion succeed, id = ${questionId}`, res);
      return true;
    })
    .catch((e: any) => {
      console.error(`viewQuestion error, id = ${questionId}`, e);
      return false;
    });
}
