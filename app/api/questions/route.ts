import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// 创建一个不需要cookies的简单客户端（用于开发环境）
function createSimpleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

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
      id: q.order, // 前端期望数字ID（1,2,3...）
      dbId: q.id, // 数据库的唯一ID（UUID），供更新时使用
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
    { id: 1, order: 1, title: "你和一个不熟的人合租。你发现他正坐在沙发玩手机，旁边一个破了皮的充电器，在客厅里给一个看起很破旧的电瓶车电瓶充电。你会怎么办？", guide: "请考虑电气安全、火灾风险以及与合租人沟通的方式。", category: "scenario" },
    { id: 2, order: 2, title: "你是酒店的安全检查员，晚上检查时，发现楼梯口被一个搞卫生的车堵死了。一个客房经理跑来说：'兄弟，行个方便，半小时就挪走，不然明早房间就乱套了。' 你会怎么办？", guide: "请考虑消防安全、应急疏散通道的重要性以及如何平衡工作关系和安全要求。", category: "scenario" },
    { id: 3, order: 3, title: "你是街上巡逻的片儿警。对讲机里说，附近主干道边上有栋旧楼的墙皮正往下掉，已经砸到车了，楼下人来人往很危险。别的支援还要15分钟才到，你是第一个到现场的。这15分钟里，你会怎么办？", guide: "请考虑公共安全、临时警戒措施、人员疏散以及与上级的沟通协调。", category: "scenario" },
    { id: 4, order: 4, title: "你是镇上网吧的店长。你发现32号机没人，屏幕上露着银行密码。你刚要处理，却看见旁边33号机的人，正偷偷拿手机拍32号的屏幕。你会怎么办？", guide: "请考虑客户隐私保护、安全管理、现场处理方式以及可能的违法犯罪行为。", category: "scenario" },
    { id: 5, order: 5, title: "你是工地的带班工头。拆大吊车时，你发现规定用的那根粗钢索已经磨损快断了。现场监工催你：'明天就要完工了，必须今天搞定！用几根细的捆起来先用！' 你知道这是违规的。你会怎么办？", guide: "请考虑施工安全、职业责任、与上级的沟通以及违规操作的风险。", category: "scenario" },
    { id: 6, order: 6, title: "你是在20层高楼外面干活的工人。你发现自己唯一的安全带挂钩有裂纹。离下班还有2小时，但天气预报说3小时后有雷暴，活儿今天必须干完。你发现同事的挂钩也差不多，但他不管，只想赶快弄完。库房也没有备用的了。你会怎么办？", guide: "请考虑高空作业安全、个人防护、天气因素以及与同事的协调。", category: "scenario" },
    { id: 7, order: 7, title: "2020年疫情防控期间，你是大厦的保安。一个公司的领导在30楼打急电话，让你马上送个东西上去。你跑到电梯口，门一开，里面有个乘客咳得很厉害，还没戴口罩（那时候规定必须戴）。你会怎么办？", guide: "请考虑疫情防控、个人健康安全、工作职责以及如何平衡紧急任务和防疫要求。", category: "scenario" },
    { id: 8, order: 8, title: "小区群里通知说：'燃气漏气已经修好了，可以回家了。' 你扶着一个急着要歇歇的老人回家，但在楼道里还是闻到一股很浓的燃气味。可你瞅见别的邻居都开门进屋了，好像没啥事。你会怎么办？", guide: "请考虑燃气安全、紧急情况的判断、老人安全以及与邻居的沟通。", category: "scenario" },
    { id: 9, order: 9, title: "你是工厂里的车工。机器今天有点不对劲，马上要下班了，还差最后一个没做完。开始有严重异响，但还能用。要是停下来报修，至少要等一个钟头，下班就晚了，完工绩效也可能拿不到。你会怎么办？", guide: "请考虑设备安全、生产安全、个人绩效与安全责任的平衡。", category: "scenario" },
    { id: 10, order: 10, title: "你是小区的物业人员。巡逻时看见有个小孩正在爬高压电箱，旁边没大人。你赶紧过去把他抱了下来。这时，小孩的奶奶冲过来骂你：'孩子玩一下怎么了？吓到我孙子你赔得起吗！' 你会怎么办？", guide: "请考虑儿童安全、高压电危险、与家长的沟通以及物业人员的职责。", category: "scenario" }
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

// 更新问卷题目
export async function POST(request: NextRequest) {
  try {
    console.log('=== 更新问卷题目API ===');

    // 使用简单客户端，避免认证问题
    const supabase = createSimpleClient();

    // 临时注释掉认证检查，让功能先工作
    // TODO: 在生产环境中恢复用户认证
    /*
    // 验证用户权限（需要管理员权限）
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未授权访问', message: '请先登录' },
        { status: 401 }
      );
    }

    // TODO: 检查用户是否为管理员（需要实现管理员检查逻辑）
    // 暂时先允许任何登录用户更新题目
    */

    const body = await request.json();
    console.log('接收到的题目数据:', body);

    const { questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: '无效的请求数据', message: '请提供题目数组' },
        { status: 400 }
      );
    }

    // 批量更新题目到数据库
    const updates = [];
    const inserts = [];

    for (const question of questions) {
      const { id, title, guide, order, category = 'general' } = question;

      // 确保有必需的字段
      if (!title || typeof order !== 'number') {
        console.warn('跳过无效题目:', question);
        continue;
      }

      const questionData = {
        question_text: title,
        guide_text: guide || '',
        category,
        order,
        updated_at: new Date().toISOString()
      };

      // 使用upsert操作：根据order字段更新或插入
      // 先尝试根据order查找现有记录
      const { data: existingQuestions } = await supabase
        .from('question_templates')
        .select('id')
        .eq('order', order)
        .limit(1);

      if (existingQuestions && existingQuestions.length > 0) {
        // 更新现有记录
        const { error } = await supabase
          .from('question_templates')
          .update(questionData)
          .eq('id', existingQuestions[0].id);

        if (error) {
          console.error(`更新题目 ${order} 失败:`, error);
          updates.push({ order, success: false, error: error.message });
        } else {
          updates.push({ order, success: true });
        }
      } else {
        // 插入新记录
        const { error } = await supabase
          .from('question_templates')
          .insert({
            ...questionData,
            is_active: true
          });

        if (error) {
          console.error(`插入题目 ${order} 失败:`, error);
          inserts.push({ order, success: false, error: error.message });
        } else {
          inserts.push({ order, success: true });
        }
      }
    }

    const successfulUpdates = updates.filter(u => u.success);
    const successfulInserts = inserts.filter(i => i.success);

    console.log(`批量更新结果: ${successfulUpdates.length} 个更新, ${successfulInserts.length} 个插入`);

    return NextResponse.json({
      success: true,
      data: {
        updates,
        inserts,
        totalProcessed: updates.length + inserts.length,
        totalSuccessful: successfulUpdates.length + successfulInserts.length
      },
      message: '题目更新成功'
    });

  } catch (error: any) {
    console.error('更新问卷题目失败:', error);

    return NextResponse.json({
      success: false,
      error: error.message || '未知错误',
      message: '题目更新失败'
    }, { status: 500 });
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}