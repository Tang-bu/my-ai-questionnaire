"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_QUESTIONS } from "@/app/lib/questions";

type QuestionItem = {
  id: number;
  title: string;
  guide: string;
};

type AnswerAnalysis = {
  isValid: boolean;
  issueType: "too_simple" | "repetitive" | "good" | "empty";
  shortMessage: string;
  detailedMessage: string;
  suggestions: string[];
};

const defaultQuestions: QuestionItem[] = [
  {
    id: 1,
    title: "你和一个不熟的人合租。你发现他正坐在沙发玩手机，旁边一个破了皮的充电器，在客厅里给一个看起很破旧的电瓶车电瓶充电。你会怎么办？",
    guide: "请考虑电气安全、火灾风险以及与合租人沟通的方式。",
  },
  {
    id: 2,
    title: "你是酒店的安全检查员，晚上检查时，发现楼梯口被一个搞卫生的车堵死了。一个客房经理跑来说：'兄弟，行个方便，半小时就挪走，不然明早房间就乱套了。' 你会怎么办？",
    guide: "请考虑消防安全、应急疏散通道的重要性以及如何平衡工作关系和安全要求。",
  },
  {
    id: 3,
    title: "你是街上巡逻的片儿警。对讲机里说，附近主干道边上有栋旧楼的墙皮正往下掉，已经砸到车了，楼下人来人往很危险。别的支援还要15分钟才到，你是第一个到现场的。这15分钟里，你会怎么办？",
    guide: "请考虑公共安全、临时警戒措施、人员疏散以及与上级的沟通协调。",
  },
  {
    id: 4,
    title: "你是镇上网吧的店长。你发现32号机没人，屏幕上露着银行密码。你刚要处理，却看见旁边33号机的人，正偷偷拿手机拍32号的屏幕。你会怎么办？",
    guide: "请考虑客户隐私保护、安全管理、现场处理方式以及可能的违法犯罪行为。",
  },
  {
    id: 5,
    title: "你是工地的带班工头。拆大吊车时，你发现规定用的那根粗钢索已经磨损快断了。现场监工催你：'明天就要完工了，必须今天搞定！用几根细的捆起来先用！' 你知道这是违规的。你会怎么办？",
    guide: "请考虑施工安全、职业责任、与上级的沟通以及违规操作的风险。",
  },
  {
    id: 6,
    title: "你是在20层高楼外面干活的工人。你发现自己唯一的安全带挂钩有裂纹。离下班还有2小时，但天气预报说3小时后有雷暴，活儿今天必须干完。你发现同事的挂钩也差不多，但他不管，只想赶快弄完。库房也没有备用的了。你会怎么办？",
    guide: "请考虑高空作业安全、个人防护、天气因素以及与同事的协调。",
  },
  {
    id: 7,
    title: "2020年疫情防控期间，你是大厦的保安。一个公司的领导在30楼打急电话，让你马上送个东西上去。你跑到电梯口，门一开，里面有个乘客咳得很厉害，还没戴口罩（那时候规定必须戴）。你会怎么办？",
    guide: "请考虑疫情防控、个人健康安全、工作职责以及如何平衡紧急任务和防疫要求。",
  },
  {
    id: 8,
    title: "小区群里通知说：'燃气漏气已经修好了，可以回家了。' 你扶着一个急着要歇歇的老人回家，但在楼道里还是闻到一股很浓的燃气味。可你瞅见别的邻居都开门进屋了，好像没啥事。你会怎么办？",
    guide: "请考虑燃气安全、紧急情况的判断、老人安全以及与邻居的沟通。",
  },
  {
    id: 9,
    title: "你是工厂里的车工。机器今天有点不对劲，马上要下班了，还差最后一个没做完。开始有严重异响，但还能用。要是停下来报修，至少要等一个钟头，下班就晚了，完工绩效也可能拿不到。你会怎么办？",
    guide: "请考虑设备安全、生产安全、个人绩效与安全责任的平衡。",
  },
  {
    id: 10,
    title: "你是小区的物业人员。巡逻时看见有个小孩正在爬高压电箱，旁边没大人。你赶紧过去把他抱了下来。这时，小孩的奶奶冲过来骂你：'孩子玩一下怎么了？吓到我孙子你赔得起吗！' 你会怎么办？",
    guide: "请考虑儿童安全、高压电危险、与家长的沟通以及物业人员的职责。",
  },
];

