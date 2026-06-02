import requests
from datetime import datetime
import json
import calendar
import os



API_KEY = os.environ.get("NEIS_API_KEY") # 이것들은 repo secret에 저장
SC_CODE = os.environ.get("SC_CODE")
SD_SCHUL_CODE = os.environ.get("SD_SCHUL_CODE")



def update_thru(firstday, lastday):
    p_index = 1
    p_size = 1000

    while True:
        req_url = f'https://open.neis.go.kr/hub/hisTimetable?KEY={API_KEY}&Type=json&pIndex={p_index}&pSize={p_size}&ATPT_OFCDC_SC_CODE={SC_CODE}&SD_SCHUL_CODE={SD_SCHUL_CODE}&TI_FROM_YMD={firstday}&TI_TO_YMD={lastday}'

        response_full = requests.get(req_url).json()
        if "hisTimetable" in response_full:
            ttble = response_full["hisTimetable"][1]["row"]
        else:
            break

        tg_year, tg_month = firstday[:4], firstday[4:6]

        original = return_dict(f"data/{tg_year}/{tg_month}.json")

        for e in ttble:
            cg_year, cg_month = e["ALL_TI_YMD"][:4], e["ALL_TI_YMD"][4:6]

            if cg_month != tg_month:
                with open(f"data/{tg_year}/{tg_month}.json", "w", encoding="utf-8") as f:
                    json.dump(original, f, ensure_ascii=False, indent=2)
                
                tg_month, tg_year = cg_month, cg_year
                original = return_dict(f"data/{tg_year}/{tg_month}.json")
            
            clsnum = e["GRADE"] + e["CLASS_NM"].zfill(2)
            original.setdefault(e["ALL_TI_YMD"][6:], {}).setdefault(clsnum, {})[e["PERIO"]] = e["ITRT_CNTNT"]
        
        with open(f"data/{tg_year}/{tg_month}.json", "w", encoding="utf-8") as f:
            json.dump(original, f, ensure_ascii=False, indent=2)
        
        p_index += 1



def add_days(yy, mm, dd, add):
    dd += add
    if add > 0:
        _, m_days = calendar.monthrange(yy, mm)
        while m_days < dd:
            if mm == 13:
                mm = 1
                yy += 1
            else:
                mm += 1
            dd -= m_days
            _, m_days = calendar.monthrange(yy, mm)
    else:
        while dd <= 0:
            if mm == 1:
                mm = 12
                yy -= 1
            else:
                mm -= 1
            _, m_days = calendar.monthrange(yy, mm)
            dd += m_days
    mm = str(mm).zfill(2)
    dd = str(dd).zfill(2)
    return f"{yy}{mm}{dd}"


def return_dict(filepath):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        return {}



if __name__ == "__main__":
    yy, mm, dd = [int(e) for e in str(datetime.now().date()).split("-")]

    weekday = datetime.now().weekday()
    # weekday() -> 0 = 월욜, 6 = 일욜
    weekday = -1*((weekday // 6)*-7 + weekday)
    # 일요일을 1로 바꿔야됨, 일욜~토욜을 한주로 봄

    update_thru(add_days(yy, mm, dd, weekday - 14), add_days(yy, mm, dd, weekday + 25)) #2주 전 ~ 3주 후
