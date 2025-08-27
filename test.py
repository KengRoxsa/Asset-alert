import requests

WEBHOOK_URL = "https://discord.com/api/webhooks/1410401799390625943/QAV2FxUtphS9uNklxTz3RBvEn--ue5YBlKcb90K0CUV4KRHzHbes2xpIe6--Fh1sqZSw"

def send_discord_message(msg: str):
    data = {"content": msg}
    response = requests.post(WEBHOOK_URL, json=data)
    if response.status_code == 204:
        print("ส่งข้อความสำเร็จ")
    else:
        print("ส่งไม่สำเร็จ:", response.status_code, response.text)

# ตัวอย่างใช้งาน
send_discord_message("สวัสดีครับ! นี่คือแจ้งเตือนราคาล่าสุด")
