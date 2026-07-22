// src/cards/builtin/checkinCard.js
export function createCheckinCard() {
  return {
    id: "checkin-card",
    label: "Pit Check-In",
    icon: "checklist",
    builtin: true,
    render: (element, state, sdk) => {
      const data = loadNoteData("pit-checkin");
      const wrapper = element.querySelector(".checkin-card-wrapper");
      if (!wrapper) {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
                background: var(--bg-surface);
                border-radius: 8px;
                border: 1px solid var(--border);
                padding: 10px 12px;
                height: 100%;
                overflow: auto;
            `;
        wrapper.className = "checkin-card-wrapper";
        element.appendChild(wrapper);
        wrapper.innerHTML = `
                <div class="pit-header">
                    <span class="pit-title"><i class="ti ti-checklist"></i> Pit Check-In</span>
                    <button class="pit-add-btn" id="checkinAdd">＋ Task</button>
                </div>
                <div class="pit-body" id="checkinBody"></div>
            `;
      }

      const body = element.querySelector("#checkinBody");
      const addBtn = element.querySelector("#checkinAdd");

      const renderTasks = () => {
        const tasks = loadNoteData("pit-checkin");
        body.innerHTML = "";

        if (tasks.length) {
          const done = tasks.filter((d) => d.completed).length;
          const bar = document.createElement("div");
          bar.className = "checkin-progress";
          bar.innerHTML = `
                        <div class="checkin-prog-track">
                            <div class="checkin-prog-fill" style="width:${tasks.length ? ((done / tasks.length) * 100).toFixed(0) : 0}%"></div>
                        </div>
                        <span class="checkin-prog-label">${done}/${tasks.length}</span>
                    `;
          body.appendChild(bar);
        }

        tasks.forEach((entry, i) => {
          const row = document.createElement("div");
          row.className = `checkin-row${entry.completed ? " checkin-done" : ""}${entry.flagged ? " flagged" : ""}`;
          row.innerHTML = `
                        <button class="checkin-check ${entry.completed ? "check-done" : ""}" data-index="${i}">
                            <i class="ti ${entry.completed ? "ti-check" : "ti-circle"}"></i>
                        </button>
                        <input type="checkbox" class="checkin-flag flag-toggle" ${entry.flagged ? "checked" : ""}>
                        <div class="checkin-text">
                            <input class="pit-input checkin-task" placeholder="Task…" value="${escHtml(entry.task)}" ${entry.completed ? "disabled" : ""}>
                            <input class="pit-input checkin-who pit-sub" placeholder="Who?" value="${escHtml(entry.assignedTo)}" ${entry.completed ? "disabled" : ""}>
                        </div>
                        <button class="pit-del-btn" data-index="${i}">✕</button>
                    `;

          const flagEl = row.querySelector(".checkin-flag");
          const taskEl = row.querySelector(".checkin-task");
          const whoEl = row.querySelector(".checkin-who");
          const delBtn = row.querySelector(".pit-del-btn");
          const checkBtn = row.querySelector(".checkin-check");

          flagEl.addEventListener("change", () => {
            const d = loadNoteData("pit-checkin");
            if (d[i]) {
              d[i].flagged = flagEl.checked;
              saveNoteData("pit-checkin", d);
            }
          });

          const save = () => {
            const d = loadNoteData("pit-checkin");
            if (d[i]) {
              d[i].task = taskEl.value;
              d[i].assignedTo = whoEl.value;
              saveNoteData("pit-checkin", d);
            }
          };
          taskEl.addEventListener("input", save);
          whoEl.addEventListener("input", save);

          checkBtn.addEventListener("click", () => {
            const d = loadNoteData("pit-checkin");
            if (d[i]) {
              d[i].completed = !d[i].completed;
              saveNoteData("pit-checkin", d);
            }
            renderTasks();
          });

          delBtn.addEventListener("click", () => {
            const d = loadNoteData("pit-checkin");
            d.splice(i, 1);
            saveNoteData("pit-checkin", d);
            renderTasks();
          });

          body.appendChild(row);
        });

        if (!tasks.length) {
          body.innerHTML = `<p class="pit-empty">No tasks added.</p>`;
        }
      };

      addBtn.addEventListener("click", () => {
        const d = loadNoteData("pit-checkin");
        d.push({ task: "", assignedTo: "", completed: false, flagged: false });
        saveNoteData("pit-checkin", d);
        renderTasks();
      });

      renderTasks();

      function loadNoteData(type) {
        try {
          return JSON.parse(localStorage.getItem(`noteData-${type}`) || "[]");
        } catch {
          return [];
        }
      }
      function saveNoteData(type, data) {
        localStorage.setItem(`noteData-${type}`, JSON.stringify(data));
      }
      function escHtml(str) {
        return String(str || "")
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
    },
  };
}
