// --- ตั้งค่ารายการคำถามและรูปภาพของคุณตรงนี้ ---
// เพิ่ม object เข้าไปใน array นี้ได้เรื่อยๆ
// ใส่ URL รูปภาพที่ถูกต้องที่คุณอัปโหลดไว้
const questions = [
  {
    question: "ทายใจ! ชอบอะไรมากกว่ากัน?",
    choice1: { text: "กล้วย", image: "https://i.imgur.com/UDz2EMm.png" }, // <--- ใส่ URL รูปกล้วย
    choice2: { text: "ส้ม", image: "https://i.imgur.com/RFnOnfS.png" }      // <--- ใส่ URL รูปส้ม
  },
  /*{
    question: "เลือกเลย! ทะเล หรือ ภูเขา?",
    choice1: { text: "ทะเล", image: "URL_ของรูปทะเล" }, // <--- ใส่ URL รูปทะเล
    choice2: { text: "ภูเขา", image: "URL_ของรูปภูเขา" } // <--- ใส่ URL รูปภูเขา
  }, */
  // --- เพิ่มคำถามอื่นๆ ที่นี่ ---
  // {
  //   question: "คำถามต่อไป?",
  //   choice1: { text: "ตัวเลือก 1", image: "URL_รูป1" },
  //   choice2: { text: "ตัวเลือก 2", image: "URL_รูป2" }
  // }
];

// --- ตัวแปรสำหรับการทำงานของ Widget ---
let alertTimeout; // สำหรับเก็บ timeout ID ของการแสดงผล
let timerInterval; // สำหรับเก็บ interval ID ของตัวนับเวลา
let widgetAlertDuration = 30000; // ค่าเริ่มต้น (30 วินาที) สำหรับการแสดงผลทั้งหมด
let votingDuration = 20000; // ค่าเริ่มต้น (20 วินาที) สำหรับการโหวต
let rewardName = "เกมทายใจ"; // ชื่อรางวัล Channel Points ที่ใช้

// --- ตัวแปรสำหรับการนับคะแนนโหวต ---
let isVotingActive = false; // สถานะการโหวต
let currentVotes = { choice1: 0, choice2: 0 }; // คะแนนโหวตปัจจุบัน
let votersList = new Set(); // รายชื่อผู้โหวตเพื่อป้องกันการโหวตซ้ำ
let currentQuestion = null; // คำถามปัจจุบัน

// --- ฟังก์ชันแสดงคำถามและเริ่มการโหวต ---
function showQuestion(data) {
  console.log('showQuestion called with data:', data);
  
  // --- รีเซ็ตค่าต่างๆ สำหรับการโหวตใหม่ ---
  resetVoting();
  
  // --- สุ่มเลือกคำถาม ---
  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];
  console.log('Selected question:', currentQuestion);

  // --- อัปเดตข้อมูลผู้แลกรางวัล ---
  document.getElementById('redeemer-name').innerText = data.name;
  document.getElementById('reward-name').innerText = rewardName;

  // --- อัปเดตข้อความคำถามและรูปภาพ ---
  document.getElementById('question-text').innerText = currentQuestion.question;
  document.getElementById('image-1').src = currentQuestion.choice1.image;
  document.getElementById('image-1').alt = currentQuestion.choice1.text;
  document.getElementById('choice-1-text').innerText = currentQuestion.choice1.text;

  document.getElementById('image-2').src = currentQuestion.choice2.image;
  document.getElementById('image-2').alt = currentQuestion.choice2.text;
  document.getElementById('choice-2-text').innerText = currentQuestion.choice2.text;

  // --- ซ่อนผลลัพธ์ (ถ้ามี) ---
  document.getElementById('result-container').classList.add('hidden');

  // --- แสดง Alert ---
  const container = document.getElementById('alert-container');
  console.log('Showing alert container');
  container.classList.remove('hidden');
  container.classList.add('visible');

  // --- เริ่มการโหวต ---
  startVoting();

  // --- ตั้งเวลาซ่อน Alert หลังจากหมดเวลาทั้งหมด ---
  clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => {
    console.log('Hiding alert container (removing visible)');
    container.classList.remove('visible');
    // รอ animation จบก่อนซ่อนจริง
    setTimeout(() => {
      console.log('Hiding alert container (adding hidden)');
      container.classList.add('hidden');
      resetVoting(); // รีเซ็ตการโหวตเมื่อซ่อน
    }, 500); // รอ 0.5 วินาทีให้ fade out จบ
  }, widgetAlertDuration);
}

// --- ฟังก์ชันเริ่มการโหวต ---
function startVoting() {
  isVotingActive = true;
  votersList.clear();
  currentVotes = { choice1: 0, choice2: 0 };
  updateVoteCounts();
  
  // --- เริ่มตัวนับเวลาถอยหลัง ---
  let timeLeft = votingDuration / 1000; // แปลงเป็นวินาที
  document.getElementById('timer').innerText = timeLeft;
  
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').innerText = timeLeft;
    
    if (timeLeft <= 0) {
      endVoting();
    }
  }, 1000);
}

