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
    const doc = /*html*/ `
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

                getDataSourceNames: function() {
                    return new Promise(function(resolve) {
                        var id = Date.now() + '-' + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'getDataSourceNamesResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                resolve(e.data.names || []);
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({ type: 'getDataSourceNames', id: id }, '*');
                    });
                },

                fetchCustom: function(url, options) {
                    options = options || {};
                    return new Promise(function(resolve) {
                        var id = Date.now() + '-' + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'fetchCustomResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                resolve(e.data.result);
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({
                            type: 'fetchCustom',
                            id: id,
                            url: url,
                            method: options.method || 'GET',
                            headers: options.headers || {},
                            body: options.body || null,
                            timeoutMs: options.timeoutMs || 8000,
                            cacheSeconds: options.cacheSeconds || 0,
                            parseSource: options.parse ? options.parse.toString() : null
                        }, '*');
                    });
                },
                
                triggerAlarm: function(nameOrPreset) {
                    window.parent.postMessage({
                        type: 'triggerAlarm',
                        nameOrPreset: nameOrPreset
                    }, '*');
                },

                getAlarmSounds: function() {
                    return new Promise(function(resolve) {
                        var id = Date.now() + '-' + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'getAlarmSoundsResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                resolve(e.data.sounds || []);
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({ type: 'getAlarmSounds', id: id }, '*');
                    });
                },
                
                notify: function(message, type) {
                    window.parent.postMessage({
                        type: 'notify',
                        message: message,
                        notificationType: type || 'message'
                    }, '*');
                },

                storage: {
                    get: function(key) {
                        return new Promise(function(resolve) {
                            var id = Date.now() + '-' + Math.random();
                            var handler = function(e) {
                                if (e.data.type === 'storageGetResponse' && e.data.id === id) {
                                    window.removeEventListener('message', handler);
                                    resolve(e.data.value);
                                }
                            };
                            window.addEventListener('message', handler);
                            window.parent.postMessage({ type: 'storageGet', id: id, key: key }, '*');
                        });
                    },
                    set: function(key, value) {
                        return new Promise(function(resolve) {
                            var id = Date.now() + '-' + Math.random();
                            var handler = function(e) {
                                if (e.data.type === 'storageSetResponse' && e.data.id === id) {
                                    window.removeEventListener('message', handler);
                                    resolve(e.data.success);
                                }
                            };
                            window.addEventListener('message', handler);
                            window.parent.postMessage({ type: 'storageSet', id: id, key: key, value: value }, '*');
                        });
                    },
                    delete: function(key) {
                        return new Promise(function(resolve) {
                            var id = Date.now() + '-' + Math.random();
                            var handler = function(e) {
                                if (e.data.type === 'storageDeleteResponse' && e.data.id === id) {
                                    window.removeEventListener('message', handler);
                                    resolve(e.data.success);
                                }
                            };
                            window.addEventListener('message', handler);
                            window.parent.postMessage({ type: 'storageDelete', id: id, key: key }, '*');
                        });
                    }
                },

                getConfig: function() {
                    return new Promise(function(resolve) {
                        var id = Date.now() + '-' + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'getConfigResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                resolve(e.data.config || {});
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({ type: 'getConfig', id: id }, '*');
                    });
                }
            };
            
            
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
          sdk.triggerAlarm(e.data.nameOrPreset);
          break;
        case "notify":
          sdk.notify(e.data.message, e.data.notificationType);
          break;
        case "getDataSourceNames": {
          const names = sdk.getDataSourceNames();
          iframe.contentWindow.postMessage(
            { type: "getDataSourceNamesResponse", id: e.data.id, names },
            "*",
          );
          break;
        }
        case "getAlarmSounds": {
          const sounds = sdk.getAlarmSounds();
          iframe.contentWindow.postMessage(
            { type: "getAlarmSoundsResponse", id: e.data.id, sounds },
            "*",
          );
          break;
        }
        case "getConfig": {
          const config = sdk.getConfig();
          iframe.contentWindow.postMessage(
            { type: "getConfigResponse", id: e.data.id, config },
            "*",
          );
          break;
        }
        case "storageGet": {
          const value = sdk.storage.get(e.data.key);
          iframe.contentWindow.postMessage(
            { type: "storageGetResponse", id: e.data.id, value },
            "*",
          );
          break;
        }
        case "storageSet": {
          const success = sdk.storage.set(e.data.key, e.data.value);
          iframe.contentWindow.postMessage(
            { type: "storageSetResponse", id: e.data.id, success },
            "*",
          );
          break;
        }
        case "storageDelete": {
          const success = sdk.storage.delete(e.data.key);
          iframe.contentWindow.postMessage(
            { type: "storageDeleteResponse", id: e.data.id, success },
            "*",
          );
          break;
        }
        case "fetchCustom": {
          let parseFn = null;
          if (e.data.parseSource) {
            try {
              // Reconstruct the function from its source text. This runs
              // in the parent page's context, same trust level as any
              // other generated card JS — it does NOT grant the card any
              // capability it didn't already have via CUSTOM_JS blocks.
              parseFn = new Function("return (" + e.data.parseSource + ")")();
            } catch (err) {
              iframe.contentWindow.postMessage(
                {
                  type: "fetchCustomResponse",
                  id: e.data.id,
                  result: {
                    ok: false,
                    data: null,
                    error: `Invalid parse function: ${err.message}`,
                    status: null,
                  },
                },
                "*",
              );
              break;
            }
          }

          sdk
            .fetchCustom(e.data.url, {
              method: e.data.method,
              headers: e.data.headers,
              body: e.data.body,
              timeoutMs: e.data.timeoutMs,
              cacheSeconds: e.data.cacheSeconds,
              parse: parseFn,
            })
            .then((result) => {
              iframe.contentWindow.postMessage(
                { type: "fetchCustomResponse", id: e.data.id, result },
                "*",
              );
            });
          break;
        }
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
  // Add this as a new method on DeveloperCardRuntime

  _makeCodeEditor(textarea) {
    if (!textarea || textarea._ideEnhanced) return;
    textarea._ideEnhanced = true;

    const PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" };
    const CLOSERS = new Set(Object.values(PAIRS));

    const getLineStart = (value, pos) => value.lastIndexOf("\n", pos - 1) + 1;
    const getIndent = (line) => (line.match(/^[ \t]*/) || [""])[0];

    textarea.addEventListener("keydown", (e) => {
      const { value, selectionStart: start, selectionEnd: end } = textarea;
      const isCmdSave = (e.metaKey || e.ctrlKey) && e.key === "s";
      const isCmdRun = (e.metaKey || e.ctrlKey) && e.key === "Enter";

      if (isCmdSave) {
        e.preventDefault();
        const saveBtn = textarea
          .closest(".dev-card-shell")
          ?.querySelector("#devCardSave");
        saveBtn?.click();
        return;
      }
      if (isCmdRun) {
        e.preventDefault();
        const testBtn = textarea
          .closest(".dev-card-shell")
          ?.querySelector("#devCardTest");
        testBtn?.click();
        return;
      }

      // Tab / Shift+Tab — indent or dedent
      if (e.key === "Tab") {
        e.preventDefault();
        const lineStart = getLineStart(value, start);

        if (start === end && !e.shiftKey) {
          // No selection: just insert two spaces at cursor
          textarea.value = value.slice(0, start) + "  " + value.slice(end);
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        } else {
          // Selection spanning one or more lines: indent/dedent every line
          const blockEnd = end;
          const lines = value.slice(lineStart, blockEnd).split("\n");
          const changed = lines.map((line) =>
            e.shiftKey ? line.replace(/^ {1,2}/, "") : "  " + line,
          );
          const newBlock = changed.join("\n");
          textarea.value =
            value.slice(0, lineStart) + newBlock + value.slice(blockEnd);
          const delta = newBlock.length - (blockEnd - lineStart);
          textarea.selectionStart =
            lineStart === start ? start : start + (e.shiftKey ? -2 : 2);
          textarea.selectionEnd = blockEnd + delta;
        }
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      // Enter — auto-indent to match previous line, add extra indent after { [ (
      if (e.key === "Enter") {
        const lineStart = getLineStart(value, start);
        const currentLine = value.slice(lineStart, start);
        const indent = getIndent(currentLine);
        const trimmed = currentLine.trim();
        const opensBlock = /[{[(]$/.test(trimmed);
        const nextChar = value[start];
        const closesImmediately = opensBlock && CLOSERS.has(nextChar);

        e.preventDefault();
        const extra = opensBlock ? indent + "  " : indent;
        let insert = "\n" + extra;
        let cursorPos = start + insert.length;

        if (closesImmediately) {
          // Put closing bracket on its own dedented line below
          insert += "\n" + indent;
        }

        textarea.value = value.slice(0, start) + insert + value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = cursorPos;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      // Auto-close brackets/quotes
      if (PAIRS[e.key] && start === end) {
        e.preventDefault();
        const close = PAIRS[e.key];
        textarea.value =
          value.slice(0, start) + e.key + close + value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      // Skip over an auto-inserted closer instead of duplicating it
      if (CLOSERS.has(e.key) && start === end && value[start] === e.key) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        return;
      }

      // Backspace inside an empty pair removes both characters
      if (e.key === "Backspace" && start === end && start > 0) {
        const prevChar = value[start - 1];
        const nextChar = value[start];
        if (PAIRS[prevChar] === nextChar) {
          e.preventDefault();
          textarea.value = value.slice(0, start - 1) + value.slice(start + 1);
          textarea.selectionStart = textarea.selectionEnd = start - 1;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });

    textarea.spellcheck = false;
    textarea.style.tabSize = "2";
    textarea.style.fontFamily = "'Fira Code', 'Consolas', monospace";
    textarea.style.whiteSpace = "pre";
  }
  // ─── Add these methods to DeveloperCardRuntime ─────────────────────────────

  _loadCodeMirrorAssets() {
    if (this._cmAssetsPromise) return this._cmAssetsPromise;
    const BASE = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16";

    this._cmAssetsPromise = new Promise((resolve) => {
      if (window.CodeMirror) return resolve(true);

      const addCss = (href) => {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      };
      addCss(`${BASE}/codemirror.min.css`);
      addCss(`${BASE}/theme/dracula.min.css`);

      const scripts = [
        "codemirror.min.js",
        "mode/xml/xml.min.js",
        "mode/css/css.min.js",
        "mode/javascript/javascript.min.js",
        "mode/htmlmixed/htmlmixed.min.js",
        "addon/edit/closebrackets.min.js",
        "addon/edit/matchbrackets.min.js",
      ];

      let remaining = scripts.length;
      let failed = false;
      const settle = () => {
        remaining--;
        if (remaining === 0) resolve(!failed && !!window.CodeMirror);
      };

      scripts.forEach((path) => {
        const s = document.createElement("script");
        s.src = `${BASE}/${path}`;
        s.async = false;
        s.onload = settle;
        s.onerror = () => {
          failed = true;
          settle();
        };
        document.head.appendChild(s);
      });

      // Safety net: don't hang forever if a script stalls
      setTimeout(() => resolve(!!window.CodeMirror), 4000);
    });

    return this._cmAssetsPromise;
  }

  async _makeCodeEditor(textarea, mode) {
    if (!textarea || textarea._ideEnhanced) return;
    textarea._ideEnhanced = true;

    let cmReady = false;
    try {
      cmReady = await this._loadCodeMirrorAssets();
    } catch {
      cmReady = false;
    }

    if (cmReady && window.CodeMirror) {
      this._attachCodeMirror(textarea, mode);
    } else {
      this._attachFallbackEditor(textarea);
    }
  }

  _attachCodeMirror(textarea, mode) {
    const shell = () => textarea.closest(".dev-card-shell");
    const cm = window.CodeMirror.fromTextArea(textarea, {
      mode,
      theme: "dracula",
      lineNumbers: true,
      indentUnit: 2,
      tabSize: 2,
      autoCloseBrackets: true,
      matchBrackets: true,
      viewportMargin: Infinity,
      extraKeys: {
        "Cmd-S": () => shell()?.querySelector("#devCardSave")?.click(),
        "Ctrl-S": () => shell()?.querySelector("#devCardSave")?.click(),
        "Cmd-Enter": () => shell()?.querySelector("#devCardTest")?.click(),
        "Ctrl-Enter": () => shell()?.querySelector("#devCardTest")?.click(),
      },
    });
    cm.on("change", () => {
      cm.save(); // sync CodeMirror content back to the underlying textarea
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
    textarea._cm = cm;
  }

  // ─── Option A behaviors, used only when CodeMirror fails to load ──────────
  _attachFallbackEditor(textarea) {
    const PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" };
    const CLOSERS = new Set(Object.values(PAIRS));
    const getLineStart = (value, pos) => value.lastIndexOf("\n", pos - 1) + 1;
    const getIndent = (line) => (line.match(/^[ \t]*/) || [""])[0];

    textarea.addEventListener("keydown", (e) => {
      const { value, selectionStart: start, selectionEnd: end } = textarea;
      const isCmdSave = (e.metaKey || e.ctrlKey) && e.key === "s";
      const isCmdRun = (e.metaKey || e.ctrlKey) && e.key === "Enter";

      if (isCmdSave) {
        e.preventDefault();
        textarea
          .closest(".dev-card-shell")
          ?.querySelector("#devCardSave")
          ?.click();
        return;
      }
      if (isCmdRun) {
        e.preventDefault();
        textarea
          .closest(".dev-card-shell")
          ?.querySelector("#devCardTest")
          ?.click();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const lineStart = getLineStart(value, start);
        if (start === end && !e.shiftKey) {
          textarea.value = value.slice(0, start) + "  " + value.slice(end);
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        } else {
          const blockEnd = end;
          const lines = value.slice(lineStart, blockEnd).split("\n");
          const changed = lines.map((line) =>
            e.shiftKey ? line.replace(/^ {1,2}/, "") : "  " + line,
          );
          const newBlock = changed.join("\n");
          textarea.value =
            value.slice(0, lineStart) + newBlock + value.slice(blockEnd);
          const delta = newBlock.length - (blockEnd - lineStart);
          textarea.selectionStart =
            lineStart === start ? start : start + (e.shiftKey ? -2 : 2);
          textarea.selectionEnd = blockEnd + delta;
        }
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      if (e.key === "Enter") {
        const lineStart = getLineStart(value, start);
        const currentLine = value.slice(lineStart, start);
        const indent = getIndent(currentLine);
        const trimmed = currentLine.trim();
        const opensBlock = /[{[(]$/.test(trimmed);
        const nextChar = value[start];
        const closesImmediately = opensBlock && CLOSERS.has(nextChar);

        e.preventDefault();
        const extra = opensBlock ? indent + "  " : indent;
        let insert = "\n" + extra;
        const cursorPos = start + insert.length;
        if (closesImmediately) insert += "\n" + indent;

        textarea.value = value.slice(0, start) + insert + value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = cursorPos;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      if (PAIRS[e.key] && start === end) {
        e.preventDefault();
        const close = PAIRS[e.key];
        textarea.value =
          value.slice(0, start) + e.key + close + value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      if (CLOSERS.has(e.key) && start === end && value[start] === e.key) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        return;
      }

      if (e.key === "Backspace" && start === end && start > 0) {
        const prevChar = value[start - 1];
        const nextChar = value[start];
        if (PAIRS[prevChar] === nextChar) {
          e.preventDefault();
          textarea.value = value.slice(0, start - 1) + value.slice(start + 1);
          textarea.selectionStart = textarea.selectionEnd = start - 1;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });

    textarea.spellcheck = false;
    textarea.style.tabSize = "2";
    textarea.style.fontFamily = "'Fira Code', 'Consolas', monospace";
    textarea.style.whiteSpace = "pre";
  }

  // ─── Small helper so save/load code works whether CodeMirror attached or not ─
  _getEditorValue(textarea) {
    return textarea._cm ? textarea._cm.getValue() : textarea.value;
  }
  _setEditorValue(textarea, value) {
    if (textarea._cm) textarea._cm.setValue(value || "");
    else textarea.value = value || "";
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
    this._makeCodeEditor(htmlInput, "htmlmixed");
    this._makeCodeEditor(cssInput, "css");
    this._makeCodeEditor(jsInput, "javascript");

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
      [htmlInput, cssInput, jsInput].forEach((t) => t._cm?.refresh());
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
      this._setEditorValue(htmlInput, def.html);
      this._setEditorValue(cssInput, def.css);
      this._setEditorValue(jsInput, def.js);
      showEditor();
      updatePreview();
    };

    const startNew = () => {
      idInput.value = this._editorState.id;
      labelInput.value = this._editorState.label;
      this._setEditorValue(htmlInput, this._editorState.html);
      this._setEditorValue(cssInput, this._editorState.css);
      this._setEditorValue(jsInput, this._editorState.js);
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
          html: this._getEditorValue(htmlInput),
          css: this._getEditorValue(cssInput),
          js: this._getEditorValue(jsInput),
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
        html: this._getEditorValue(htmlInput),
        css: this._getEditorValue(cssInput),
        js: this._getEditorValue(jsInput),
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
    const doc = /*html*/ `
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
        // Create SDK bridge - only declare once
