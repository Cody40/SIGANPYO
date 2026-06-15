const class_dd = document.getElementById("class_dd");
const grade_dd = document.getElementById("grade_dd");
const date_dd  = document.getElementById("date");
const BASE = "https://cody40.github.io/SIGANPYO/";
const cls_per_grd = [10,9,9];
const title_grade = document.getElementById('title_grade');
const title_class = document.getElementById('title_class');

const cache = {};

const COMMON = {
    "1": ["공통국어1","공통수학1","공통영어1","통합과학1","통합사회1","한국사1","체육1","자율·자치활동","과학탐구실험1","진로활동"],
    "2": ["대수","문학","영어Ⅰ","자율·자치활동","진로활동","운동과 건강"],
    "3": ["화법과 작문","영어 독해와 작문","스포츠 생활","자율활동","진로활동"]
};

const OTHER = {
    "1": ["기술·가정","미술","음악","정보"],
    "2": ["기하","물리학","화학","생명과학","지구과학","경제","세계사","사회와 문화","세계시민과 지리","현대사회와 윤리","세계 문화와 영어","주제 탐구 독서","지식 재산 일반","인공지능 기초","일본어","중국어 회화"],
    "3": ["미적분","기하","경제 수학","물리학Ⅱ","화학Ⅱ","생명과학Ⅱ","지구과학Ⅱ","생활과 과학","정보과학","사회·문화","사회문제 탐구","생활과 윤리","세계지리","세계시민","현대 세계의 변화","여행지리","심화 국어","진로 영어","교육학","미술 감상과 비평","음악 감상과 비평","일본 문화","중국 문화"]
};

const dayNames = ["월","화","수","목","금"];

function pickKey(g){return "s_pick_"+g}
function loadPicks(g){try{return JSON.parse(localStorage.getItem(pickKey(g)))||{}}catch{return{}}}
function savePicks(g,p){localStorage.setItem(pickKey(g),JSON.stringify(p))}
function cellKey(d,c,p){return d+"_"+c+"_"+p}

function formatDate(d){
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function getMonday(d){
    d=new Date(d);
    const diff=d.getDay()===0?-6:1-d.getDay();
    d.setDate(d.getDate()+diff);
    return d;
}

grade_dd.value = localStorage.getItem("s_grade") || "1";

class_dd.innerHTML="";
for(let i=1;i<=cls_per_grd[grade_dd.value-1];i++){
    class_dd.innerHTML+=`<option value="${i}">${i}</option>`;
}

class_dd.value = localStorage.getItem("s_class") || "1";

title_grade.textContent=grade_dd.value;
title_class.textContent=class_dd.value;

let m=getMonday(new Date());
m.setDate(m.getDate()-14);

date_dd.innerHTML="";
for(let i=0;i<5;i++){
    let mon=new Date(m);
    let fri=new Date(m);
    fri.setDate(fri.getDate()+4);

    const v=formatDate(mon);
    date_dd.innerHTML+=`<option value="${v}">${v.slice(2)}~${formatDate(fri).slice(2)}</option>`;
    m.setDate(m.getDate()+7);
}

const todayMonday=formatDate(getMonday(new Date()));
if(date_dd.querySelector(`option[value="${todayMonday}"]`))date_dd.value=todayMonday;

async function fetchWeekData(v){
    const [y,mo,da]=v.split("-").map(Number);
    const monday=new Date(y,mo-1,da);

    const week=[],files=new Set();

    for(let i=0;i<5;i++){
        const d=new Date(monday);
        d.setDate(monday.getDate()+i);

        const file=`data/${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}.json`;

        files.add(file);
        week.push({file,date:d,key:String(d.getDate()).padStart(2,"0")});
    }

    await Promise.all([...files].map(async f=>{
        if(!cache[f])cache[f]=await fetch(BASE+f).then(r=>r.json()).catch(()=>({}));
    }));

    return {week};
}

function clean(s){return s?String(s).replace("[보강]",""):undefined}

async function renderTable(){
    const v=date_dd.value;
    const g=grade_dd.value;
    const c=class_dd.value;
    const cls=g+String(c).padStart(2,"0");

    title_grade.textContent=g;
    title_class.textContent=c;

    const {week}=await fetchWeekData(v);
    const rows=document.querySelectorAll("#ttable tbody tr");
    const th=document.querySelectorAll("#ttable thead th");
    const picks=loadPicks(g);

    for(let i=0;i<5;i++){
        const w=week[i];
        th[i+1].textContent=dayNames[i]+" ("+w.date.getDate()+"일)";

        const data=cache[w.file]||{};
        const s=data[w.key]?.[cls]||{};

        for(let p=0;p<7;p++){
            const cell=rows[p].querySelectorAll("td")[i+1];
            const sub=clean(s[String(p+1)]);

            if(!sub){
                cell.textContent="";
                cell.style.background="#d0d0d0";
                continue;
            }

            if(COMMON[g].includes(sub)){
                cell.textContent=sub;
                cell.style.background="#fff";
            }else{
                const k=cellKey(v,i,p+1);
                cell.textContent=picks[k]||"";
                cell.style.background="#eefefe";
            }
        }
    }
}

async function renderSettingsTable(){
    const v=date_dd.value;
    const g=grade_dd.value;
    const c=class_dd.value;
    const cls=g+String(c).padStart(2,"0");

    const {week}=await fetchWeekData(v);
    const rows=document.querySelectorAll("#settings_tbody tr");
    const th=["s_h1","s_h2","s_h3","s_h4","s_h5"].map(id=>document.getElementById(id));
    const picks=loadPicks(g);
    const opt=OTHER[g]||[];

    for(let i=0;i<5;i++){
        const w=week[i];
        th[i].textContent=dayNames[i]+" ("+w.date.getDate()+"일)";

        const data=cache[w.file]||{};
        const s=data[w.key]?.[cls]||{};

        for(let p=0;p<7;p++){
            const cell=rows[p].querySelectorAll("td")[i+1];
            cell.innerHTML="";

            const sub=clean(s[String(p+1)]);
            if(!sub)continue;

            if(COMMON[g].includes(sub)){
                cell.textContent=sub;
            }else{
                const sel=document.createElement("select");
                sel.innerHTML="<option></option>"+opt.map(o=>`<option>${o}</option>`).join("");
                const k=cellKey(v,i,p+1);
                sel.value=picks[k]||"";

                sel.onchange=()=>{
                    const ps=loadPicks(grade_dd.value);
                    if(sel.value==="")delete ps[k];
                    else ps[k]=sel.value;
                    savePicks(grade_dd.value,ps);
                };

                cell.appendChild(sel);
            }
        }
    }
}

grade_dd.onchange=()=>{
    localStorage.setItem("s_grade",grade_dd.value);
    class_dd.innerHTML="";
    for(let i=1;i<=cls_per_grd[grade_dd.value-1];i++){
        class_dd.innerHTML+=`<option value="${i}">${i}</option>`;
    }
    class_dd.value="1";
    localStorage.setItem("s_class","1");
    renderTable();
};

class_dd.onchange=()=>{
    localStorage.setItem("s_class",class_dd.value);
    renderTable();
};

date_dd.onchange=renderTable;

renderTable();

function openModal(){
    document.getElementById("modal_bg").style.display="block";
    renderSettingsTable();
}

function closeModal(){
    document.getElementById("modal_bg").style.display="none";
    renderTable();
}

window.openModal=openModal;
window.closeModal=closeModal;
