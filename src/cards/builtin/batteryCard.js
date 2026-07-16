// src/cards/builtin/batteryCard.js
export function createBatteryCard() {
  return {
    id: "battery-card",
    label: "Batteries",
    icon: "battery",
    builtin: true,
    render: (element, state, sdk) => {
      const data = loadNoteData("battery-manager");
      const wrapper = element.querySelector(".battery-card-wrapper");
      if (!wrapper) {
        const wrapper = document.createElement("div");
        wrapper.className = "battery-card-wrapper";
        wrapper.style.cssText = `
                    background: var(--bg-surface);
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    padding: 10px 12px;
                height: 100%;
                overflow: auto;
            `;
        element.appendChild(wrapper);
        wrapper.innerHTML = `
                <div class="pit-header">
                    <span class="pit-title"><i class="ti ti-battery-2"></i> Batteries</span>
                    <button class="pit-add-btn" id="battAdd">＋ Battery</button>
                </div>
                <div class="pit-body" id="battBody"></div>
            `;
      }

      const body = element.querySelector("#battBody");
      const addBtn = element.querySelector("#battAdd");

      const BATT_STATUS = {
        ready: { label: "Ready", cls: "chip-ok" },
        charging: { label: "Charging", cls: "chip-info" },
        dead: { label: "Dead", cls: "chip-err" },
      };

      const renderBatteries = () => {
        const batteries = loadNoteData("battery-manager");
        body.innerHTML = "";
        if (!batteries.length) {
          body.innerHTML = `<p class="pit-empty">No batteries logged.</p>`;
          return;
        }
        batteries.forEach((entry, i) => {
          const v = parseFloat(entry.voltage) || 0;
          const pct = Math.min(100, Math.max(0, ((v - 10) / 3) * 100));
          const barCls =
            pct >= 70
              ? "volt-bar-ok"
              : pct >= 40
                ? "volt-bar-warn"
                : "volt-bar-err";

          const card = document.createElement("div");
          card.className = "pit-card" + (entry.flagged ? " flagged" : "");
          card.innerHTML = `
                        <div class="pit-card-row">
                            <input type="checkbox" class="batt-flag flag-toggle" ${entry.flagged ? "checked" : ""}>
                            <div class="pit-card-fields">
                                <div class="batt-top-row">
                                    <input class="pit-input batt-id" placeholder="ID" value="${escHtml(entry.id)}">
                                    <div class="batt-volt-block">
                                        <input class="pit-input batt-volt" type="number" step="0.1" placeholder="V" value="${escHtml(entry.voltage)}">
                                        <div class="volt-track"><div class="volt-bar ${barCls}" style="width:${pct.toFixed(0)}%"></div></div>
                                    </div>
                                    <input class="pit-input batt-cycles" type="number" placeholder="Cycles" value="${escHtml(entry.cycles)}">
                                </div>
                            </div>
                            <button class="pit-del-btn" data-index="${i}">✕</button>
                        </div>
                        <div class="pit-status-row">
                            ${Object.entries(BATT_STATUS)
                              .map(
                                ([val, { label, cls }]) =>
                                  `<button class="pit-chip ${cls}${val === entry.status ? " chip-active" : ""}" data-val="${val}">${label}</button>`,
                              )
                              .join("")}
                        </div>
                    `;

          const flagEl = card.querySelector(".batt-flag");
          const idEl = card.querySelector(".batt-id");
          const voltEl = card.querySelector(".batt-volt");
          const cyclesEl = card.querySelector(".batt-cycles");
          const bar = card.querySelector(".volt-bar");
          const delBtn = card.querySelector(".pit-del-btn");

          flagEl.addEventListener("change", () => {
            const d = loadNoteData("battery-manager");
            if (d[i]) {
              d[i].flagged = flagEl.checked;
              saveNoteData("battery-manager", d);
            }
          });

          const save = () => {
            const d = loadNoteData("battery-manager");
            if (d[i]) {
              d[i].id = idEl.value;
              d[i].voltage = voltEl.value;
              d[i].cycles = cyclesEl.value;
              saveNoteData("battery-manager", d);
              const nv = parseFloat(voltEl.value) || 0;
              const np = Math.min(100, Math.max(0, ((nv - 10) / 3) * 100));
              bar.style.width = np.toFixed(0) + "%";
              bar.className =
                "volt-bar " +
                (np >= 70
                  ? "volt-bar-ok"
                  : np >= 40
                    ? "volt-bar-warn"
                    : "volt-bar-err");
            }
          };
          [idEl, voltEl, cyclesEl].forEach((el) =>
            el.addEventListener("input", save),
          );

          card.querySelectorAll("[data-val]").forEach((btn) => {
            btn.addEventListener("click", () => {
              const d = loadNoteData("battery-manager");
              if (d[i]) {
                d[i].status = btn.dataset.val;
                saveNoteData("battery-manager", d);
              }
              renderBatteries();
            });
          });

          delBtn.addEventListener("click", () => {
            const d = loadNoteData("battery-manager");
            d.splice(i, 1);
            saveNoteData("battery-manager", d);
            renderBatteries();
          });

          body.appendChild(card);
        });
      };

      addBtn.addEventListener("click", () => {
        const d = loadNoteData("battery-manager");
        d.push({
          id: "",
          voltage: "",
          cycles: "0",
          status: "ready",
          flagged: false,
        });
        saveNoteData("battery-manager", d);
        renderBatteries();
      });

      renderBatteries();

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
