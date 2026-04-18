"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type QuestionItem = {
  id: number;
  title: string;
  guide: string;
};

// 默认的10个问题（可以根据管理员的修改更新）
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

export default function SinglePageQuestionnaire() {
  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // 从localStorage加载保存的题目和答案
  useEffect(() => {
    // 从API或localStorage加载题目
    const savedQuestions = localStorage.getItem("adminQuestions");
    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions);
        if (parsedQuestions.length >= 10) {
          setQuestions(parsedQuestions.slice(0, 10)); // 只取前10个题目
        }
      } catch (error) {
        console.error("加载题目失败:", error);
      }
    }

    // 加载之前保存的答案
    const savedAnswers = localStorage.getItem("questionnaireAllAnswers");
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (error) {
        console.error("加载答案失败:", error);
      }
    }

    setLoading(false);
  }, []);

  // 保存答案到localStorage
  useEffect(() => {
    localStorage.setItem("questionnaireAllAnswers", JSON.stringify(answers));
  }, [answers]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [`question${questionId}`]: value,
    }));
  };

  // 检查是否所有问题都已回答（至少有一些内容）
  const allAnswered = () => {
    return questions.every(
      (question) =>
        answers[`question${question.id}`] &&
        answers[`question${question.id}`].trim().length > 0
    );
  };

  // 提交问卷
  const handleSubmit = () => {
    if (!allAnswered()) {
      alert("请回答所有问题后再提交！");
      return;
    }

    // 这里可以添加提交到API的逻辑
    console.log("提交问卷答案:", answers);
    alert("问卷提交成功！");

    // 跳转到结果页面或确认页面
    window.location.href = "/questionnaire/confirm";
  };

  // 清空所有答案
  const handleClearAll = () => {
    if (confirm("确定要清空所有答案吗？")) {
      setAnswers({});
      localStorage.removeItem("questionnaireAllAnswers");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
        加载中...
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* 标题区域 */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#dbeafe",
              color: "#1d4ed8",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            安全意识问卷 · 单页版
          </div>

          <h1 style={{ margin: 0, color: "#111827", fontSize: "28px" }}>
            安全意识评估问卷
          </h1>
          <p style={{ color: "#6b7280", lineHeight: "1.8", marginTop: "10px" }}>
            请仔细阅读每个问题，并在下方的文本框中填写您的回答。
            所有问题都是必填项，请确保完整填写后再提交。
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                backgroundColor: "#f0f9ff",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#0369a1",
              }}
            >
              📝 共 {questions.length} 个问题
            </div>
            <div
              style={{
                backgroundColor: allAnswered()
                  ? "#d1fae5"
                  : "#fef3c7",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                color: allAnswered()
                  ? "#065f46"
                  : "#92400e",
              }}
            >
              {allAnswered()
                ? "✅ 所有问题已回答"
                : "⚠️ 还有问题未回答"}
            </div>
          </div>
        </div>

        {/* 主问卷框 - 包含所有问题和答案 */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "36px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "28px",
            }}
          >
            {questions.map((question, index) => (
              <div
                key={question.id}
                style={{
                  borderBottom: index < questions.length - 1 ? "1px solid #e5e7eb" : "none",
                  paddingBottom: index < questions.length - 1 ? "28px" : "0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "#ffffff",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
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
                        fontSize: "18px",
                        lineHeight: "1.6",
                      }}
                    >
                      {question.title}
                    </h3>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        marginTop: "6px",
                      }}
                    >
                      💡 {question.guide}
                    </p>
                  </div>
                </div>

                <div style={{ marginLeft: "48px" }}>
                  <textarea
                    placeholder="请在这里输入你的回答..."
                    value={answers[`question${question.id}`] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    style={{
                      width: "100%",
                      minHeight: "120px",
                      padding: "16px",
                      borderRadius: "12px",
                      border: answers[`question${question.id}`]
                        ? "2px solid #10b981"
                        : "2px solid #d1d5db",
                      fontSize: "15px",
                      resize: "vertical",
                      boxSizing: "border-box",
                      lineHeight: "1.6",
                      transition: "border-color 0.2s",
                    }}
                  />
                  {answers[`question${question.id}`] && (
                    <div
                      style={{
                        color: "#10b981",
                        fontSize: "13px",
                        marginTop: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>✓</span>
                      <span>
                        已填写{" "}
                        {answers[`question${question.id}`].length} 个字符
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮区域 */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleClearAll}
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "14px 28px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e5e7eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#f3f4f6")
              }
            >
              🗑️ 清空所有答案
            </button>

            <button
              onClick={handleSubmit}
              disabled={!allAnswered()}
              style={{
                backgroundColor: allAnswered() ? "#10b981" : "#9ca3af",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "14px 28px",
                cursor: allAnswered() ? "pointer" : "not-allowed",
                fontSize: "16px",
                fontWeight: 600,
                transition: "all 0.2s",
                opacity: allAnswered() ? 1 : 0.7,
              }}
              onMouseEnter={(e) => {
                if (allAnswered()) {
                  e.currentTarget.style.backgroundColor = "#059669";
                }
              }}
              onMouseLeave={(e) => {
                if (allAnswered()) {
                  e.currentTarget.style.backgroundColor = "#10b981";
                }
              }}
            >
              {allAnswered() ? "✅ 提交问卷" : "请完成所有问题"}
            </button>

            <Link href="/questionnaire/confirm">
              <button
                style={{
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px 28px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2563eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3b82f6")
                }
              >
                📋 查看确认页面
              </button>
            </Link>
          </div>

          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            <p>
              <strong>注意：</strong>您的答案会自动保存在浏览器中，即使关闭页面也不会丢失。
              请确保完成所有问题后再提交。
            </p>
          </div>
        </div>

        {/* 底部导航 */}
        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link
              href="/"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              ← 返回首页
            </Link>
            <Link
              href="/questionnaire/basic-info"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              填写基本信息 →
            </Link>
          </div>
          <p style={{ marginTop: "12px" }}>
            © 2024 矿工安全意识评估平台. 保护矿工安全，我们在行动。
          </p>
        </div>
      </div>
    </main>
  );
}