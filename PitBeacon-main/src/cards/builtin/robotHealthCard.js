// src/cards/builtin/robotHealthCard.js
export function createRobotHealthCard() {
  return {
    id: "robot-health-card",
    label: "Robot Health",
    icon: "tool",
    builtin: true,
    render: (element, state, sdk) => {
      // Load data from localStorage
      const data = loadNoteData("robot-health");
      const wrapper = element.querySelector(".robot-health-wrapper");
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
            wrapper.className = "robot-health-wrapper";
        element.appendChild(wrapper);
        wrapper.innerHTML = `
                <div class="pit-header">
                    <span class="pit-title"><i class="ti ti-tool"></i> Robot Health</span>
                    <button class="pit-add-btn" id="rhAdd">＋ Task</button>
                </div>
                <div class="pit-body" id="rhBody"></div>
            `;
      }

      const body = element.querySelector("#rhBody");
      const addBtn = element.querySelector("#rhAdd");

      const RH_STATUS = {
        pending: { label: "Pending", cls: "chip-warn" },
        "in-progress": { label: "In Progress", cls: "chip-info" },
        completed: { label: "Done", cls: "chip-ok" },
      };

      const renderTasks = () => {
        const tasks = loadNoteData("robot-health");
        body.innerHTML = "";
        if (!tasks.length) {
          body.innerHTML = `<p class="pit-empty">No tasks logged.</p>`;
          return;
        }
        tasks.forEach((entry, i) => {
          const card = document.createElement("div");
          card.className = "pit-card" + (entry.flagged ? " flagged" : "");
          card.innerHTML = `
                        <div class="pit-card-row">
                            <input type="checkbox" class="rh-flag flag-toggle" ${entry.flagged ? "checked" : ""}>
                            <div class="pit-card-fields">
                                <input class="pit-input rh-task" placeholder="Task…" value="${escHtml(entry.task)}">
                                <input class="pit-input pit-sub rh-comp" placeholder="Component" value="${escHtml(entry.component)}">
                            </div>
                            <button class="pit-del-btn" data-index="${i}">✕</button>
                        </div>
                        <div class="pit-status-row">
                            ${Object.entries(RH_STATUS)
                              .map(
                                ([val, { label, cls }]) =>
                                  `<button class="pit-chip ${cls}${val === entry.status ? " chip-active" : ""}" data-val="${val}">${label}</button>`,
                              )
                              .join("")}
                        </div>
                    `;

          const flagEl = card.querySelector(".rh-flag");
          const taskEl = card.querySelector(".rh-task");
          const compEl = card.querySelector(".rh-comp");
          const delBtn = card.querySelector(".pit-del-btn");

          flagEl.addEventListener("change", () => {
            const d = loadNoteData("robot-health");
            if (d[i]) {
              d[i].flagged = flagEl.checked;
              saveNoteData("robot-health", d);
            }
          });

          const save = () => {
            const d = loadNoteData("robot-health");
            if (d[i]) {
              d[i].task = taskEl.value;
              d[i].component = compEl.value;
              saveNoteData("robot-health", d);
            }
          };
          taskEl.addEventListener("input", save);
          compEl.addEventListener("input", save);

          card.querySelectorAll("[data-val]").forEach((btn) => {
            btn.addEventListener("click", () => {
              const d = loadNoteData("robot-health");
              if (d[i]) {
                d[i].status = btn.dataset.val;
                saveNoteData("robot-health", d);
              }
              renderTasks();
            });
          });

          delBtn.addEventListener("click", () => {
            const d = loadNoteData("robot-health");
            d.splice(i, 1);
            saveNoteData("robot-health", d);
            renderTasks();
          });

          body.appendChild(card);
        });
      };

      addBtn.addEventListener("click", () => {
        const d = loadNoteData("robot-health");
        d.push({ task: "", component: "", status: "pending", flagged: false });
        saveNoteData("robot-health", d);
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
