import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

// 获取所有问卷题目
export async function GET(request: NextRequest) {
  try {
    console.log('=== 获取问卷题目API ===');

    const supabase = await createClient();

    // 从数据库获取所有激活的题目，按order排序
    const { data: questions, error } = await supabase
      .from('question_templates')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('数据库查询失败:', error);
      throw error;
    }

    console.log(`成功获取 ${questions?.length || 0} 个题目`);

    // 转换数据格式，适配前端页面
    const formattedQuestions = questions?.map(q => ({
      id: q.order, // 使用order作为id，因为页面是按顺序显示的
      order: q.order,
      title: q.question_text,
      guide: q.guide_text || '',
      category: q.category || 'general',
      isActive: q.is_active
    })) || [];

    // 按页面分组（每页2题）
    const questionsByPage: Record<number, any[]> = {};
    formattedQuestions.forEach((question, index) => {
      const pageNumber = Math.floor(index / 2) + 1;
      if (!questionsByPage[pageNumber]) {
        questionsByPage[pageNumber] = [];
      }
      questionsByPage[pageNumber].push(question);
    });

    return NextResponse.json({
      success: true,
      data: {
        allQuestions: formattedQuestions,
        questionsByPage,
        totalQuestions: formattedQuestions.length,
        totalPages: Math.ceil(formattedQuestions.length / 2)
      }
    });

  } catch (error: any) {
    console.error('获取问卷题目失败:', error);

    // 如果数据库查询失败，返回默认题目（容错处理）
    const defaultQuestions = getDefaultQuestions();

    return NextResponse.json({
      success: false,
      error: error.message,
      data: {
        allQuestions: defaultQuestions,
        questionsByPage: groupQuestionsByPage(defaultQuestions),
        totalQuestions: defaultQuestions.length,
        totalPages: Math.ceil(defaultQuestions.length / 2),
        note: '使用默认题目（数据库查询失败）'
      },
      message: '数据库查询失败，使用默认题目'
    }, { status: 200 }); // 仍然返回200，但包含错误信息
  }
}

// 默认题目（作为容错备用）
function getDefaultQuestions() {
  return [
    { id: 1, order: 1, title: "请描述你在日常工作中对安全规范的理解。", guide: "可以从操作流程、风险防范意识、个人习惯等方面进行描述。", category: "general" },
    { id: 2, order: 2, title: "当你发现施工环境存在隐患时，通常会怎么做？", guide: "可以结合你平时的处理方式进行回答，例如上报、规避、提醒同事等。", category: "general" },
    { id: 3, order: 3, title: "你认为在矿工作业中，最容易被忽视的安全风险是什么？", guide: "可以结合你的岗位、经验或观察到的情况进行说明。", category: "general" },
    { id: 4, order: 4, title: "遇到突发情况时，你通常会优先考虑哪些处理步骤？", guide: "可以从个人反应、团队协作、上报流程等角度描述。", category: "general" },
    { id: 5, order: 5, title: "你平时是否会主动学习或关注安全生产相关知识？", guide: "可以结合培训、班前会、日常交流或自我学习情况来描述。", category: "general" },
    { id: 6, order: 6, title: "当同事存在不安全操作时，你通常会怎样处理？", guide: "可以从提醒、上报、协助纠正或其他做法来描述。", category: "general" },
    { id: 7, order: 7, title: "你认为安全意识强的员工通常具备哪些特点？", guide: "可以从行为习惯、责任心、规范执行等方面进行回答。", category: "general" },
    { id: 8, order: 8, title: "你所在的工作环境中，哪些因素最容易影响安全操作执行？", guide: "可以考虑设备、环境、管理、个人状态等因素。", category: "general" },
    { id: 9, order: 9, title: "在日常工作中，你是如何平衡工作效率与安全要求的？", guide: "可以结合具体场景和做法进行说明。", category: "general" },
    { id: 10, order: 10, title: "对于提升你个人或团队的安全意识，你有什么建议或想法？", guide: "可以根据实际情况提出具体可行的建议。", category: "general" }
  ];
}

// 按页面分组
function groupQuestionsByPage(questions: any[]) {
  const questionsByPage: Record<number, any[]> = {};
  questions.forEach((question, index) => {
    const pageNumber = Math.floor(index / 2) + 1;
    if (!questionsByPage[pageNumber]) {
      questionsByPage[pageNumber] = [];
    }
    questionsByPage[pageNumber].push(question);
  });
  return questionsByPage;
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}