import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../api/FeedAPIs";
import { useAuth } from "../../AuthContext";


function CreateFeed({authUser}) {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useAuth();
  console.log(user);

  


  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (!content) {
      alert("내용을 입력하세요.");
      return;
    }

  
    const feedDTO = {
      userId: user.userId,
      content: content,
    }

    const formData = new FormData();
    formData.append(
      "feedDTO",
      new Blob([JSON.stringify(feedDTO)], { type: "application/json" })
    );
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const response = await request("POST", "v1/feed/insert", formData);

      if (response.ok) {
        console.log("피드 작성 완료");
        navigate("/feed");
      } else {
        console.error("피드 작성 실패");
        // 에러 처리 로직 추가
      }
    } catch (error) {
      console.error("서버 오류:", error);
      // 에러 처리 로직 추가
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file); // 선택한 파일을 상태에 저장
    }
  };

  const handleFileRemove = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 150px)",
        backgroundColor: "#f5f5f5",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>피드 작성</h2>
        <textarea
          placeholder="내용을 입력하세요..."
          value={content}
          onChange={handleContentChange}
          style={{
            width: "100%",
            height: "150px",
            padding: "10px",
            boxSizing: "border-box",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "10px",
            resize: "none",
          }}
        ></textarea>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f9f9f9",
                marginRight: "10px",
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="미리보기"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              ) : (
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  이미지 미리보기
                </span>
              )}
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              fontSize: "14px",
              cursor: "pointer",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          {selectedFile && (
            <button
              onClick={handleFileRemove}
              style={{
                padding: "5px 22px",
                backgroundColor: "#f5f5f5",
                color: "#555",
                border: "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "auto"
              }}
            >
              파일 삭제
            </button>
          )}
          <button
            onClick={handleCancel}
            style={{
              padding: "10px 30px",
              backgroundColor: "#f5f5f5",
              color: "#555",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 30px",
              backgroundColor: "#B0C4DE",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            작성
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFeed;