// --- ฟังก์ชันจบการโหวต ---
function endVoting() {
  clearInterval(timerInterval);
  isVotingActive = false;
  
  // --- แสดงผลลัพธ์ ---
  const choice1Votes = currentVotes.choice1;
  const choice2Votes = currentVotes.choice2;
  let winnerText = "";
  
  if (choice1Votes > choice2Votes) {
    winnerText = `${currentQuestion.choice1.text} ชนะ! (${choice1Votes} vs ${choice2Votes})`;
  } else if (choice2Votes > choice1Votes) {
    winnerText = `${currentQuestion.choice2.text} ชนะ! (${choice2Votes} vs ${choice1Votes})`;
  } else {
    winnerText = `เสมอกัน! (${choice1Votes} vs ${choice2Votes})`;
  }
  
  document.getElementById('winner-text').innerText = winnerText;
  document.getElementById('result-container').classList.remove('hidden');
  document.getElementById('vote-instruction').innerText = "การโหวตสิ้นสุดแล้ว!";
}

// --- ฟังก์ชันรีเซ็ตการโหวต ---
function resetVoting() {
  clearInterval(timerInterval);
  isVotingActive = false;
  votersList.clear();
  currentVotes = { choice1: 0, choice2: 0 };
  currentQuestion = null;
  document.getElementById('vote-count-1').innerText = "0";
  document.getElementById('vote-count-2').innerText = "0";
  document.getElementById('vote-instruction').innerText = "พิมพ์ 1 หรือ 2 ในแชทเพื่อโหวต!";
}

// --- ฟังก์ชันอัปเดตจำนวนโหวต ---
function updateVoteCounts() {
  document.getElementById('vote-count-1').innerText = currentVotes.choice1;
  document.getElementById('vote-count-2').innerText = currentVotes.choice2;
}

// --- ฟังก์ชันรับโหวตจากแชท ---
function processVote(username, message) {
  if (!isVotingActive || votersList.has(username)) {
    return; // ไม่ได้อยู่ในช่วงโหวต หรือผู้ใช้โหวตไปแล้ว
  }
  
  const vote = message.trim();
  
  if (vote === "1") {
    currentVotes.choice1++;
    votersList.add(username);
    updateVoteCounts();
  } else if (vote === "2") {
    currentVotes.choice2++;
    votersList.add(username);
    updateVoteCounts();
  }
}

// --- รับค่า Config จาก StreamElements เมื่อ Widget โหลด --- 
window.addEventListener('onWidgetLoad', function (obj) {
  console.log('onWidgetLoad event received:', obj);
  const fieldData = obj.detail.fieldData;
  
  if (fieldData) {
    // แปลงวินาทีเป็นมิลลิวินาที
    if (fieldData.alertDuration) {
      widgetAlertDuration = fieldData.alertDuration * 1000;
      console.log('widgetAlertDuration set to:', widgetAlertDuration);
    }
    
    if (fieldData.votingDuration) {
      votingDuration = fieldData.votingDuration * 1000;
      console.log('votingDuration set to:', votingDuration);
    }
    
    if (fieldData.rewardName) {
      rewardName = fieldData.rewardName;
      console.log('rewardName set to:', rewardName);
    }
  }
});

// --- รับ Event จาก StreamElements ---
window.addEventListener('onEventReceived', function (obj) {
  console.log('onEventReceived event received:', obj);
  console.log('Listener type:', obj.detail.listener);
  
  // --- ตรวจสอบว่าเป็น Event การแลกรางวัล Channel Points ---
  if (obj.detail.listener === 'redemption-latest') {
    const data = obj.detail.event;
    console.log('Redemption event data:', data);
    
    // ตรวจสอบว่าเป็นรางวัลที่ต้องการหรือไม่
    if (data.name === rewardName) {
      showQuestion(data);
    }
  }
  
  // --- ตรวจสอบว่าเป็น Event ข้อความแชท ---
  else if (obj.detail.listener === 'message') {
    const data = obj.detail.event;
    console.log('Chat message data:', data);
    
    // ประมวลผลโหวตจากแชท
    processVote(data.name, data.message);
  }
});

// --- (Optional) สำหรับทดสอบใน Editor ---
// ใส่ Field Data ใน Editor ของ StreamElements เป็น JSON แบบนี้
// {
//   "listener": "redemption-latest",
//   "event": {
//     "name": "TestUser",
//     "redemption": "เกมทายใจ"
//   }
// }
// หรือ
// {
//   "listener": "message",
//   "event": {
//     "name": "TestUser",
//     "message": "1"
//   }
// }
// จากนั้นกดปุ่ม "Emulate"