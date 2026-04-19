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

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        {
          success: false,
          error: "报告不存在",
          message: "未找到该报告",
        },
        { status: 404 }
      );
    }

    const { data: questionnaire, error: questionnaireError } = await supabase
      .from("questionnaires")
      .select("*")
      .eq("id", report.questionnaire_id)
      .single();

    if (questionnaireError || !questionnaire) {
      return NextResponse.json(
        {
          success: false,
          error: "问卷不存在",
          message: "未找到该报告对应问卷",
        },
        { status: 404 }
      );
    }

    const { data: task, error: taskError } = await supabase
      .from("ai_analysis_tasks")
      .select("*")
      .eq("id", report.ai_analysis_id)
      .maybeSingle();

    if (taskError) {
      throw taskError;
    }

    return NextResponse.json({
      success: true,
      data: {
        report,
        questionnaire,
        task: task ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取后台报告详情失败";

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