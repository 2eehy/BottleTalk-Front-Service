import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../../api/FeedAPIs";
import FeedModal from "../../components/FeedModal";
import { useAuth } from "../../AuthContext";

function Feed({ isLogin, authUser }) {
  const img_url = process.env.REACT_APP_IMG_BASE_URL;
  const [selectedFeed, setSelectedFeed] = useState("all");
  const [feeds, setFeeds] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedToDelete, setFeedToDelete] = useState(null);
  const { user } = useAuth();


  console.log(feeds);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let response;
        if (selectedFeed === "all") {
          response = await request("GET", "v1/feed");
        } else if (selectedFeed === "my") {
          response = await request("GET", `v1/feed?userId=${user?.userId}`);
        } else if (selectedFeed === "like") {
          response = await request(
            "GET",
            `v1/feed/like?userId=${user?.userId}`
          );
        }
        const data = await response.json();
        // 'like' 피드의 경우 모든 항목이 좋아요 된 상태이므로 liked를 true로 설정
        const updatedFeeds = selectedFeed === "like" 
          ? data.apiData.map(feed => ({ ...feed, liked: true }))
          : data.apiData;
        setFeeds(updatedFeeds);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };


    fetchPosts();
  }, [selectedFeed, user?.userId]);

  const handleSelectChange = (event) => {
    setSelectedFeed(event.target.value);
  };

  const handleButtonClick = () => {
    navigate("/create");
  };

  const toggleLike = async (feedId, isLiked) => {
    try {
      const feedLike = {
        feedId: feedId,
        userId: user?.userId,
        isLiked: !isLiked,
      };
      const response = await request("PUT", `v1/feed/like`, feedLike);
      const changeLike = await response.json();
      
      if (response.ok) {
        setFeeds((prevFeeds) =>
          prevFeeds.map((feed) =>
            feed.id === feedId
              ? {
                  ...feed,
                  liked: !isLiked,
                  likes: isLiked ? feed.likes - 1 : feed.likes + 1,
                }
              : feed
          )
        );

        // 좋아요 목록에서 좋아요를 취소한 경우 해당 항목 제거
        if (selectedFeed === "like" && isLiked) {
          setFeeds((prevFeeds) => prevFeeds.filter((feed) => feed.id !== feedId));
        }
      } else {
        console.error("Failed to toggle like");
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleEditClick = (feedId) => {
    navigate(`/update/${feedId}`);
  };

  const handleDeleteClick = (feedId) => {
    setFeedToDelete(feedId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (feedToDelete) {
      try {

        const feedDTO = {
          id: feedToDelete,
          reImgName: feeds?.find((feed) => feed?.id === feedToDelete)?.reImgName,
          userId: user?.userId,
        };

        console.log(feedDTO)

        const response = await request("PUT", `v1/feed/delete`, feedDTO);

        if (response.ok) {
          setFeeds((prevFeeds) =>
            prevFeeds.filter((feed) => feed?.id !== feedToDelete)
          );
          console.log("Feed marked as deleted successfully");
        } else {
          console.error("Failed to mark feed as deleted");
        }
      } catch (error) {
        console.error("Error marking feed as deleted", error);
      } finally {
        setIsModalOpen(false);
        setFeedToDelete(null);
      }
    }
  };


  return (
    <>
    {/* <div
    style={{
      backgroundColor: "#B0C4DE",
      height: "70px",
      width: "100%",
      padding: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: "10px",
      boxSizing: "border-box",
      position: "relative",
      marginTop: "-70px",
    }}
  >
    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#fff" }}>
      <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
         HOME
      </Link>
    </div>
    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
    
     
    </div>
  </div> */}
   
    <div
      style={{
        padding: "10px",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {isLogin && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <select
            value={selectedFeed}
            onChange={handleSelectChange}
            style={{
              width: "120px",
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: "#f8f8f8",
              cursor: "pointer",
            }}
          >
            <option value="all">전체피드</option>
            <option value="my">내피드</option>
            <option value="like">좋아요</option>
          </select>
          <button
            onClick={handleButtonClick}
            style={{
              padding: "5px 10px",
              backgroundColor: "#B0C4DE",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            피드작성
          </button>
        </div>
      )}

      {feeds === null || feeds?.length === 0 ? (
        <div style={{ marginTop: "20px" }}>피드가 없습니다</div>
      ) : (
        feeds?.map((feed) => (
          <div
            key={feed?.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              marginBottom: "20px",
              backgroundColor: "#fff",
            }}
          >
            <div
              style={{ padding: "10px", display: "flex", alignItems: "center" }}
            >
              <img
                src={require("../../assets/images/sinchan.png")}
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <p style={{ color: "#000", margin: 0, textAlign: "left" }}>
                  {feed?.userEmail}
                </p>
                <p
                  style={{
                    color: "#666",
                    margin: 0,
                    fontSize: "12px",
                    textAlign: "left",
                  }}
                >
                  {feed?.createdAt}
                </p>
              </div>
              {feed?.userId === user?.userId && (
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => handleEditClick(feed.id)}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#333",
                    }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteClick(feed.id)}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "red",
                    }}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
            {feed.reImgName ? (
              <img
                src={`${img_url}${feed.reImgName}`}
                style={{
                  width: "95%",
                  height: "auto",
                  borderRadius: "10px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "95%",
                  height: "auto",
                  borderRadius: "0 0 10px 10px",
                  backgroundColor: "#f0f0f0",
                  margin: "10px auto",
                }}
              />
            )}
            <div style={{ padding: "10px" }}>
              <p style={{ fontSize: "14px", color: "#333" }}>{feed.content}</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
               
               <button
                  onClick={() => toggleLike(feed.id, feed.liked)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "30px",
                  }}
                >
                  {isLogin && feed?.liked === true? "🩵" : "🤍"}
              </button>
              </div>
            </div>
          </div>
        ))
      )}

      <FeedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
    </>
  );
}

export default Feed;