(function() {
            var sdk = {
                _state: { currentMatch: { comp_level: 'qm', match_number: 1 } },
                getState: function() { return this._state; },
                onStateChange: function(cb) { cb(this._state); return function() {}; },
                fetchDataSource: async function(name) {
                    if (name === 'currentMatches') return [{ comp_level: 'qm', match_number: 1 }];
                    return null;
                },
                getDataSourceNames: async function() {
                    return ['currentMatches', 'currentEventData', 'currentRankings'];
                },

              fetchCustom: async function(url, options) {
                    options = options || {};
                    console.log('[preview] fetchCustom called (mocked, no real request):', url, options);
                    var rawText = JSON.stringify({ preview: true, note: 'mocked in Preview' });
                    try {
                        var data = options.parse ? options.parse(rawText) : JSON.parse(rawText);
                        return { ok: true, data: data, error: null, status: 200 };
                    } catch (err) {
                        return { ok: false, data: null, error: 'Parse error: ' + err.message, status: 200 };
                    }
                },
                triggerAlarm: function(nameOrPreset) { console.log('Alarm:', nameOrPreset); },
                getAlarmSounds: async function() { return ['alarm1', 'alarm2', 'chime', 'buzzer']; },
                notify: function(msg) { console.log('Notify:', msg); },
                storage: {
                    _data: {},
                    get: async function(key) { return this._data[key] ?? null; },
                    set: async function(key, value) { this._data[key] = value; return true; },
                    delete: async function(key) { delete this._data[key]; return true; },
                },
                getConfig: async function() {
                    return { teamNumber: 7250, matchAlarmSound: 'alarm1', noteAlarmSound: 'chime' };
                },
            };
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

    if (iframe._blobUrl) {
      URL.revokeObjectURL(iframe._blobUrl);
    }
    iframe._blobUrl = url;
  }
}