export default function GuidedQuestionnairePage() {
  void defaultQuestions;

  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<number, AnswerAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const analyzeTimeoutRef = useRef<Record<number, NodeJS.Timeout>>({});

  const totalPages = 5;
  const questionsPerPage = 2;

  useEffect(() => {
    const savedQuestions = null;
    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions);
        if (parsedQuestions.length >= 10) {
          setQuestions(parsedQuestions.slice(0, 10));
        }
      } catch (error) {
        console.error("加载题目失败:", error);
      }
    }

    const savedAnswers = localStorage.getItem("questionnaireAllAnswers");
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (error) {
        console.error("加载答案失败:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("questionnaireAllAnswers", JSON.stringify(answers));
  }, [answers]);

  const currentQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const analyzeAnswer = async (questionId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const answer = answers[`question${questionId}`] || "";

    if (!answer.trim()) {
      setAnalysisResults((prev) => ({
        ...prev,
        [questionId]: {
          isValid: false,
          issueType: "empty",
          shortMessage: "请填写回答",
          detailedMessage: "请输入你的回答后再继续",
          suggestions: [],
        },
      }));
      return;
    }

    setIsAnalyzing((prev) => ({ ...prev, [questionId]: true }));

    try {
      if (isAiEnabled) {
        const response = await fetch("/api/ai/analyze-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId: question.id,
            questionTitle: question.title,
            questionGuide: question.guide,
            answer: answer,
            allAnswers: answers,
          }),
        });

        const json = await response.json();

        if (json.success && json.data) {
          setAnalysisResults((prev) => ({
            ...prev,
            [questionId]: json.data,
          }));
          setIsAnalyzing((prev) => ({ ...prev, [questionId]: false }));
          return;
        }
      }

      const simpleAnalysis = simpleCheckAnswer(answer, questionId, answers);
      setAnalysisResults((prev) => ({
        ...prev,
        [questionId]: simpleAnalysis,
      }));
    } catch (error) {
      console.error("分析答案失败:", error);
      const simpleAnalysis = simpleCheckAnswer(answer, questionId, answers);
      setAnalysisResults((prev) => ({
        ...prev,
        [questionId]: simpleAnalysis,
      }));
    } finally {
      setIsAnalyzing((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const simpleCheckAnswer = (
    answer: string,
    questionId: number,
    allAnswers: Record<string, string>
  ): AnswerAnalysis => {
    const trimmedAnswer = answer.trim();

    if (trimmedAnswer.length < 20) {
      return {
        isValid: false,
        issueType: "too_simple",
        shortMessage: `第${questionId}题回答过于简单`,
        detailedMessage: "建议详细描述你的具体行动步骤，包括如何处理当前情况、考虑哪些安全因素等。",
        suggestions: [
          "补充具体的行动步骤",
          "说明你会如何处理这个情况",
          "描述考虑到的安全因素",
        ],
      };
    }

    const repetitivePatterns = [
      /^(还行|可以|还好|差不多|无所谓|随便|不知道|没想过|看情况)$/,
      /^(会|不会|可能|应该|大概)$/,
      /^(注意|小心|小心点|注意点)$/,
    ];

    for (const pattern of repetitivePatterns) {
      if (pattern.test(trimmedAnswer)) {
        return {
          isValid: false,
          issueType: "too_simple",
          shortMessage: `第${questionId}题回答过于简单`,
          detailedMessage: "请具体说明你会采取哪些行动，以及为什么这样做。",
          suggestions: [
            "详细描述你的行动步骤",
            "说明你这样做的原因",
            "考虑可能的安全风险",
          ],
        };
      }
    }

    const chineseChars = trimmedAnswer.replace(/[^\u4e00-\u9fa5]/g, "");
    const uniqueChars = new Set(chineseChars).size;
    const repetitionRatio = chineseChars.length > 0 ? uniqueChars / chineseChars.length : 1;

    if (repetitionRatio < 0.3 && chineseChars.length > 20) {
      return {
        isValid: false,
        issueType: "repetitive",
        shortMessage: `第${questionId}题存在重复内容`,
        detailedMessage: "请从不同角度思考问题，描述更多不同的方面。",
        suggestions: [
          "避免重复相同的表述",
          "从不同角度描述你的做法",
          "考虑更多的安全因素",
        ],
      };
    }

    const currentAnswerLower = trimmedAnswer.toLowerCase();
    let repeatCount = 0;
    for (const [key, prevAnswer] of Object.entries(allAnswers)) {
      if (key === `question${questionId}`) continue;
      const prevAnswerLower = prevAnswer.toLowerCase();
      if (
        currentAnswerLower.includes(prevAnswerLower) ||
        (prevAnswerLower.length > 10 && currentAnswerLower.includes(prevAnswerLower))
      ) {
        repeatCount++;
      }
    }

    if (repeatCount >= 2) {
      return {
        isValid: false,
        issueType: "repetitive",
        shortMessage: `第${questionId}题回答与之前重复`,
        detailedMessage: "每个问题都有不同的情境，请针对本题提供独特的思考。",
        suggestions: [
          "从本题的具体情境出发",
          "避免套用之前的回答模式",
          "关注本题独特的安全要点",
        ],
      };
    }

    const actionWords = ["会", "应该", "要", "先", "然后", "接着", "最后", "如果", "因为", "所以"];
    const hasAction = actionWords.some((word) => trimmedAnswer.includes(word));

    if (!hasAction && trimmedAnswer.length > 30) {
      return {
        isValid: false,
        issueType: "too_simple",
        shortMessage: `第${questionId}题建议补充行动步骤`,
        detailedMessage: "请描述你的具体行动步骤和决策过程。",
        suggestions: [
          "说明你会先做什么",
          "描述你的具体做法",
          "解释你这样做的理由",
        ],
      };
    }

    return {
      isValid: true,
      issueType: "good",
      shortMessage: "回答良好",
      detailedMessage: "本题回答完整，继续保持！",
      suggestions: [],
    };
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [`question${questionId}`]: value,
    }));

    if (analyzeTimeoutRef.current[questionId]) {
      clearTimeout(analyzeTimeoutRef.current[questionId]);
    }

    analyzeTimeoutRef.current[questionId] = setTimeout(() => {
      analyzeAnswer(questionId);
    }, 1000);
  };

  const allQuestionsValid = currentQuestions.every((q) => {
    const result = analysisResults[q.id];
    return result?.isValid === true;
  });

  const allQuestionsAnswered = questions.every(
    (q) => answers[`question${q.id}`]?.trim().length > 0
  );

  const startVoiceInput = (questionId: number) => {
    if (
      typeof window === "undefined" ||
      (!("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window))
    ) {
      alert("您的浏览器不支持语音输入功能");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";

    recognition.onstart = () => {
      setIsRecording(true);
      setActiveVoiceField(`question${questionId}`);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      handleAnswerChange(questionId, transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setActiveVoiceField(null);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setActiveVoiceField(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setActiveVoiceField(null);
    }
  };

  const handleSubmit = () => {
    if (!allQuestionsAnswered) {
      alert("请回答所有问题后再提交！");
      return;
    }

    setIsSubmitting(true);
    router.push("/questionnaire/confirm");
  };

  const pageIndicator = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            backgroundColor: "#1e3a8a",
            color: "#ffffff",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "20px",
            boxShadow: "0 8px 24px rgba(30, 58, 138, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
                安全意识情境问卷
              </h1>
              <p style={{ margin: "6px 0 0", opacity: 0.9, fontSize: "14px" }}>
                第 {currentPage} / {totalPages} 页 · 共 {questions.length} 题
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                {pageIndicator.map((page) => (
                  <div
                    key={page}
                    style={{
                      width: page === currentPage ? "28px" : "10px",
                      height: "10px",
                      borderRadius: "5px",
                      backgroundColor:
                        page === currentPage
                          ? "#ffffff"
                          : page < currentPage
                          ? "#60a5fa"
                          : "#3b82f680",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setIsAiEnabled(!isAiEnabled)}
                style={{
                  backgroundColor: isAiEnabled ? "#10b981" : "#6b7280",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                AI {isAiEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>

        <div>
          {currentQuestions.map((question) => {
            const answer = answers[`question${question.id}`] || "";
            const analysis = analysisResults[question.id];
            const isAnalyzingThis = isAnalyzing[question.id];
            const isAnswerValid = analysis?.isValid === true;
            const isAnswerProvided = answer.trim().length > 0;

            return (
              <div
                key={question.id}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "16px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    {question.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: 0,
                        color: "#111827",
                        fontSize: "17px",
                        lineHeight: "1.6",
                      }}
                    >
                      {question.title}
                    </h3>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        marginTop: "8px",
                      }}
                    >
                      💡 {question.guide}
                    </p>
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <textarea
                    placeholder="请输入你的回答...（支持语音输入）"
                    value={answer}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    style={{
                      width: "100%",
                      minHeight: "120px",
                      padding: "16px",
                      paddingRight: "50px",
                      borderRadius: "12px",
                      border: isAnswerValid
                        ? "2px solid #10b981"
                        : isAnswerProvided
                        ? "2px solid #ef4444"
                        : "2px solid #d1d5db",
                      fontSize: "15px",
                      resize: "vertical",
                      boxSizing: "border-box",
                      lineHeight: "1.6",
                      transition: "border-color 0.2s",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      isRecording && activeVoiceField === `question${question.id}`
                        ? stopVoiceInput()
                        : startVoiceInput(question.id)
                    }
                    style={{
                      position: "absolute",
                      right: "12px",
                      bottom: "12px",
                      backgroundColor:
                        isRecording && activeVoiceField === `question${question.id}`
                          ? "#ef4444"
                          : "#f3f4f6",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    {isRecording &&
                    activeVoiceField === `question${question.id}` ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#ffffff"
                      >
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#6b7280"
                      >
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z" />
                      </svg>
                    )}
                  </button>
                </div>

                {isAnalyzingThis && (
                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: "13px",
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid #6b7280",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <span>AI分析中...</span>
                  </div>
                )}

                {answer && !isAnalyzingThis && analysis && (
                  <div
                    style={{
                      color: isAnswerValid ? "#10b981" : "#ef4444",
                      fontSize: "13px",
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>{isAnswerValid ? "✓" : "!"}</span>
                    <span>
                      {isAnswerValid
                        ? `回答良好 · ${answer.length}字符`
                        : `${analysis.shortMessage} · ${answer.length}字符`}
                    </span>
                  </div>
                )}

                {isAnswerProvided && !isAnswerValid && analysis && !isAnalyzingThis && (
                  <div
                    style={{
                      backgroundColor:
                        analysis.issueType === "repetitive"
                          ? "#fef3c7"
                          : "#fef2f2",
                      border:
                        analysis.issueType === "repetitive"
                          ? "1px solid #fbbf24"
                          : "1px solid #fecaca",
                      borderRadius: "10px",
                      padding: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={
                          analysis.issueType === "repetitive"
                            ? "#f59e0b"
                            : "#dc2626"
                        }
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      <div>
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: "14px",
                            fontWeight: 500,
                            color:
                              analysis.issueType === "repetitive"
                                ? "#92400e"
                                : "#b91c1c",
                          }}
                        >
                          {analysis.detailedMessage}
                        </p>
                        {analysis.suggestions.length > 0 && (
                          <ul
                            style={{
                              margin: "8px 0 0",
                              paddingLeft: "16px",
                              fontSize: "13px",
                              color:
                                analysis.issueType === "repetitive"
                                  ? "#78350f"
                                  : "#dc2626",
                              lineHeight: 1.6,
                            }}
                          >
                            {analysis.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            {currentPage > 1 ? (
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              >
                ← 上一页
              </button>
            ) : (
              <Link href="/questionnaire/basic-info">
                <button
                  style={{
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    padding: "12px 24px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 500,
                  }}
                >
                  ← 返回基本信息
                </button>
              </Link>
            )}

            {currentPage < totalPages ? (
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!allQuestionsValid}
                style={{
                  backgroundColor: allQuestionsValid ? "#2563eb" : "#9ca3af",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  cursor: allQuestionsValid ? "pointer" : "not-allowed",
                  fontSize: "15px",
                  fontWeight: 600,
                  opacity: allQuestionsValid ? 1 : 0.7,
                }}
              >
                下一页 →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsValid || isSubmitting}
                style={{
                  backgroundColor: allQuestionsValid ? "#10b981" : "#9ca3af",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  cursor: allQuestionsValid ? "pointer" : "not-allowed",
                  fontSize: "15px",
                  fontWeight: 600,
                  opacity: allQuestionsValid ? 1 : 0.7,
                }}
              >
                {isSubmitting ? "提交中..." : "提交问卷"}
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
          }}
        >
          <h4
            style={{
              margin: "0 0 8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1e40af",
            }}
          >
            💡 AI智能分析说明
          </h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              fontSize: "13px",
              color: "#1e40af",
              lineHeight: 1.8,
            }}
          >
            <li>AI助理会自动分析你的回答质量（需配置 SILICONFLOW_API_KEY）</li>
            <li>识别过于简单或重复的回答，并提供针对性建议</li>
            <li>确保回答完整有效后才能进入下一题</li>
            <li>不改变你的原始思路，只提供建设性建议</li>
            <li>如需关闭AI分析，可点击右上角 "AI OFF" 按钮</li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
