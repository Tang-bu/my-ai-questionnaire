"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type QuestionItem = {
  id: number;
  title: string;
  guide: string;
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

export default function AdminQuestionnairesPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 从API加载题目
  const loadQuestionsFromAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions');
      const data = await response.json();

      if (data.success && data.data.allQuestions.length > 0) {
        // 将API数据转换为前端格式
        const apiQuestions = data.data.allQuestions.map((q: any) => ({
          id: q.id || q.order,
          title: q.title || q.question_text,
          guide: q.guide || q.guide_text || '',
        }));
        console.log('从API加载题目成功:', apiQuestions.length, '个题目');
        setQuestions(apiQuestions);
        // 同时保存到localStorage作为缓存
        localStorage.setItem("adminQuestions", JSON.stringify(apiQuestions));
      } else {
        // API返回失败或无数据，从localStorage加载
        const savedQuestions = localStorage.getItem("adminQuestions");
        if (savedQuestions) {
          try {
            const parsed = JSON.parse(savedQuestions);
            console.log('从localStorage加载问卷题目:', parsed.length, '个题目');
            setQuestions(parsed);
          } catch (error) {
            console.error('解析问卷题目失败:', error);
          }
        }
      }
    } catch (error) {
      console.error('从API加载题目失败:', error);
      // 回退到localStorage
      const savedQuestions = localStorage.getItem("adminQuestions");
      if (savedQuestions) {
        try {
          const parsed = JSON.parse(savedQuestions);
          console.log('从localStorage加载问卷题目(回退):', parsed.length, '个题目');
          setQuestions(parsed);
        } catch (error) {
          console.error('解析问卷题目失败:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionsFromAPI();
  }, []);

  // 清除本地存储并重新加载
  const handleClearLocalData = () => {
    if (confirm("确定要清除本地存储的题目数据吗？这将从服务器重新加载最新题目。")) {
      localStorage.removeItem("adminQuestions");
      console.log("已清除本地存储的题目数据");
      loadQuestionsFromAPI();
      alert("本地数据已清除，正在从服务器重新加载题目");
    }
  };

  // 保存题目到后端API
  const saveQuestionsToAPI = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      setSaveError(null);

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage(`题目保存成功！成功更新了 ${data.data.totalSuccessful} 个题目。`);
        // 同时更新localStorage
        localStorage.setItem("adminQuestions", JSON.stringify(questions));
        console.log('题目已保存到API和localStorage');
      } else {
        setSaveError(`保存失败: ${data.error || data.message || '未知错误'}`);
        console.error('API保存失败:', data);
      }
    } catch (error: any) {
      setSaveError(`保存失败: ${error.message || '网络错误'}`);
      console.error('保存题目到API失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 自动保存到localStorage（作为草稿）
  useEffect(() => {
    localStorage.setItem("adminQuestions", JSON.stringify(questions));
  }, [questions]);

  const handleChange = (
    id: number,
    field: "title" | "guide",
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleResetQuestions = () => {
    // 重置为默认题目
    setQuestions(defaultQuestions);
  };

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
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
          }}
        >
          <h1 style={{ marginTop: 0, color: "#111827" }}>问卷管理</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: 0 }}>
            这里用于维护问卷题目和提示语。当前修改会自动保存在浏览器本地作为草稿。
            请使用 <strong>"保存到后端"</strong> 按钮将题目同步到服务器数据库。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {questions.map((question) => (
            <div
              key={question.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                padding: "24px",
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
                题目 {question.id}
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#374151",
                    }}
                  >
                    题目标题
                  </label>
                  <input
                    type="text"
                    value={question.title}
                    onChange={(e) =>
                      handleChange(question.id, "title", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#374151",
                    }}
                  >
                    提示语
                  </label>
                  <textarea
                    value={question.guide}
                    onChange={(e) =>
                      handleChange(question.id, "guide", e.target.value)
                    }
                    style={{
                      width: "100%",
                      minHeight: "90px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "15px",
                      lineHeight: "1.8",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 保存状态消息 */}
        {saveMessage && (
          <div style={{
            backgroundColor: "#d1fae5",
            color: "#065f46",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #a7f3d0",
            marginTop: "16px"
          }}>
            ✅ {saveMessage}
          </div>
        )}

        {saveError && (
          <div style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #fecaca",
            marginTop: "16px"
          }}>
            ❌ {saveError}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={saveQuestionsToAPI}
            disabled={saving || loading}
            style={{
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 22px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {saving ? "保存中..." : "✅ 保存到后端"}
          </button>

          <button
            onClick={loadQuestionsFromAPI}
            disabled={loading}
            style={{
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 22px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "加载中..." : "🔄 重新加载"}
          </button>

          <button
            onClick={handleResetQuestions}
            style={{
              backgroundColor: "#e5e7eb",
              color: "#111827",
              border: "none",
              borderRadius: "10px",
              padding: "12px 22px",
              cursor: "pointer",
            }}
          >
            恢复默认题目
          </button>

          <button
            onClick={handleClearLocalData}
            style={{
              backgroundColor: "#fca5a5",
              color: "#7f1d1d",
              border: "none",
              borderRadius: "10px",
              padding: "12px 22px",
              cursor: "pointer",
            }}
          >
            🗑️ 清除本地数据
          </button>

          <Link href="/admin">
            <button
              style={{
                backgroundColor: "#111827",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                cursor: "pointer",
              }}
            >
              返回后台首页
            </button>
          </Link>
        </div>

        <div style={{
          marginTop: "20px",
          color: "#6b7280",
          fontSize: "14px",
          lineHeight: "1.6"
        }}>
          <p><strong>说明：</strong></p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li><strong>✅ 保存到后端</strong>：将题目保存到服务器数据库，所有用户都能看到更新</li>
            <li><strong>🔄 重新加载</strong>：从服务器重新加载最新题目</li>
            <li><strong>恢复默认题目</strong>：恢复为内置的默认题目（仅限当前浏览器）</li>
            <li><strong>🗑️ 清除本地数据</strong>：清除浏览器存储的旧题目，重新从服务器加载</li>
            <li>修改题目时会自动保存到浏览器本地作为草稿</li>
          </ul>
        </div>
      </div>
    </main>
  );
}