import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function createSimpleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type QuestionInput = {
  id?: number;
  order?: number;
  title?: string;
  question_text?: string;
  guide?: string;
  guide_text?: string;
  category?: string;
};

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: questions, error } = await supabase
      .from("question_templates")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    const dedupedMap = new Map<number, any>();

    for (const q of questions ?? []) {
      if (!dedupedMap.has(q.order)) {
        dedupedMap.set(q.order, q);
      }
    }

    const dedupedQuestions = Array.from(dedupedMap.values()).sort(
      (a, b) => a.order - b.order
    );

    const formattedQuestions =
      dedupedQuestions.map((q) => ({
        id: q.order,
        dbId: q.id,
        order: q.order,
        title: q.question_text,
        guide: q.guide_text || "",
        category: q.category || "general",
        isActive: q.is_active,
      })) || [];

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
        totalPages: Math.ceil(formattedQuestions.length / 2),
      },
    });
  } catch (error: any) {
    const defaultQuestions = getDefaultQuestions();

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: {
          allQuestions: defaultQuestions,
          questionsByPage: groupQuestionsByPage(defaultQuestions),
          totalQuestions: defaultQuestions.length,
          totalPages: Math.ceil(defaultQuestions.length / 2),
          note: "使用默认题目（数据库查询失败）",
        },
        message: "数据库查询失败，使用默认题目",
      },
      { status: 200 }
    );
  }
}

function getDefaultQuestions() {
  return [
    {
      id: 1,
      order: 1,
      title:
        "你和一个不熟的人合租。你发现他正坐在沙发玩手机，旁边一个破了皮的充电器，在客厅里给一个看起很破旧的电瓶车电瓶充电。你会怎么办？",
      guide: "请考虑电气安全、火灾风险以及与合租人沟通的方式。",
      category: "scenario",
    },
    {
      id: 2,
      order: 2,
      title:
        "你是酒店的安全检查员，晚上检查时，发现楼梯口被一个搞卫生的车堵死了。一个客房经理跑来说：'兄弟，行个方便，半小时就挪走，不然明早房间就乱套了。' 你会怎么办？",
      guide:
        "请考虑消防安全、应急疏散通道的重要性以及如何平衡工作关系和安全要求。",
      category: "scenario",
    },
    {
      id: 3,
      order: 3,
      title:
        "你是街上巡逻的片儿警。对讲机里说，附近主干道边上有栋旧楼的墙皮正往下掉，已经砸到车了，楼下人来人往很危险。别的支援还要15分钟才到，你是第一个到现场的。这15分钟里，你会怎么办？",
      guide: "请考虑公共安全、临时警戒措施、人员疏散以及与上级的沟通协调。",
      category: "scenario",
    },
    {
      id: 4,
      order: 4,
      title:
        "你是镇上网吧的店长。你发现32号机没人，屏幕上露着银行密码。你刚要处理，却看见旁边33号机的人，正偷偷拿手机拍32号的屏幕。你会怎么办？",
      guide: "请考虑客户隐私保护、安全管理、现场处理方式以及可能的违法犯罪行为。",
      category: "scenario",
    },
    {
      id: 5,
      order: 5,
      title:
        "你是工地的带班工头。拆大吊车时，你发现规定用的那根粗钢索已经磨损快断了。现场监工催你：'明天就要完工了，必须今天搞定！用几根细的捆起来先用！' 你知道这是违规的。你会怎么办？",
      guide: "请考虑施工安全、职业责任、与上级的沟通以及违规操作的风险。",
      category: "scenario",
    },
    {
      id: 6,
      order: 6,
      title:
        "你是在20层高楼外面干活的工人。你发现自己唯一的安全带挂钩有裂纹。离下班还有2小时，但天气预报说3小时后有雷暴，活儿今天必须干完。你发现同事的挂钩也差不多，但他不管，只想赶快弄完。库房也没有备用的了。你会怎么办？",
      guide: "请考虑高空作业安全、个人防护、天气因素以及与同事的协调。",
      category: "scenario",
    },
    {
      id: 7,
      order: 7,
      title:
        "2020年疫情防控期间，你是大厦的保安。一个公司的领导在30楼打急电话，让你马上送个东西上去。你跑到电梯口，门一开，里面有个乘客咳得很厉害，还没戴口罩（那时候规定必须戴）。你会怎么办？",
      guide: "请考虑疫情防控、个人健康安全、工作职责以及如何平衡紧急任务和防疫要求。",
      category: "scenario",
    },
    {
      id: 8,
      order: 8,
      title:
        "小区群里通知说：'燃气漏气已经修好了，可以回家了。' 你扶着一个急着要歇歇的老人回家，但在楼道里还是闻到一股很浓的燃气味。可你瞅见别的邻居都开门进屋了，好像没啥事。你会怎么办？",
      guide: "请考虑燃气安全、紧急情况的判断、老人安全以及与邻居的沟通。",
      category: "scenario",
    },
    {
      id: 9,
      order: 9,
      title:
        "你是工厂里的车工。机器今天有点不对劲，马上要下班了，还差最后一个没做完。开始有严重异响，但还能用。要是停下来报修，至少要等一个钟头，下班就晚了，完工绩效也可能拿不到。你会怎么办？",
      guide: "请考虑设备安全、生产安全、个人绩效与安全责任的平衡。",
      category: "scenario",
    },
    {
      id: 10,
      order: 10,
      title:
        "你是小区的物业人员。巡逻时看见有个小孩正在爬高压电箱，旁边没大人。你赶紧过去把他抱了下来。这时，小孩的奶奶冲过来骂你：'孩子玩一下怎么了？吓到我孙子你赔得起吗！' 你会怎么办？",
      guide: "请考虑儿童安全、高压电危险、与家长的沟通以及物业人员的职责。",
      category: "scenario",
    },
  ];
}

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

