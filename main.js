const class_dd = document.getElementById("class_dd");
const grade_dd = document.getElementById("grade_dd");
const date_dd  = document.getElementById("date");
const BASE = "https://cody40.github.io/SIGANPYO/";
const cls_per_grd = [10,9,9];
const title_grade = document.getElementById('title_grade');
const title_class = document.getElementById('title_class');

const cache = {};

const COMMON = {
    "1": ["공통국어1", "공통수학1", "공통영어1", "통합과학1", "통합사회1", "한국사1", "체육1", "자율·자치활동", "과학탐구실험1", "진로활동"],
    "2": ["대수", "문학", "영어Ⅰ", "자율·자치활동", "진로활동", "운동과 건강"],
    "3": ["화법과 작문", "영어 독해와 작문", "스포츠 생활", "자율활동", "진로활동"]
};
const OTHER = {
    "1": ["기술·가정", "미술", "음악", "정보"],
    "2": ["기하", "물리학", "화학", "생명과학", "지구과학", "경제", "세계사",
        "사회와 문화", "세계시민과 지리", "현대사회와 윤리", "세계 문화와 영어",
        "주제 탐구 독서", "지식 재산 일반", "인공지능 기초",
        "일본어", "중국어 회화"],
    "3": ["미적분", "기하", "경제 수학", "물리학Ⅱ", "화학Ⅱ", "생명과학Ⅱ", "지구과학Ⅱ",
        "생활과 과학", "정보과학", "사회·문화", "사회문제 탐구", "생활과 윤리",
        "세계지리", "세계시민", "현대 세계의 변화", "여행지리", "심화 국어",
        "진로 영어", "교육학", "미술 감상과 비평", "음악 감상과 비평",
        "일본 문화", "중국 문화"]
};

const dayNames = ["월", "화", "수", "목", "금"];

function pickKey(grade) {
    return "s_pick_" + grade;
}
function loadPicks(grade) {
    const raw = localStorage.getItem(pickKey(grade));
    if (raw === null) return {};
    try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === "object") return obj;
        return {};
    } catch (e) {
        return {};
    }
}
function savePicks(grade, picks) {
    localStorage.setItem(pickKey(grade), JSON.stringify(picks));
}
function cellKey(mondayDate, col, period) {
    return mondayDate + "_" + col + "_" + period;
}

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
}

if (localStorage.getItem("s_class") === null) {
    localStorage.setItem("s_class", "1");
    class_dd.value = "1";
} else {
    class_dd.value = localStorage.getItem("s_class");
}

title_grade.textContent = localStorage.getItem("s_grade");
title_class.textContent = localStorage.getItem("s_class");

var mondayy = new Date();
const weekday = mondayy.getDay() - 1;
mondayy.setDate(mondayy.getDate() - weekday - 14);

date_dd.innerHTML = "";
for (let i = 0; i < 5; i++) {
    let monday_value = mondayy.toLocaleDateString("en-CA");
    let monday_tsweek = monday_value.slice(2);
    mondayy.setDate(mondayy.getDate() + 4);
    let friday_tsweek = mondayy.toLocaleDateString("en-CA").slice(2);
    date_dd.innerHTML += '<option value="' + monday_value + '">' + monday_tsweek + '~' + friday_tsweek + '</option>';
    mondayy.setDate(mondayy.getDate() + 3);
}

var today = new Date();
var todayDay = today.getDay();
if (todayDay === 0) {
    today.setDate(today.getDate() + 1);
} else {
    today.setDate(today.getDate() - (todayDay - 1));
}
var todayMonday = today.toLocaleDateString("en-CA");
if (date_dd.querySelector('option[value="' + todayMonday + '"]')) {
    date_dd.value = todayMonday;
}

async function fetchWeekData(dateValue) {
    const y  = Number(dateValue.split("-")[0]);
    const mo = Number(dateValue.split("-")[1]);
    const da = Number(dateValue.split("-")[2]);
    const monday = new Date(y, mo - 1, da);

    const weekFiles = [];
    for (let col = 0; col < 5; col++) {
        const thatDay = new Date(monday);
        thatDay.setDate(monday.getDate() + col);
        const yy = String(thatDay.getFullYear());
        const mm = String(thatDay.getMonth() + 1).padStart(2, "0");
        const dd = String(thatDay.getDate()).padStart(2, "0");
        const filename = "data/" + yy + "/" + mm + ".json";
        weekFiles.push({ filename, dd, thatDay });
    }

    for (const w of weekFiles) {
        if (cache[w.filename] === undefined) {
            cache[w.filename] = await fetch(BASE + w.filename).then(r => r.ok ? r.json() : {}).catch(() => ({}));
        }
    }
    return { monday, weekFiles };
}

function getCleanedSubject(raw) {
    if (raw === undefined || raw === null) return undefined;
    return String(raw).replace("[보강]", "");
}

