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

    const { data: questionnaires, error: questionnairesError } = await supabase
      .from("questionnaires")
      .select("id, user_id, status, basic_info, created_at, completed_at")
      .order("created_at", { ascending: false });

    if (questionnairesError) {
      throw questionnairesError;
    }

    const questionnaireIds = (questionnaires ?? []).map((q) => q.id);

    let reports: any[] = [];
    let tasks: any[] = [];

    if (questionnaireIds.length > 0) {
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("id, questionnaire_id, generated_at, report_data")
        .in("questionnaire_id", questionnaireIds)
        .order("generated_at", { ascending: false });

      if (reportsError) {
        throw reportsError;
      }

      reports = reportsData ?? [];

      const { data: tasksData, error: tasksError } = await supabase
        .from("ai_analysis_tasks")
        .select("id, questionnaire_id, status, updated_at, error_message")
        .in("questionnaire_id", questionnaireIds)
        .order("updated_at", { ascending: false });

      if (tasksError) {
        throw tasksError;
      }

      tasks = tasksData ?? [];
    }

    const latestReportMap = new Map<string, any>();
    for (const report of reports) {
      if (!latestReportMap.has(report.questionnaire_id)) {
        latestReportMap.set(report.questionnaire_id, report);
      }
    }

    const latestTaskMap = new Map<string, any>();
    for (const task of tasks) {
      if (!latestTaskMap.has(task.questionnaire_id)) {
        latestTaskMap.set(task.questionnaire_id, task);
      }
    }

    const rows = (questionnaires ?? []).map((questionnaire) => {
      const basicInfo = questionnaire.basic_info ?? {};
      const latestReport = latestReportMap.get(questionnaire.id);
      const latestTask = latestTaskMap.get(questionnaire.id);
      const reportData = latestReport?.report_data ?? {};

      return {
        id: questionnaire.id,
        userId: questionnaire.user_id,
        status: questionnaire.status,
        createdAt: questionnaire.created_at,
        completedAt: questionnaire.completed_at,
        basicInfo: {
          name: basicInfo.name ?? "",
          gender: basicInfo.gender ?? "",
          age: basicInfo.age ?? "",
          jobType: basicInfo.jobType ?? "",
          workYears: basicInfo.workYears ?? "",
          mineArea: basicInfo.mineArea ?? "",
        },
        latestTask: latestTask
          ? {
              id: latestTask.id,
              status: latestTask.status,
              updatedAt: latestTask.updated_at,
              errorMessage: latestTask.error_message,
            }
          : null,
        latestReport: latestReport
          ? {
              id: latestReport.id,
              generatedAt: latestReport.generated_at,
              score: reportData.score ?? null,
              safetyLevel: reportData.safetyLevel ?? null,
              awarenessType: reportData.awarenessType ?? null,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "读取后台问卷列表失败";

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