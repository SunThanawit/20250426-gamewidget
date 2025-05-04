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
  
  // ตรวจสอบว่า message เป็น string หรือ object
  let voteText = "";
  
  if (typeof message === 'string') {
    voteText = message.trim();
  } else if (message && message.text) {
    // กรณีที่เป็น object ที่มี property text
    voteText = message.text.trim();
  } else if (message && message.renderedText) {
    // กรณีที่เป็น object ที่มี property renderedText
    voteText = message.renderedText.trim();
  } else if (message && message.data && message.data.text) {
    // กรณีที่เป็น object ที่มี property data.text (รูปแบบของ Twitch)
    voteText = message.data.text.trim();
  } else {
    console.log('ไม่สามารถอ่านข้อความโหวตได้:', message);
    return;
  }
  
  console.log('ข้อความโหวตที่ได้รับ:', voteText);
  
  if (voteText === "1") {
    currentVotes.choice1++;
    votersList.add(username);
    updateVoteCounts();
    console.log(`ผู้ใช้ ${username} โหวตตัวเลือกที่ 1`);
  } else if (voteText === "2") {
    currentVotes.choice2++;
    votersList.add(username);
    updateVoteCounts();
    console.log(`ผู้ใช้ ${username} โหวตตัวเลือกที่ 2`);
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
  console.log('Full event structure:', JSON.stringify(obj.detail));
  
  // --- ตรวจสอบว่าเป็น Event การแลกรางวัล Channel Points ---
  if (obj.detail.listener === 'redemption-latest' || obj.detail.listener === 'event') {
    const data = obj.detail.event;
    console.log('Redemption event data:', data);
    
    // ตรวจสอบว่าเป็น Channel Points Redemption จาก Twitch
    if (data.type === 'channelPointsRedemption') {
      console.log('Detected Twitch Channel Points redemption');
      console.log('Full data structure:', JSON.stringify(data, null, 2));
      
      // ดึงข้อมูลผู้ใช้จากโครงสร้างข้อมูล Twitch
      let username = 'Viewer';
      
      // ตรวจสอบรูปแบบต่างๆ ที่อาจเป็นไปได้ตามโครงสร้างข้อมูลจาก Twitch
      if (data.data && data.data.userDisplayName) {
        username = data.data.userDisplayName;
      } else if (data.data && data.data.displayName) {
        username = data.data.displayName;
      } else if (data.data && data.data.username) {
        username = data.data.username;
      } else if (data.displayName) {
        username = data.displayName;
      } else if (data.username) {
        username = data.username;
      }
      
      // สร้างข้อมูลสำหรับส่งไปยัง showQuestion
      // ตรวจสอบชื่อรางวัลจากโครงสร้างข้อมูล Twitch
      let rewardTitle = rewardName;
      if (data.data && data.data.rewardTitle) {
        rewardTitle = data.data.rewardTitle;
      }
      
      const redemptionData = {
        name: username,
        redemption: rewardTitle
      };
      
      console.log('Prepared redemption data:', redemptionData);
      
      // ตรวจสอบว่าเป็นรางวัลที่ต้องการหรือไม่
      if (rewardTitle === rewardName) {
        console.log('Reward name matches exactly, showing question');
        showQuestion(redemptionData);
      } else if (rewardTitle.toLowerCase().includes(rewardName.toLowerCase()) || rewardName.toLowerCase().includes(rewardTitle.toLowerCase())) {
        // ตรวจสอบว่ามีชื่อรางวัลเป็นส่วนหนึ่งของกันและกัน (ไม่ต้องตรงทั้งหมด)
        console.log('Reward name partially matches, showing question anyway');
        showQuestion(redemptionData);
      } else {
        console.log('Reward name does not match. Expected:', rewardName, 'Got:', rewardTitle);
        // ทดลองแสดงคำถามแม้ชื่อรางวัลไม่ตรงกัน (สำหรับการทดสอบ)
        console.log('Showing question anyway for testing purposes');
        showQuestion(redemptionData);
      }
      return;
    }
    
    // รองรับรูปแบบเดิมของ StreamElements
    console.log('Checking reward name:', data.redemption, 'against:', rewardName);
    if (data.redemption === rewardName) {
      showQuestion(data);
    } else if (data.name && data.name === rewardName) {
      showQuestion(data);
    } else if (data.skill && data.skill === rewardName) {
      showQuestion(data);
    } else {
      // ทดลองแสดงคำถามโดยไม่ตรวจสอบชื่อรางวัล (สำหรับการทดสอบ)
      console.log('No exact match for reward name, but showing question anyway for testing');
      showQuestion(data);
    }
  }
  
  // --- ตรวจสอบว่าเป็น Event ข้อความแชท ---
  else if (obj.detail.listener === 'message') {
    const data = obj.detail.event;
    console.log('Chat message data:', data);
    
    // ดึงชื่อผู้ใช้จากโครงสร้างข้อมูล Twitch
    let username = 'Viewer';
    if (data.displayName) {
      username = data.displayName;
    } else if (data.name) {
      username = data.name;
    } else if (data.data && data.data.displayName) {
      username = data.data.displayName;
    } else if (data.data && data.data.nick) {
      username = data.data.nick;
    }
    
    // ดึงข้อความจากโครงสร้างข้อมูล Twitch
    let messageText = null;
    if (data.renderedText) {
      messageText = data.renderedText;
    } else if (data.message) {
      messageText = data.message;
    } else if (data.text) {
      messageText = data.text;
    } else if (data.data && data.data.text) {
      messageText = data.data.text;
    }
    
    console.log('ข้อความที่ได้รับจากแชท:', messageText);
    
    // ประมวลผลโหวตจากแชท
    if (messageText !== null) {
      processVote(username, messageText);
    } else {
      console.log('ไม่สามารถดึงข้อความจากแชทได้:', data);
      // ส่งทั้ง object data เพื่อให้ processVote พยายามดึงข้อความเอง
      processVote(username, data);
    }
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

// --- ฟังก์ชันสำหรับทดสอบโดยตรง ---
// เรียกใช้ฟังก์ชันนี้ใน Console ของ Browser เพื่อทดสอบ Widget โดยตรง
testWidget();
function testWidget() {
  console.log('Running test widget function');
  const testData = {
    name: 'TestUser',
    redemption: rewardName
  };
  showQuestion(testData);
}