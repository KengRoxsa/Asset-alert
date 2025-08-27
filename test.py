import os
import requests
from dotenv import load_dotenv

load_dotenv('.env.local')

WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")

def send_discord_message(msg: str):
    data = {"content": msg}
    if WEBHOOK_URL:
        response = requests.post(WEBHOOK_URL, json=data)
        if response.status_code == 204:
            print("ส่งข้อความสำเร็จ")
        else:
            print("ส่งไม่สำเร็จ:", response.status_code, response.text)
    else:
        print("DISCORD_WEBHOOK_URL is not set.")

# ตัวอย่างใช้งาน
send_discord_message("สวัสดีครับ! นี่คือแจ้งเตือนราคาล่าสุด")