export async function POST(request: NextRequest) {
  try {
    const supabase = createSimpleClient();
    const body = await request.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        {
          success: false,
          error: "无效的请求数据",
          message: "请提供题目数组",
        },
        { status: 400 }
      );
    }

    const normalizedQuestions = (questions as QuestionInput[])
      .map((question, index) => {
        const order = Number(question.order ?? question.id ?? index + 1);
        const title = String(question.title ?? question.question_text ?? "").trim();
        const guide = String(question.guide ?? question.guide_text ?? "").trim();
        const category = String(question.category ?? "general");

        return {
          order,
          title,
          guide,
          category,
        };
      })
      .filter((q) => q.title && Number.isFinite(q.order));

    if (normalizedQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "无可保存题目",
          message: "题目数据为空或格式不正确",
        },
        { status: 400 }
      );
    }

    for (const question of normalizedQuestions) {
      const { data: existingRows, error: queryError } = await supabase
        .from("question_templates")
        .select("id")
        .eq("order", question.order)
        .order("updated_at", { ascending: false });

      if (queryError) {
        throw queryError;
      }

      if (existingRows && existingRows.length > 0) {
        const keepId = existingRows[0].id;

        const { error: updateError } = await supabase
          .from("question_templates")
          .update({
            question_text: question.title,
            guide_text: question.guide,
            category: question.category,
            order: question.order,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", keepId);

        if (updateError) {
          throw updateError;
        }

        if (existingRows.length > 1) {
          const duplicateIds = existingRows.slice(1).map((row) => row.id);

          const { error: deleteError } = await supabase
            .from("question_templates")
            .delete()
            .in("id", duplicateIds);

          if (deleteError) {
            throw deleteError;
          }
        }
      } else {
        const { error: insertError } = await supabase
          .from("question_templates")
          .insert({
            question_text: question.title,
            guide_text: question.guide,
            category: question.category,
            order: question.order,
            is_active: true,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          throw insertError;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "题目更新成功",
      data: {
        totalSuccessful: normalizedQuestions.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "未知错误",
        message: "题目更新失败",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}