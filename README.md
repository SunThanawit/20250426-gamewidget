# Widget เกมทายใจสำหรับ StreamElements

Widget นี้เป็นเกมทายใจสำหรับสตรีมเมอร์ที่ใช้ StreamElements และ Twitch Channel Points เพื่อให้ผู้ชมมีส่วนร่วมในสตรีมผ่านการโหวตตัวเลือกต่างๆ

## 📋 คุณสมบัติหลัก

- ผู้ชมสามารถแลก Channel Points เพื่อเริ่มเกมทายใจ
- แสดงคำถามพร้อมตัวเลือก 2 ตัวเลือกที่มีทั้งข้อความและรูปภาพ
- ผู้ชมทุกคนสามารถร่วมโหวตผ่านแชทโดยพิมพ์ 1 หรือ 2
- แสดงผลการโหวตแบบเรียลไทม์และประกาศผลเมื่อหมดเวลา
- ตั้งค่าระยะเวลาการแสดงผลและการโหวตได้

## 🔧 การติดตั้ง

1. ล็อกอินเข้าสู่ [StreamElements Dashboard](https://streamelements.com/dashboard)
2. ไปที่ "Overlays" และเลือกโอเวอร์เลย์ที่ต้องการเพิ่ม Widget หรือสร้างโอเวอร์เลย์ใหม่
3. คลิกที่ "+" เพื่อเพิ่ม Widget ใหม่
4. เลือก "Custom Widget"
5. คัดลอกโค้ดจากไฟล์ต่อไปนี้ไปวางในส่วนที่เกี่ยวข้อง:
   - HTML: คัดลอกเนื้อหาจากไฟล์ `html.html`
   - CSS: คัดลอกเนื้อหาจากไฟล์ `css.css`
   - JS: คัดลอกเนื้อหาจากไฟล์ `js.js`
   - Fields: ตั้งค่าตามด้านล่าง

## ⚙️ การตั้งค่า Fields

เพิ่ม Fields ต่อไปนี้ในส่วน "Fields" ของ Custom Widget:

```json
{
  "alertDuration": {
    "type": "number",
    "label": "ระยะเวลาแสดงผล (วินาที)",
    "value": 30
  },
  "votingDuration": {
    "type": "number",
    "label": "ระยะเวลาโหวต (วินาที)",
    "value": 60
  },
  "rewardName": {
    "type": "text",
    "label": "ชื่อรางวัล Channel Points",
    "value": "เกมทายใจ"
  }
}
```

## 🎮 การตั้งค่า Channel Points Reward

1. ไปที่แดชบอร์ด Twitch ของคุณ
2. ไปที่ Creator Dashboard > Viewer Rewards > Channel Points > Manage Rewards & Challenges
3. คลิก "+ Add New Custom Reward"
4. ตั้งชื่อรางวัลให้ตรงกับที่ตั้งค่าในส่วน Fields (ค่าเริ่มต้นคือ "เกมทายใจ")
5. ตั้งค่าอื่นๆ ตามต้องการ (จำนวน Points, Icon, สี, ฯลฯ)

## 🖼️ การเพิ่มคำถามและรูปภาพ

แก้ไขส่วนต่อไปนี้ในไฟล์ JS เพื่อเพิ่มคำถามและตัวเลือกของคุณ:

```javascript
const questions = [
  {
    question: "ทายใจ! ชอบอะไรมากกว่ากัน?",
    choice1: { text: "กล้วย", image: "https://i.imgur.com/UDz2EMm.png" },
    choice2: { text: "ส้ม", image: "https://i.imgur.com/RFnOnfS.png" }
  },
  // เพิ่มคำถามอื่นๆ ที่นี่
  {
    question: "คำถามของคุณ?",
    choice1: { text: "ตัวเลือก 1", image: "URL_รูปภาพ_1" },
    choice2: { text: "ตัวเลือก 2", image: "URL_รูปภาพ_2" }
  }
];
```

สำหรับรูปภาพ คุณสามารถอัปโหลดไปยังเว็บไซต์ฝากรูป เช่น Imgur และใช้ URL ที่ได้

## 📝 วิธีการใช้งาน

1. เมื่อผู้ชมแลก Channel Points ด้วยรางวัล "เกมทายใจ" (หรือชื่อที่คุณตั้ง) Widget จะแสดงคำถามและตัวเลือก
2. ผู้ชมทุกคนสามารถร่วมโหวตโดยพิมพ์ 1 หรือ 2 ในแชท
3. ระบบจะนับคะแนนและแสดงผลแบบเรียลไทม์
4. เมื่อหมดเวลาโหวต ระบบจะประกาศผลลัพธ์
5. Widget จะซ่อนตัวเองหลังจากหมดเวลาที่กำหนด

## 🔍 การทดสอบ

คุณสามารถทดสอบ Widget ได้โดย:

1. เปิดโหมด Preview ใน StreamElements
2. เปิด Console ของเบราว์เซอร์ (F12)
3. พิมพ์คำสั่ง `testWidget()` ในคอนโซล

หรือใช้ฟังก์ชัน "Emulate" ใน StreamElements โดยใส่ข้อมูลทดสอบในรูปแบบ JSON

## 🛠️ การแก้ไขปัญหา

- หาก Widget ไม่แสดงผลเมื่อมีการแลก Channel Points ให้ตรวจสอบว่าชื่อรางวัลตรงกับที่ตั้งค่าไว้หรือไม่
- ตรวจสอบ Console ของเบราว์เซอร์เพื่อดูข้อความ error
- ตรวจสอบว่า URL รูปภาพถูกต้องและสามารถเข้าถึงได้

## 📱 การปรับแต่งเพิ่มเติม

คุณสามารถปรับแต่งสไตล์ของ Widget ได้โดยแก้ไขส่วน CSS เช่น:

- เปลี่ยนสี พื้นหลัง และขอบของ Widget
- ปรับขนาดและตำแหน่งของรูปภาพ
- เปลี่ยนฟอนต์และขนาดข้อความ

---

พัฒนาโดย [ชื่อของคุณ] | สำหรับข้อเสนอแนะหรือคำถาม ติดต่อ [ช่องทางการติดต่อของคุณ]