async function renderTable() {
    const dateValue = date_dd.value;
    const grade = grade_dd.value;
    const cls   = class_dd.value;
    const clsnum = grade + String(cls).padStart(2, "0");

    title_grade.textContent = grade;
    title_class.textContent = cls;

    const { monday, weekFiles } = await fetchWeekData(dateValue);
    const rows    = document.querySelectorAll("#ttable tbody tr");
    const headers = document.querySelectorAll("#ttable thead th");
    const picks = loadPicks(grade);

    for (let col = 0; col < 5; col++) {
        const w = weekFiles[col];
        headers[col + 1].textContent = dayNames[col] + " (" + w.thatDay.getDate() + "일)";

        const data = cache[w.filename] || {};
        let subjects = {};
        if (data[w.dd] !== undefined && data[w.dd][clsnum] !== undefined) {
            subjects = data[w.dd][clsnum];
        }

        for (let p = 0; p < 7; p++) {
            const cell = rows[p].querySelectorAll("td")[col + 1];
            const subject = getCleanedSubject(subjects[String(p + 1)]);
            if (subject === undefined) {
                cell.textContent = "";
                cell.style = "background: #d0d0d0;"
                continue;
            }
            if (COMMON[grade].includes(subject)) {
                cell.textContent = subject;
                cell.style = "background: #ffffff;"
            } else {
                const userPick = picks[cellKey(dateValue, col, p + 1)];
                cell.textContent = (userPick && userPick.length > 0) ? userPick : "";
                cell.style = "background: #eefefe;"
            }
        }
    }
}

async function renderSettingsTable() {
    const dateValue = date_dd.value;
    const grade = grade_dd.value;
    const cls   = class_dd.value;
    const clsnum = grade + String(cls).padStart(2, "0");

    const { monday, weekFiles } = await fetchWeekData(dateValue);
    const sRows = document.querySelectorAll("#settings_tbody tr");
    const sHeaders = ["s_h1","s_h2","s_h3","s_h4","s_h5"].map(id => document.getElementById(id));
    const picks = loadPicks(grade);
    const options = OTHER[grade] || [];

    for (let col = 0; col < 5; col++) {
        const w = weekFiles[col];
        sHeaders[col].textContent = dayNames[col] + " (" + w.thatDay.getDate() + "일)";

        const data = cache[w.filename] || {};
        let subjects = {};
        if (data[w.dd] !== undefined && data[w.dd][clsnum] !== undefined) {
            subjects = data[w.dd][clsnum];
        }

        for (let p = 0; p < 7; p++) {
            const cell = sRows[p].querySelectorAll("td")[col + 1];
            cell.innerHTML = "";
            cell.style.backgroundColor = "";
            const subject = getCleanedSubject(subjects[String(p + 1)]);
            if (subject === undefined) {
                continue;
            }
            if (COMMON[grade].includes(subject)) {
                cell.textContent = subject;
                cell.style.backgroundColor = "#cccccc";
            } else {
                const sel = document.createElement("select");
                const empty = document.createElement("option");
                empty.value = "";
                empty.textContent = "";
                sel.appendChild(empty);
                for (const opt of options) {
                    const o = document.createElement("option");
                    o.value = opt;
                    o.textContent = opt;
                    sel.appendChild(o);
                }
                const stored = picks[cellKey(dateValue, col, p + 1)] || "";
                sel.value = stored;
                sel.dataset.col = String(col);
                sel.dataset.period = String(p + 1);
                sel.addEventListener("change", function() {
                    const g = grade_dd.value;
                    const ps = loadPicks(g);
                    const k = cellKey(date_dd.value, Number(this.dataset.col), Number(this.dataset.period));
                    if (this.value === "") {
                        delete ps[k];
                    } else {
                        ps[k] = this.value;
                    }
                    savePicks(g, ps);
                });
                cell.appendChild(sel);
            }
        }
    }
}

function savePicksFromDOM() {
    const grade = grade_dd.value;
    const dateValue = date_dd.value;
    const picks = loadPicks(grade);
    const selects = document.querySelectorAll("#settings_tbody select");
    selects.forEach(sel => {
        const k = cellKey(dateValue, Number(sel.dataset.col), Number(sel.dataset.period));
        if (sel.value === "") {
            delete picks[k];
        } else {
            picks[k] = sel.value;
        }
    });
    savePicks(grade, picks);
}

grade_dd.addEventListener('change', function() {
    class_dd.innerHTML = "";
    let totalClasses = cls_per_grd[this.value - 1];
    for (let i = 1; i <= totalClasses; i++) {
        class_dd.innerHTML += '<option value="' + String(i) + '">' + String(i) + '</option>';
    }

    localStorage.setItem("s_grade", this.value);
    let curclass = localStorage.getItem("s_class");
    if (Number(curclass) > Number(cls_per_grd[this.value - 1])) {
        class_dd.value = cls_per_grd[this.value - 1];
        localStorage.setItem("s_class", String(cls_per_grd[this.value - 1]));
    } else {
        class_dd.value = curclass;
    }
    title_grade.textContent = localStorage.getItem("s_grade");
    title_class.textContent = localStorage.getItem("s_class");
    renderTable();
    if (document.getElementById("modal_bg").style.display === "block") {
        renderSettingsTable();
    }
});

class_dd.addEventListener('change', function() {
    localStorage.setItem("s_class", this.value);
    title_class.textContent = localStorage.getItem("s_class");
    renderTable();
    if (document.getElementById("modal_bg").style.display === "block") {
        renderSettingsTable();
    }
});

date_dd.addEventListener('change', function() {
    renderTable();
    if (document.getElementById("modal_bg").style.display === "block") {
        renderSettingsTable();
    }
});

renderTable();

function openModal() {
    document.getElementById("modal_bg").style.display = "block";
    renderSettingsTable();
}

function closeModal() {
    savePicksFromDOM();
    document.getElementById("modal_bg").style.display = "none";
    renderTable();
}

window.openModal = openModal;
window.closeModal = closeModal;
