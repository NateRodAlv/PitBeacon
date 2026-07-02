// src/cards/developerCardRuntime.js
export class DeveloperCardRuntime {
  constructor(registry, sdk) {
    this._registry = registry;
    this._sdk = sdk;
    this._sandboxes = new Map();
    this._editorState = {
      id: "dev-card-1",
      label: "My Custom Card",
      html: `<div class="dev-card-content">
    <h3>My Custom Card</h3>
    <p>State: <span id="stateDisplay">Loading...</span></p>
    <button id="fetchBtn">Fetch Data</button>
    <div id="result"></div>
</div>`,
      css: `.dev-card-content { padding: 8px; }
.dev-card-content h3 { margin: 0 0 6px 0; color: var(--text-primary); }
.dev-card-content p { color: var(--text-muted); }
#fetchBtn { background: var(--accent); color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
#fetchBtn:hover { background: var(--accent-hover); }`,
      js: `// Access SDK via window.__pitbeaconSDK
const sdk = window.__pitbeaconSDK;

// Subscribe to state changes
sdk.onStateChange((state) => {
    const el = document.getElementById('stateDisplay');
    if (el) el.textContent = state.currentMatch ? 
        'Match ' + state.currentMatch.comp_level + ' ' + state.currentMatch.match_number : 
        'No active match';
});

// Fetch data on button click
document.getElementById('fetchBtn')?.addEventListener('click', async function() {
    try {
        const data = await sdk.fetchDataSource('currentMatches');
        document.getElementById('result').textContent = 
            data ? 'Found ' + data.length + ' matches' : 'No data';
    } catch(e) {
        document.getElementById('result').textContent = 'Error: ' + e.message;
    }
});`,
    };
  }

  createCardDefinition(id, def) {
    return {
      id: id,
      label: def.label || id,
      icon: "code",
      developer: true,
      builtin: false,
      html: def.html,
      css: def.css,
      js: def.js,
      visualData: def.visualData,
      render: (element, state, sdk) => {
        this._renderDevCard(element, id, def, state, sdk);
      },
    };
  }

