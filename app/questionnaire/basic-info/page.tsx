"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function BasicInfoPage() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    jobType: "",
    workYears: "",
    mineArea: "",
  });

  useEffect(() => {
    const savedData = localStorage.getItem("basicInfo");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("basicInfo", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "20px 16px",
        fontFamily: "Arial, sans-serif",
        // 响应式内边距
        '@media (min-width: 640px)': {
          padding: "40px 20px",
        },
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "24px 20px",
          boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
          border: "1px solid #e5e7eb",
          // 响应式内边距
          '@media (min-width: 640px)': {
            padding: "32px 28px",
          },
          '@media (min-width: 768px)': {
            padding: "36px",
          },
        }}
      >
        <h1
          style={{
            marginTop: 0,
            color: "#111827",
            fontSize: "24px",
            lineHeight: "1.3",
            // 响应式字体
            '@media (min-width: 640px)': {
              fontSize: "28px",
            },
            '@media (min-width: 768px)': {
              fontSize: "32px",
            },
          }}
        >
          基本信息填写
        </h1>
        <p
          style={{
            color: "#6b7280",
            lineHeight: "1.6",
            marginBottom: "24px",
            fontSize: "16px",
            // 响应式字体
            '@media (min-width: 640px)': {
              lineHeight: "1.8",
              marginBottom: "28px",
              fontSize: "17px",
            },
          }}
        >
          请先填写基础信息，后续将进入安全意识问卷页面。
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr", // 手机单列
            gap: "16px",
            // 响应式网格
            '@media (min-width: 640px)': {
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
            },
            '@media (min-width: 768px)': {
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            },
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontSize: "14px",
                fontWeight: 500,
                // 响应式字体
                '@media (min-width: 640px)': {
                  fontSize: "15px",
                },
              }}
            >
              姓名
            </label>
            <input
              type="text"
              placeholder="请输入姓名"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "16px", // 手机字体稍大，便于输入
                boxSizing: "border-box",
                minHeight: "48px", // 触摸友好的高度
                // 响应式样式
                '@media (min-width: 640px)': {
                  fontSize: "15px",
                  minHeight: "44px",
                },
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#374151" }}>
              性别
            </label>
            <input
              type="text"
              placeholder="请输入性别"
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
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
            <label style={{ display: "block", marginBottom: "8px", color: "#374151" }}>
              年龄
            </label>
            <input
              type="text"
              placeholder="请输入年龄"
              value={formData.age}
              onChange={(e) => handleChange("age", e.target.value)}
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
            <label style={{ display: "block", marginBottom: "8px", color: "#374151" }}>
              工种
            </label>
            <input
              type="text"
              placeholder="请输入工种"
              value={formData.jobType}
              onChange={(e) => handleChange("jobType", e.target.value)}
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
            <label style={{ display: "block", marginBottom: "8px", color: "#374151" }}>
              工龄
            </label>
            <input
              type="text"
              placeholder="请输入工龄"
              value={formData.workYears}
              onChange={(e) => handleChange("workYears", e.target.value)}
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
            <label style={{ display: "block", marginBottom: "8px", color: "#374151" }}>
              所属矿区/单位
            </label>
            <input
              type="text"
              placeholder="请输入所属矿区或单位"
              value={formData.mineArea}
              onChange={(e) => handleChange("mineArea", e.target.value)}
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
        </div>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            // 响应式内边距
            '@media (min-width: 640px)': {
              padding: "20px",
            },
          }}
        >
          <h3
            style={{
              marginTop: 0,
              color: "#111827",
              fontSize: "16px",
              marginBottom: "12px",
              // 响应式字体
              '@media (min-width: 640px)': {
                fontSize: "18px",
              },
            }}
          >
            当前填写预览
          </h3>
          <div
            style={{
              color: "#6b7280",
              lineHeight: "1.6",
              margin: 0,
              fontSize: "14px",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "8px",
              // 响应式布局
              '@media (min-width: 640px)': {
                fontSize: "15px",
                lineHeight: "1.8",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              },
              '@media (min-width: 768px)': {
                gridTemplateColumns: "repeat(3, 1fr)",
              },
            }}
          >
            <div>姓名：{formData.name || "未填写"}</div>
            <div>性别：{formData.gender || "未填写"}</div>
            <div>年龄：{formData.age || "未填写"}</div>
            <div>工种：{formData.jobType || "未填写"}</div>
            <div>工龄：{formData.workYears || "未填写"}</div>
            <div>所属矿区/单位：{formData.mineArea || "未填写"}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
            // 响应式布局
            '@media (min-width: 640px)': {
              flexDirection: "row",
              flexWrap: "wrap",
            },
          }}
        >
          <Link href="/" style={{ width: "100%" }}>
            <button
              style={{
                backgroundColor: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: "10px",
                padding: "16px 24px",
                cursor: "pointer",
                width: "100%",
                minHeight: "48px", // 触摸友好的高度
                fontSize: "16px",
                // 响应式按钮
                '@media (min-width: 640px)': {
                  width: "auto",
                  minWidth: "120px",
                  padding: "12px 22px",
                  minHeight: "44px",
                },
              }}
            >
              返回首页
            </button>
          </Link>

          <Link href="/questionnaire/page/1" style={{ width: "100%" }}>
            <button
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "16px 24px",
                cursor: "pointer",
                width: "100%",
                minHeight: "48px",
                fontSize: "16px",
                fontWeight: 500,
                // 响应式按钮
                '@media (min-width: 640px)': {
                  width: "auto",
                  minWidth: "180px",
                  padding: "12px 22px",
                  minHeight: "44px",
                },
              }}
            >
              下一步：进入问卷第 1 页
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}