import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/app/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const authContext = await getAuthenticatedContext();

    if (!authContext) {
      return NextResponse.json(
        {
          success: false,
          error: "未授权访问",
          message: "请先登录",
        },
        { status: 401 }
      );
    }

    const { supabase, role } = authContext;

    if (role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "无权访问",
          message: "仅管理员可访问",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const { data: questionnaire, error: questionnaireError } = await supabase
      .from("questionnaires")
      .select("*")
      .eq("id", id)
      .single();

    if (questionnaireError || !questionnaire) {
      return NextResponse.json(
        {
          success: false,
          error: "问卷不存在",
          message: "未找到该问卷",
        },
        { status: 404 }
      );
    }

    const { data: tasks, error: tasksError } = await supabase
      .from("ai_analysis_tasks")
      .select("*")
      .eq("questionnaire_id", id)
      .order("updated_at", { ascending: false });

    if (tasksError) {
      throw tasksError;
    }

    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .eq("questionnaire_id", id)
      .order("generated_at", { ascending: false });

    if (reportsError) {
      throw reportsError;
    }

    return NextResponse.json({
      success: true,
      data: {
        questionnaire,
        tasks: tasks ?? [],
        reports: reports ?? [],
        latestTask: tasks?.[0] ?? null,
        latestReport: reports?.[0] ?? null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "读取后台问卷详情失败";

    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        message,
      },
      { status: 500 }
    );
  }
}