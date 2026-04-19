import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/app/lib/auth";

export async function GET(_request: NextRequest) {
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

    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("id, questionnaire_id, ai_analysis_id, report_data, report_format, generated_at")
      .order("generated_at", { ascending: false });

    if (reportsError) {
      throw reportsError;
    }

    const questionnaireIds = (reports ?? []).map((r) => r.questionnaire_id);

    let questionnaires: any[] = [];

    if (questionnaireIds.length > 0) {
      const { data: questionnairesData, error: questionnairesError } = await supabase
        .from("questionnaires")
        .select("id, user_id, status, basic_info, created_at, completed_at")
        .in("id", questionnaireIds);

      if (questionnairesError) {
        throw questionnairesError;
      }

      questionnaires = questionnairesData ?? [];
    }

    const questionnaireMap = new Map<string, any>();
    for (const questionnaire of questionnaires) {
      questionnaireMap.set(questionnaire.id, questionnaire);
    }

    const rows = (reports ?? []).map((report) => {
      const questionnaire = questionnaireMap.get(report.questionnaire_id);
      const basicInfo = questionnaire?.basic_info ?? {};
      const reportData = report.report_data ?? {};

      return {
        id: report.id,
        questionnaireId: report.questionnaire_id,
        aiAnalysisId: report.ai_analysis_id,
        reportFormat: report.report_format,
        generatedAt: report.generated_at,
        questionnaireStatus: questionnaire?.status ?? null,
        createdAt: questionnaire?.created_at ?? null,
        completedAt: questionnaire?.completed_at ?? null,
        basicInfo: {
          name: basicInfo.name ?? "",
          gender: basicInfo.gender ?? "",
          age: basicInfo.age ?? "",
          jobType: basicInfo.jobType ?? "",
          workYears: basicInfo.workYears ?? "",
          mineArea: basicInfo.mineArea ?? "",
        },
        score: reportData.score ?? null,
        safetyLevel: reportData.safetyLevel ?? null,
        awarenessType: reportData.awarenessType ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取后台报告列表失败";

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