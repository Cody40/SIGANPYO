const class_dd = document.getElementById("class_list");
const grade_dd = document.getElementById("grade_dd");

const index = await fetch("ttble_2026/index.json").then(r => r.json());
const cls_per_grd = [index[index.length - 1]["1"], index[index.length - 1]["2"], index[index.length - 1]["3"]];
const title_grade = document.getElementById('title_grade');
const title_class = document.getElementById('title_class');



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
});

class_dd.addEventListener('change', function() {
    localStorage.setItem("s_class", this.value);
    title_grade.textContent = localStorage.getItem("s_grade");
    title_class.textContent = localStorage.getItem("s_class");
});
