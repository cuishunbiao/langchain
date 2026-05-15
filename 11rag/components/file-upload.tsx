/**
 * FileUpload — 文件上传组件
 *
 * 功能：
 *  - 支持 .pdf / .txt / .md 三种文件类型
 *  - 使用 XMLHttpRequest（而非 fetch）以支持上传进度回调
 *  - 显示上传进度条（百分比 + 进度条动画）
 *  - 上传成功后显示已上传文件列表（文件名 + 分块数）
 *  - 错误提示
 *
 * 上传流程：
 *  1. 用户点击"上传文档"按钮 → 触发隐藏的 <input type="file">
 *  2. 选择文件后，构造 FormData，通过 XHR POST 到 /api/upload
 *  3. XHR upload.progress 事件实时更新进度条
 *  4. 上传成功后，服务端返回 { filename, chunkCount }，追加到已上传列表
 */
"use client";

import { useRef, useState } from "react";

interface UploadedFile {
  name: string;
  /** 文档被分成了多少个文本块 */
  chunkCount: number;
}

interface FileUploadProps {
  onUploaded?: (file: UploadedFile) => void;
}

export function FileUpload({ onUploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // null 表示未在上传，数字表示上传进度百分比
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 使用 XMLHttpRequest 以支持上传进度（fetch API 不支持 upload progress）
      const result = await new Promise<UploadedFile>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // 监听上传进度事件
        xhr.upload.addEventListener("progress", (evt) => {
          if (evt.lengthComputable) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        });

        // 上传完成（注意：这里的 load 是整个请求完成，包括服务端处理后的响应）
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const res = JSON.parse(xhr.responseText);
            reject(new Error(res.error || "上传失败"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("网络错误")));

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      setUploadedFiles((prev) => [...prev, result]);
      onUploaded?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setProgress(null);
      // 重置 input，允许重复上传同名文件
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 上传触发按钮（点击时触发隐藏的 file input） */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={progress !== null}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-700 dark:text-zinc-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
        上传文档
      </button>

      {/* 隐藏的文件选择器，限制接受 .pdf / .txt / .md */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 上传进度条 */}
      {progress !== null && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>上传中...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* 已上传文件列表：显示文件名 + 分块数量 */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-1">
          {uploadedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-green-500 flex-shrink-0">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              <span className="truncate max-w-[140px]" title={f.name}>{f.name}</span>
              <span className="text-zinc-400">({f.chunkCount} 块)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