  _renderDevCard(element, id, def, state, sdk) {
    const defSignature =
      (def.html || "") + "||" + (def.css || "") + "||" + (def.js || "");
    const existing = this._sandboxes.get(id);

    if (existing && existing.defSignature === defSignature) {
      if (existing.element === element && document.contains(existing.iframe)) {
        // Same container, same code, still mounted — just push the new state
        // into the live sandbox. This is the common case (state-only refresh).
        try {
          existing.iframe.contentWindow.postMessage(
            { type: "stateUpdate", state },
            "*",
          );
        } catch (err) {
          console.warn("Failed to push state update to card sandbox:", err);
        }
        return;
      }

      if (document.contains(existing.iframe)) {
        // Same card, same code, but the caller handed us a *different*
        // container this time (e.g. the layout was rebuilt). Re-parent the
        // already-running iframe instead of creating a second one — this is
        // what keeps loop counters / variables alive across a full re-render.
        element.innerHTML = "";
        element.appendChild(existing.iframe);
        existing.element = element;
        try {
          existing.iframe.contentWindow.postMessage(
            { type: "stateUpdate", state },
            "*",
          );
        } catch (err) {
          console.warn("Failed to push state update to card sandbox:", err);
        }
        return;
      }
      // Otherwise the old iframe is gone from the DOM already — fall through
      // to a full rebuild below.
    }

    // Different code, or no live sandbox for this id — tear down whatever
    // previously existed for this id (wherever it currently lives) before
    // creating a fresh one, so we never end up with two running at once.
    if (existing && existing.cleanup) {
      existing.cleanup();
    }
    this._sandboxes.delete(id);

    element.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "width:100%;height:100%;border:none;border-radius:4px;background:var(--bg-surface);";
    iframe.sandbox = "allow-scripts allow-same-origin";
    element.appendChild(iframe);

    // Get theme colors from parent
    const computedStyle = getComputedStyle(document.documentElement);
    const themeColors = {
      "--bg-surface":
        computedStyle.getPropertyValue("--bg-surface").trim() || "#2a2a2a",
      "--bg-raised":
        computedStyle.getPropertyValue("--bg-raised").trim() || "#3a3a3a",
      "--bg-input":
        computedStyle.getPropertyValue("--bg-input").trim() || "#4a4a4a",
      "--bg-base":
        computedStyle.getPropertyValue("--bg-base").trim() || "#1a1a1a",
      "--accent":
        computedStyle.getPropertyValue("--accent").trim() || "#2f3070",
      "--accent-hover":
        computedStyle.getPropertyValue("--accent-hover").trim() || "#3c3e8c",
      "--border":
        computedStyle.getPropertyValue("--border").trim() ||
        "rgba(255,255,255,0.07)",
      "--border-accent":
        computedStyle.getPropertyValue("--border-accent").trim() ||
        "rgba(47,48,112,0.6)",
      "--text-primary":
        computedStyle.getPropertyValue("--text-primary").trim() || "#f0f0f0",
      "--text-muted":
        computedStyle.getPropertyValue("--text-muted").trim() || "#a09b9b",
      "--text-dim":
        computedStyle.getPropertyValue("--text-dim").trim() || "#646262",
    };

    // Build the sandbox document with theme colors injected
    // Use a single SDK variable and pass it to user code
    const doc = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --bg-surface: ${themeColors["--bg-surface"]};
            --bg-raised: ${themeColors["--bg-raised"]};
            --bg-input: ${themeColors["--bg-input"]};
            --bg-base: ${themeColors["--bg-base"]};
            --accent: ${themeColors["--accent"]};
            --accent-hover: ${themeColors["--accent-hover"]};
            --border: ${themeColors["--border"]};
            --border-accent: ${themeColors["--border-accent"]};
            --text-primary: ${themeColors["--text-primary"]};
            --text-muted: ${themeColors["--text-muted"]};
            --text-dim: ${themeColors["--text-dim"]};
        }
        body { 
            font-family: 'Rubik', sans-serif; 
            background: var(--bg-surface, #2a2a2a);
            color: var(--text-primary, #f0f0f0);
            padding: 8px;
            overflow: auto;
            margin: 0;
            min-height: 100vh;
        }
        ${def.css || ""}
    </style>
</head>
<body>
    ${def.html || '<div class="dev-card-content"><p>No HTML defined</p></div>'}
    <script>
        // Create SDK bridge - only declare once
        (function() {
            // SDK bridge functions
            var sdk = {
                _callbacks: [],
                _state: null,
                
                getState: function() {
                    return this._state;
                },
                
                onStateChange: function(cb) {
                    this._callbacks.push(cb);
                    if (this._state) cb(this._state);
                    return function() {
                        var idx = this._callbacks.indexOf(cb);
                        if (idx >= 0) this._callbacks.splice(idx, 1);
                    }.bind(this);
                },
                
                fetchDataSource: function(name) {
                    return new Promise(function(resolve, reject) {
                        var id = Date.now() + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'fetchResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                if (e.data.error) reject(new Error(e.data.error));
                                else resolve(e.data.data);
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({
                            type: 'fetchDataSource',
                            id: id,
                            name: name
                        }, '*');
                    });
                },
                
                triggerAlarm: function(type) {
                    window.parent.postMessage({
                        type: 'triggerAlarm',
                        alarmType: type
                    }, '*');
                },
                
                notify: function(message, type) {
                    window.parent.postMessage({
                        type: 'notify',
                        message: message,
                        notificationType: type || 'message'
                    }, '*');
                },
                
                getTeamNumber: function() {
                    return ${sdk.getTeamNumber() || 7250};
                }
            };
            
            // Store team number
            window._pitbeaconTeamNumber = ${sdk.getTeamNumber() || 7250};
            
            // Listen for state updates from parent
            window.addEventListener('message', function(e) {
                if (e.data.type === 'stateUpdate') {
                    sdk._state = e.data.state;
                    sdk._callbacks.forEach(function(cb) { cb(sdk._state); });
                }
            });
            
            // Request initial state
            window.parent.postMessage({ type: 'getState' }, '*');
            
            // Store SDK globally for user code
            window.__pitbeaconSDK = sdk;
        })();
        
        // User code - uses window.__pitbeaconSDK
        ${def.js || ""}
    <\/script>
</body>
</html>`;

    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    const messageHandler = (e) => {
      if (e.source !== iframe.contentWindow) return;
      switch (e.data.type) {
        case "getState": {
          const currentState = sdk.getState();
          iframe.contentWindow.postMessage(
            { type: "stateUpdate", state: currentState },
            "*",
          );
          break;
        }
        case "fetchDataSource":
          sdk
            .fetchDataSource(e.data.name)
            .then((data) => {
              iframe.contentWindow.postMessage(
                { type: "fetchResponse", id: e.data.id, data },
                "*",
              );
            })
            .catch((err) => {
              iframe.contentWindow.postMessage(
                { type: "fetchResponse", id: e.data.id, error: err.message },
                "*",
              );
            });
          break;
        case "triggerAlarm":
          sdk.triggerAlarm(e.data.alarmType);
          break;
        case "notify":
          sdk.notify(e.data.message, e.data.notificationType);
          break;
      }
    };
    window.addEventListener("message", messageHandler);

    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        cleanup();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const cleanup = () => {
      URL.revokeObjectURL(url);
      window.removeEventListener("message", messageHandler);
      observer.disconnect();
      this._sandboxes.delete(id);
    };
    element._cleanup = cleanup;

    this._sandboxes.set(id, { element, iframe, defSignature, cleanup });
  }

  initEditor(modal) {
    const shell = modal.querySelector(".dev-card-shell");
    const body = modal.querySelector(".dev-card-body");
    const header = modal.querySelector(".dev-card-header");
    const closeBtn = modal.querySelector(".dev-card-close");
    const idInput = modal.querySelector("#devCardId");
    const labelInput = modal.querySelector("#devCardLabel");
    const htmlInput = modal.querySelector("#devCardHTML");
    const cssInput = modal.querySelector("#devCardCSS");
    const jsInput = modal.querySelector("#devCardJS");
    const sandbox = modal.querySelector("#devCardSandbox");

    // Avoid double-initializing if this ever gets called more than once
    // on the same modal (e.g. by whatever opens it).
    if (modal._devCardInitDone) return;
    modal._devCardInitDone = true;

    // ─── Build the picker overlay (new/existing) ──────────────────────────
    const picker = document.createElement("div");
    picker.id = "devCardPicker";
    picker.className = "dc-picker";
    picker.innerHTML = `
    <div class="dc-picker-inner">
      <button class="vb-btn vb-btn-primary" id="devCardPickerNew">➕ Create New Card</button>
      <div class="dc-picker-divider">or edit an existing card</div>
      <div class="dc-picker-list" id="devCardPickerList"></div>
    </div>
  `;
    shell.insertBefore(picker, body);

    const backBtn = document.createElement("button");
    backBtn.id = "devCardBack";
    backBtn.className = "vb-btn vb-btn-sm";
    backBtn.textContent = "← Back";
    backBtn.style.display = "none";
    header.insertBefore(backBtn, closeBtn);

    const showPicker = () => {
      picker.style.display = "";
      body.style.display = "none";
      backBtn.style.display = "none";
      renderPickerList();
    };

    const showEditor = () => {
      picker.style.display = "none";
      body.style.display = "";
      backBtn.style.display = "";
    };

    const renderPickerList = () => {
      const list = modal.querySelector("#devCardPickerList");
      if (!list) return;
      list.innerHTML = "";
      const definitions = this._registry.getDefinitions();
      const entries = Object.entries(definitions).filter(
        ([, def]) => def.developer === true,
      );
      if (entries.length === 0) {
        list.innerHTML = `<p class="dc-picker-empty">No saved developer cards yet.</p>`;
        return;
      }
      entries.forEach(([id, def]) => {
        const item = document.createElement("div");
        item.className = "dc-picker-item";
        item.innerHTML = `
        <span class="dc-picker-item-label">${def.label || id}</span>
        <span class="dc-picker-item-id">#${id}</span>
      `;
        item.addEventListener("click", () => loadCard(id, def));
        list.appendChild(item);
      });
    };

    const loadCard = (id, def) => {
      idInput.value = id;
      labelInput.value = def.label || id;
      htmlInput.value = def.html || "";
      cssInput.value = def.css || "";
      jsInput.value = def.js || "";
      showEditor();
      updatePreview();
    };

    const startNew = () => {
      idInput.value = this._editorState.id;
      labelInput.value = this._editorState.label;
      htmlInput.value = this._editorState.html;
      cssInput.value = this._editorState.css;
      jsInput.value = this._editorState.js;
      showEditor();
      updatePreview();
    };

    modal
      .querySelector("#devCardPickerNew")
      .addEventListener("click", startNew);
    backBtn.addEventListener("click", showPicker);

    // ─── Auto-preview on change with debounce ─────────────────────────────
    let previewTimeout;
    const updatePreview = () => {
      clearTimeout(previewTimeout);
      previewTimeout = setTimeout(() => {
        this._previewSandbox(sandbox, {
          id: idInput.value,
          label: labelInput.value,
          html: htmlInput.value,
          css: cssInput.value,
          js: jsInput.value,
        });
      }, 500);
    };

    [idInput, labelInput, htmlInput, cssInput, jsInput].forEach((input) => {
      input.addEventListener("input", updatePreview);
    });

    // ─── Save button ────────────────────────────────────────────────────
    modal.querySelector("#devCardSave").addEventListener("click", () => {
      const id = idInput.value.trim();
      const label = labelInput.value.trim();
      if (!id) {
        if (window.displayMessage)
          window.displayMessage("Card ID is required", "error");
        else console.error("Card ID is required");
        return;
      }

      const def = {
        label: label || id,
        html: htmlInput.value,
        css: cssInput.value,
        js: jsInput.value,
        // No visualData here on purpose — see note below.
      };

      const config = {
        developerCards: JSON.parse(
          localStorage.getItem("developerCards") || "{}",
        ),
      };
      config.developerCards[id] = def;
      localStorage.setItem(
        "developerCards",
        JSON.stringify(config.developerCards),
      );

      const cardDef = this.createCardDefinition(id, def);
      cardDef.allowOverride = true; // needed to re-save over an id already in the registry
      this._registry.register(id, cardDef);

      if (window.displayMessage)
        window.displayMessage(`Card "${id}" saved!`, "message");
      modal.classList.remove("active");
      if (window._pitbeaconRender) window._pitbeaconRender();
    });

    // Test button - just updates preview
    modal
      .querySelector("#devCardTest")
      .addEventListener("click", updatePreview);

    // ─── Reset to picker every time the modal is (re)opened ──────────────
    const openObserver = new MutationObserver(() => {
      if (modal.classList.contains("active")) {
        showPicker();
      }
    });
    openObserver.observe(modal, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Initial state
    showPicker();
  }

  _previewSandbox(iframe, def) {
    const doc = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Rubik', sans-serif; 
            background: var(--bg-surface, #2a2a2a);
            color: var(--text-primary, #f0f0f0);
            padding: 8px;
            overflow: auto;
            height: 100vh;
        }
        ${def.css || ""}
    </style>
</head>
<body>
    ${def.html || '<div class="dev-card-content"><p>No HTML defined</p></div>'}
    <script>
        // Mock SDK for preview
        (function() {
            var sdk = {
                _state: { currentMatch: { comp_level: 'qm', match_number: 1 } },
                getState: function() { return this._state; },
                onStateChange: function(cb) { cb(this._state); return function() {}; },
                fetchDataSource: async function(name) {
                    if (name === 'currentMatches') return [{ comp_level: 'qm', match_number: 1 }];
                    return null;
                },
                triggerAlarm: function(type) { console.log('Alarm:', type); },
                notify: function(msg) { console.log('Notify:', msg); },
                getTeamNumber: function() { return 7250; },
            };
            window.__pitbeaconSDK = sdk;
        })();
        ${def.js || ""}
    <\/script>
</body>
</html>`;

    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    if (iframe._blobUrl) {
      URL.revokeObjectURL(iframe._blobUrl);
    }
    iframe._blobUrl = url;
  }
}
