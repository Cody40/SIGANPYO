import requests
from datetime import datetime
import json



API_KEY = "" #키는 깃헙 액션즈 시크릿 써서 저장할 수 있음
SC_CODE = "J10"
SC_SCHUL_CODE = "7531165"



def update_week(d1, d2):
    #neis api로 한주간 시간표 가져오기
    req_url = f'https://open.neis.go.kr/hub/hisTimetable?KEY={API_KEY}&Type=json&pIndex=1&pSize=1000&ATPT_OFCDC_SC_CODE={SC_CODE}&SD_SCHUL_CODE={SC_SCHUL_CODE}&TI_FROM_YMD={d1}&TI_TO_YMD={d2}'

    response_full = json.loads(requests.get(req_url).text)
    ttble = response_full["hisTimetable"][1]["row"]

    #어떤 json 파일을 변경해야 하는지 찾기
    mmdd = ttble[0]["ALL_TI_YMD"][4:]
    numfy_date = int(mmdd[:2])*100 + int(mmdd[2:]) # 달*100으로 해서 달별 30일까지/31일까지/28일까지 차이 무시

    with open(f"ttble_{str(d1)[:4]}/index.json", "r") as f:
        index = json.loads(f.read())
    
    for e in index:
        if (numfy_date >= int(e["stt_date"].split("/")[0])*100 + int(e["stt_date"].split("/")[1])) and (numfy_date <= int(e["end_date"].split("/")[0])*100 + int(e["end_date"].split("/")[1])):
            target_file = e["filename"]
    
    #찾은 json 파일 열고 편집 후 다시 저장
    with open(f"ttble_{str(d1)[:4]}/{target_file}", "r", encoding="utf-8") as f:
        content = json.loads(f.read())

    for e in ttble:
        clsnum = e["GRADE"] + e["CLASS_NM"].zfill(2)
        content.setdefault(e["ALL_TI_YMD"][6:], {}).setdefault(clsnum, []).append(e["ITRT_CNTNT"])

    with open(f"ttble_{str(d1)[:4]}/{target_file}", "w", encoding="utf-8") as f:
        json.dump(content, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    update_week(20260518, 20260523)
    #이제 이걸 매일 현재 주 + 다음주 + 다다음주 시간표를 가져와서 업데이트하게 만들면 됨
