
let currentTask = null;
let paused = false;
let tasks = [];
let pauseStart = null;
let pauseDuration = 0;

function formatTime(date) {
    return date.toLocaleTimeString();
}

function startTask() {
    const name = document.getElementById("taskName").value;
    if (!name) return alert("请输入任务名称");
    currentTask = {
        name,
        start: new Date(),
        pauses: [],
        end: null
    };
    paused = false;
    pauseDuration = 0;
    render();
}

function pauseTask() {
    if (currentTask && !paused) {
        paused = true;
        pauseStart = new Date();
    }
}

function resumeTask() {
    if (currentTask && paused) {
        paused = false;
        const now = new Date();
        currentTask.pauses.push([pauseStart, now]);
        pauseDuration += (now - pauseStart);
        pauseStart = null;
        render();
    }
}

function endTask() {
    if (currentTask) {
        if (paused && pauseStart) resumeTask();
        currentTask.end = new Date();
        tasks.push(currentTask);
        saveToMarkdown(currentTask);
        currentTask = null;
        render();
    }
}

function addFutureTask() {
    const name = prompt("明天的任务：");
    if (name) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const task = `- [ ] ${tomorrow.toLocaleDateString()} ${name}\n`;
        downloadFile(`future_${tomorrow.toISOString().slice(0,10)}.md`, task);
    }
}

function render() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    tasks.forEach(t => {
        const li = document.createElement("li");
        li.textContent = `${t.name}: ${formatTime(new Date(t.start))} - ${formatTime(new Date(t.end))}`;
        list.appendChild(li);
    });
}

function saveToMarkdown(task) {
    const now = new Date();
    const fileName = now.toISOString().slice(0, 10) + ".md";
    const pauses = task.pauses.map(p => `暂停: ${formatTime(p[0])} ~ ${formatTime(p[1])}`).join("\n");
    const content = `## ${task.name}\n开始: ${formatTime(task.start)}\n结束: ${formatTime(task.end)}\n${pauses}\n`;
    downloadFile(fileName, content);
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}
