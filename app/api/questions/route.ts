import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_QUESTIONS } from "@/app/lib/questions";

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

type QuestionTemplateRow = {
  id: string;
  order: number;
  question_text: string;
  guide_text?: string | null;
  category?: string | null;
  is_active?: boolean;
};

type ApiQuestion = {
  id: number;
  dbId?: string;
  order: number;
  title: string;
  guide: string;
  category: string;
  isActive?: boolean;
};

export async function GET(request: NextRequest) {
  void request;

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

    const dedupedMap = new Map<number, QuestionTemplateRow>();

    for (const question of (questions ?? []) as QuestionTemplateRow[]) {
      if (!dedupedMap.has(question.order)) {
        dedupedMap.set(question.order, question);
      }
    }

    const formattedQuestions = Array.from(dedupedMap.values())
      .sort((a, b) => a.order - b.order)
      .map((question) => ({
        id: question.order,
        dbId: question.id,
        order: question.order,
        title: question.question_text,
        guide: question.guide_text || "",
        category: question.category || "general",
        isActive: question.is_active,
      }));

    const allQuestions =
      formattedQuestions.length >= 10 ? formattedQuestions : DEFAULT_QUESTIONS;

    return NextResponse.json({
      success: true,
      data: {
        allQuestions,
        questionsByPage: groupQuestionsByPage(allQuestions),
        totalQuestions: allQuestions.length,
        totalPages: Math.ceil(allQuestions.length / 2),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";

    return NextResponse.json(
      {
        success: false,
        error: message,
        data: {
          allQuestions: DEFAULT_QUESTIONS,
          questionsByPage: groupQuestionsByPage(DEFAULT_QUESTIONS),
          totalQuestions: DEFAULT_QUESTIONS.length,
          totalPages: Math.ceil(DEFAULT_QUESTIONS.length / 2),
          note: "使用默认题目（数据库查询失败）",
        },
        message: "数据库查询失败，使用默认题目",
      },
      { status: 200 }
    );
  }
}

function groupQuestionsByPage(questions: ApiQuestion[]) {
  const questionsByPage: Record<number, ApiQuestion[]> = {};
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
      .filter((question) => question.title && Number.isFinite(question.order));

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";

    return NextResponse.json(
      {
        success: false,
        error: message,
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
