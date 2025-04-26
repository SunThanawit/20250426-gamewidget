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

let alertTimeout; // สำหรับเก็บ timeout ID
let widgetAlertDuration = 10000; // ค่าเริ่มต้น (10 วินาที) ถ้ายังไม่ได้รับค่าจาก fieldData

// --- ฟังก์ชันแสดง Alert ---
function showAlert(data) {
  console.log('showAlert called with data:', data); // <--- เพิ่ม log
  // --- สุ่มเลือกคำถาม ---
  const randomIndex = Math.floor(Math.random() * questions.length);
  const selectedQuestion = questions[randomIndex];
  console.log('Selected question:', selectedQuestion); // <--- เพิ่ม log

  // --- อัปเดตข้อมูลผู้โดเนท ---
  document.getElementById('donator-name').innerText = data.name;
  // Format สกุลเงินและจำนวนเงิน (ปรับตามต้องการ)
  const amountFormatted = data.amount.toLocaleString(undefined, { style: 'currency', currency: data.currency || 'USD' }); // ใช้ USD เป็นค่าเริ่มต้นถ้าไม่มี currency
  document.getElementById('donation-amount').innerText = amountFormatted;


  // --- อัปเดตข้อความคำถามและรูปภาพ ---
  document.getElementById('question-text').innerText = selectedQuestion.question;
  document.getElementById('image-1').src = selectedQuestion.choice1.image;
  document.getElementById('image-1').alt = selectedQuestion.choice1.text;
  document.getElementById('choice-1-text').innerText = selectedQuestion.choice1.text;

  document.getElementById('image-2').src = selectedQuestion.choice2.image;
  document.getElementById('image-2').alt = selectedQuestion.choice2.text;
  document.getElementById('choice-2-text').innerText = selectedQuestion.choice2.text;

  // --- แสดง Alert ---
  const container = document.getElementById('alert-container');
  console.log('Showing alert container'); // <--- เพิ่ม log
  container.classList.remove('hidden');
  container.classList.add('visible'); // ใช้ class สำหรับ animation (ถ้ามี)

  // --- ตั้งเวลาซ่อน Alert โดยใช้ค่าจาก fieldData (หน่วยเป็น ms) ---
  const alertDuration = widgetAlertDuration;
  console.log(`Setting timeout to hide alert in ${alertDuration}ms`); // <--- เพิ่ม log
  clearTimeout(alertTimeout); // เคลียร์ timeout เก่า (ถ้ามี)
  alertTimeout = setTimeout(() => {
    console.log('Hiding alert container (removing visible)'); // <--- เพิ่ม log
    container.classList.remove('visible');
    // อาจะรอ animation จบก่อนซ่อนจริง
     setTimeout(() => {
        console.log('Hiding alert container (adding hidden)'); // <--- เพิ่ม log
        container.classList.add('hidden');
     }, 500); // รอ 0.5 วินาทีให้ fade out จบ
  }, alertDuration);
}

// --- รับค่า Config จาก StreamElements เมื่อ Widget โหลด --- 
window.addEventListener('onWidgetLoad', function (obj) {
  console.log('onWidgetLoad event received:', obj); // <--- เพิ่ม log
  if (obj.detail.fieldData && obj.detail.fieldData.alertDuration) {
    // แปลงวินาทีเป็นมิลลิวินาที
    widgetAlertDuration = obj.detail.fieldData.alertDuration * 1000;
    console.log('widgetAlertDuration set to:', widgetAlertDuration); // <--- เพิ่ม log
  }
});

// --- รับ Event จาก StreamElements ---
window.addEventListener('onEventReceived', function (obj) {
  console.log('onEventReceived event received:', obj); // <--- เพิ่ม log
  console.log('Listener type:', obj.detail.listener); // <--- เพิ่ม log ตรวจสอบ listener
  // --- ตรวจสอบว่าเป็น Event การโดเนท (tip-latest) หรือไม่ ---
  if (obj.detail.listener !== 'tip-latest') {
    console.log('Event is not a tip-latest, ignoring.'); // <--- เพิ่ม log
    return; // ไม่ใช่โดเนท ไม่ต้องทำอะไร
  }

  // --- ข้อมูลการโดเนท ---
  const data = obj.detail.event;
  console.log('Tip event data:', data); // <--- เพิ่ม log
  // data.name = ชื่อผู้โดเนท
  // data.amount = จำนวนเงิน (ตัวเลข)
  // data.message = ข้อความโดเนท
  // data.currency = สกุลเงิน (อาจไม่มี)

  // --- เรียกฟังก์ชันแสดง Alert ---
  showAlert(data);
});

// --- (Optional) สำหรับทดสอบใน Editor ---
// ใส่ Field Data ใน Editor ของ StreamElements เป็น JSON แบบนี้เพื่ม log
// {
//   "listener": "tip",
//   "event": {
//     "name": "TestDonator",
//     "amount": 5.00,
//     "message": "ทดสอบ Alert!",
//     "currency": "USD"
//   }
// }
// จากนั้นกดปุ่ม "Emulate"