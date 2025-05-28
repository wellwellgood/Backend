const express = require("express");
const pool = require("../DB.js");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // 업로드 디렉토리 설정

// ✅ 메시지 저장 (텍스트 + 파일 지원)
router.post("/", upload.single("file"), async (req, res) => {
  const { sender_username, receiver_username, sender_name, receiver_name, content } = req.body;

  // 파일 존재 시
  const file = req.file ? req.file.filename : null;

  if (!sender_username || !receiver_username || !sender_name) {
    return res.status(400).json({ message: "필수 정보 누락" });
  }

  let client;
  try {
    client = await pool.connect();
    const time = new Date().toISOString();

    await client.query(
      `INSERT INTO messages (sender_username, receiver_username, sender_name, receiver_name, content, file, time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sender_username, receiver_username, sender_name, receiver_name, content || "", file, time]
    );

    res.status(201).json({
      message: "메시지 저장 완료",
      content,
      file,
      sender_username,
      receiver_username,
      sender_name,
      receiver_name,
      time
    });
  } catch (err) {
    console.error("❌ 메시지 저장 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  } finally {
    if (client) client.release();
  }
});
