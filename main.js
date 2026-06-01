const class_dd = document.getElementById("class_dd");
const grade_dd = document.getElementById("grade_dd");
const date_dd  = document.getElementById("date");
const BASE = "https://cody40.github.io/SIGANPYO/ttble_2026/";
const index = await fetch(BASE + "index.json").then(r => r.json());
const cls_per_grd = [index[index.length - 1]["1"], index[index.length - 1]["2"], index[index.length - 1]["3"]];
const title_grade = document.getElementById('title_grade');
const title_class = document.getElementById('title_class');

const cache={}; //캐시. 다시보니깐 안써도 됨. 설명 실수함 (f5누르면 다 날라감)


if (localStorage.getItem("s_grade") === null) {
    localStorage.setItem("s_grade", "1");
    grade_dd.value = "1";
} else {
    grade_dd.value = localStorage.getItem("s_grade");
}

class_dd.innerHTML = "";
let totalcls = cls_per_grd[grade_dd.value - 1];
for (let i = 1; i <= totalcls; i++) {
    class_dd.innerHTML += '<option value="' + String(i) + '">' + String(i) + '</option>';
};

if (localStorage.getItem("s_class") === null) {
    localStorage.setItem("s_class", "1");
    class_dd.value = "1";
} else {
    class_dd.value = localStorage.getItem("s_class");
};

title_grade.textContent = localStorage.getItem("s_grade");
title_class.textContent = localStorage.getItem("s_class");

function findFile(dateValue) {
    const month = Number(dateValue.split("-")[1]);
    const day   = Number(dateValue.split("-")[2]);
    const num = month * 100 + day;
 
    for (const sibal of index) {
        if (sibal.stt_date === undefined) continue;
        const stt = Number(sibal.stt_date.split("/")[0]) * 100 + Number(sibal.stt_date.split("/")[1]);
        const end = Number(sibal.end_date.split("/")[0]) * 100 + Number(sibal.end_date.split("/")[1]);
        if (num >= stt && num <= end) return sibal.filename;
    }
    return null;
}

const dayNames = ["월", "화", "수", "목", "금"];
 
async function renderTable() {
    const dateValue = date_dd.value;
    const grade = grade_dd.value;
    const cls   = class_dd.value;
    const clsnum = grade + String(cls).padStart(2, "0");
    const common = {
        "1": ["공통국어1", "공통수학1", "공통영어1", "통합과학1", "통합사회1", "한국사1", "체육1", "자율·자치활동","과학탐구실험1","진로활동"],
        "2": ["대수", "문학", "영어Ⅰ", "자율·자치활동","진로활동"],
        "3": ["화법과 작문", "영어 독해와 작문", "스포츠 생활", "자율활동", "진로활동"]
    };
    const other = {
        "1": ["기술·가정", "미술", "음악", "정보"],
        "2": ["기하", "물리학", "화학", "생명과학", "지구과학", "경제", "세계사",
            "사회와 문화", "세계시민과 지리", "현대사회와 윤리", "세계 문화와 영어",
            "주제 탐구 독서", "지식 재산 일반", "인공지능 기초", "운동과 건강",
            "일본어", "중국어 회화",],
        "3": ["미적분", "기하", "경제 수학", "물리학Ⅱ", "화학Ⅱ", "생명과학Ⅱ", "지구과학Ⅱ",
            "생활과 과학", "정보과학", "사회·문화", "사회문제 탐구", "생활과 윤리",
            "세계지리", "세계시민", "현대 세계의 변화", "여행지리", "심화 국어",
            "진로 영어", "교육학", "미술 감상과 비평", "음악 감상과 비평",
            "일본 문화", "중국 문화"]
        };

    title_grade.textContent = grade;
    title_class.textContent = cls;
 
    const filename = findFile(dateValue);
    if (filename === null) return;

    if (cache[filename] === undefined) {
        cache[filename] = await fetch(BASE + filename).then(r => r.json());
    }
    const data = cache[filename];
 
    const y  = Number(dateValue.split("-")[0]);
    const mo = Number(dateValue.split("-")[1]);
    const da = Number(dateValue.split("-")[2]);
    const monday = new Date(y, mo - 1, da);
 
    const rows    = document.querySelectorAll("#ttable tbody tr");
    const headers = document.querySelectorAll("#ttable thead th");

    const replaceText = "선택";
 
    for (let col = 0; col < 5; col++) {
        const thatDay = new Date(monday);
        thatDay.setDate(monday.getDate() + col);
        const dd = String(thatDay.getDate()).padStart(2, "0");
 
        headers[col + 1].textContent = dayNames[col] + " (" + thatDay.getDate() + "일)";
 
        let subjects = [];
        if (data[dd] !== undefined && data[dd][clsnum] !== undefined) {
            subjects = data[dd][clsnum];
        }
 
        for (let p = 0; p < 7; p++) {
            const cell = rows[p].querySelectorAll("td")[col + 1];
            let subject = subjects[p];
            if (subject === undefined) {
                cell.textContent = "";  
                continue;
            }
            subject = subject.replace("[보강]", "");
            if (other[grade].includes(subject)) {
                cell.textContent = replaceText;
            }else{
                cell.textContent = subject;
            }
        }
    }
}

grade_dd.addEventListener('change', function() {
    class_dd.innerHTML = "";
    let totalClasses = cls_per_grd[this.value-1];
    for (let i = 1; i <= totalClasses; i++) {
        class_dd.innerHTML += '<option value="' + String(i) + '">' + String(i) + '</option>';
    };

    localStorage.setItem("s_grade", this.value);
    let curclass = localStorage.getItem("s_class")
    if (Number(curclass) > Number(cls_per_grd[this.value-1])) {
        class_dd.value = cls_per_grd[this.value-1];
        localStorage.setItem("s_class", cls_per_grd[this.value-1]);
    } else {
        class_dd.value = curclass;
    }
    title_grade.textContent = localStorage.getItem("s_grade");
    title_class.textContent = localStorage.getItem("s_class");
    renderTable();
});

class_dd.addEventListener('change', function() {
    localStorage.setItem("s_class", this.value);
    title_class.textContent = localStorage.getItem("s_class");
    renderTable();
});




date_dd.addEventListener('change', renderTable);
renderTable();
