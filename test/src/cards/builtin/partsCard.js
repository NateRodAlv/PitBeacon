// src/cards/builtin/partsCard.js
export function createPartsCard() {
  return {
    id: "parts-card",
    label: "Parts Inventory",
    icon: "package",
    builtin: true,
    render: (element, state, sdk) => {
      const data = loadNoteData("parts-inventory");
      const wrapper = element.querySelector(".parts-card-wrapper");
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
        wrapper.className = "parts-card-wrapper";
        element.appendChild(wrapper);
        wrapper.innerHTML = `
                <div class="pit-header">
                    <span class="pit-title"><i class="ti ti-package"></i> Parts Inventory</span>
                    <button class="pit-add-btn" id="partsAdd">＋ Part</button>
                </div>
                <div class="pit-body" id="partsBody"></div>
            `;
      }

      const body = element.querySelector("#partsBody");
      const addBtn = element.querySelector("#partsAdd");

      const renderParts = () => {
        const parts = loadNoteData("parts-inventory");
        body.innerHTML = "";
        if (!parts.length) {
          body.innerHTML = `<p class="pit-empty">No parts tracked.</p>`;
          return;
        }
        const grid = document.createElement("div");
        grid.className = "parts-grid";

        parts.forEach((entry, i) => {
          const qty = parseInt(entry.quantity) || 0;
          const min = parseInt(entry.minStock) || 0;
          const low = qty <= min;

          const card = document.createElement("div");
          card.className = `pit-card part-card${low ? " part-card-low" : ""}${entry.flagged ? " flagged" : ""}`;
          card.innerHTML = `
                        <div class="part-card-top">
                            <input type="checkbox" class="part-flag flag-toggle" ${entry.flagged ? "checked" : ""}>
                            <input class="pit-input part-name" placeholder="Part name…" value="${escHtml(entry.name)}">
                            <button class="pit-del-btn" data-index="${i}">✕</button>
                        </div>
                        <div class="part-qty-row">
                            <div class="part-qty-block">
                                <span class="part-qty-num ${low ? "qty-low" : "qty-ok"}">${qty}</span>
                                <span class="part-qty-label">have</span>
                            </div>
                            <span class="part-divider">/</span>
                            <div class="part-qty-block">
                                <span class="part-qty-num part-qty-min">${min}</span>
                                <span class="part-qty-label">min</span>
                            </div>
                        </div>
                        ${low ? `<div class="part-low-badge">⚠ LOW STOCK</div>` : `<div class="part-ok-badge">✓ OK</div>`}
                        <div class="part-inputs-row">
                            <label class="part-micro-label">Qty<input class="pit-input part-qty-in" type="number" value="${escHtml(entry.quantity)}" min="0"></label>
                            <label class="part-micro-label">Min<input class="pit-input part-min-in" type="number" value="${escHtml(entry.minStock)}" min="0"></label>
                        </div>
                    `;

          const flagEl = card.querySelector(".part-flag");
          const nameEl = card.querySelector(".part-name");
          const qtyIn = card.querySelector(".part-qty-in");
          const minIn = card.querySelector(".part-min-in");
          const delBtn = card.querySelector(".pit-del-btn");

          flagEl.addEventListener("change", () => {
            const d = loadNoteData("parts-inventory");
            if (d[i]) {
              d[i].flagged = flagEl.checked;
              saveNoteData("parts-inventory", d);
            }
          });

          nameEl.addEventListener("input", () => {
            const d = loadNoteData("parts-inventory");
            if (d[i]) {
              d[i].name = nameEl.value;
              saveNoteData("parts-inventory", d);
            }
          });

          [qtyIn, minIn].forEach((el) => {
            el.addEventListener("change", () => {
              const d = loadNoteData("parts-inventory");
              if (d[i]) {
                d[i].quantity = qtyIn.value;
                d[i].minStock = minIn.value;
                saveNoteData("parts-inventory", d);
              }
              renderParts();
            });
          });

          delBtn.addEventListener("click", () => {
            const d = loadNoteData("parts-inventory");
            d.splice(i, 1);
            saveNoteData("parts-inventory", d);
            renderParts();
          });

          grid.appendChild(card);
        });
        body.appendChild(grid);
      };

      addBtn.addEventListener("click", () => {
        const d = loadNoteData("parts-inventory");
        d.push({ name: "", quantity: "0", minStock: "0", flagged: false });
        saveNoteData("parts-inventory", d);
        renderParts();
      });

      renderParts();

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
