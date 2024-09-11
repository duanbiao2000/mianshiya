import type { MeetQuestionType, MeetQuestionUserType } from '@/models/meetQuestion';
import type { PageResult, PageSearchParams } from './common';
import axios from 'axios';

export interface MeetQuestionSearchParams extends PageSearchParams {
  questionId?: string;
  userId?: string;
}

/**
 * 新增
 * @param params
 */
export function addMeetQuestion(params: Partial<MeetQuestionType>) {
  const { tags, questionId } = params;
  if (!questionId || !tags || tags.length < 1) {
    return false;
  }

  return axios
    .post('/meet-question/add', params)
    .then((res: any) => {
      console.log(`addMeetQuestion succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`addMeetQuestion error`, e);
      return false;
    });
}

/**
 * 分页搜索
 * @param params
 */
/**
 * 异步函数用于搜索会议问题相关的用户信息
 * @param params 搜索参数对象，包含会议ID、问题关键词等用于搜索的信息
 * @returns 返回一个Promise对象，解析为PageResult类型的结果，包含会议问题的用户信息列表和总数
 */
export async function searchMeetQuestions(
  params: MeetQuestionSearchParams,
): Promise<PageResult<MeetQuestionUserType>> {
  try {
    // 使用axios发送POST请求到'/meet-question/search'，携带搜索参数
    const response = await axios.post('/meet-question/search', params);
    // 请求成功时，记录日志并返回响应结果
    console.log(`searchMeetQuestions succeed`, response);
    return response;
  } catch (error) {
    // 请求失败时，记录错误日志并返回一个包含空数组和总数为0的结果对象
    console.error('searchMeetQuestions error', error);
    return {
      data: [],
      total: 0,
    };
  }
}

/**
 * 修改
 * @param meetQuestionId
 * @param meetQuestion
 */
export async function updateMeetQuestion(
  meetQuestionId: string,
  meetQuestion: Partial<MeetQuestionType>,
) {
  if (!meetQuestionId || !meetQuestion) {
    return false;
  }

  return axios
    .post('/meet-question/update', {
      meetQuestionId,
      meetQuestion,
    })
    .then((res: any) => {
      console.log(`updateMeetQuestion succeed, id = ${meetQuestionId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`updateMeetQuestion error, id = ${meetQuestionId}`, e);
      return false;
    });
}

/**
 * 删除
 * @param meetQuestionId
 */
export function deleteMeetQuestion(meetQuestionId: string) {
  if (!meetQuestionId) {
    return false;
  }

  return axios
    .post('/meet-question/delete', {
      meetQuestionId,
    })
    .then((res: any) => {
      console.log(`deleteMeetQuestion succeed, id = ${meetQuestionId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`deleteMeetQuestion error, id = ${meetQuestionId}`, e);
      return false;
    });
}
