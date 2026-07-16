// src/ui/visualCardBuilder.js
// ─── Variable interpolation helpers (used when building generateJS output) ─
function escapeJsString(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n");
}
function interpolateExpr(str) {
  // Wraps a field value so {varname} gets resolved at runtime by the
  // interpolate() helper injected into every generated card's script.
  return `interpolate('${escapeJsString(str)}')`;
}
function substituteVarsInExpression(str) {
  // For fields that are inserted as raw JS (e.g. IF conditions), swap
  // {varname} directly for a vars[] lookup instead of wrapping in quotes.
  return String(str).replace(/\{(\w+)\}/g, (_m, name) => `vars['${name}']`);
}
export class VisualCardBuilder {
  constructor(registry, sdk, devCardRuntime) {
    this._registry = registry;
    this._sdk = sdk;
    this._devCardRuntime = devCardRuntime;
    this._elements = [];
    this._logicBlocks = [];
    this._selectedElement = null;
    this._selectedLogicBlock = null;
    this._cardData = {
      id: "visual-card-1",
      label: "My Visual Card",
      elements: [],
      logic: [],
    };
    this._nextId = 1;
    this._isDragging = false;
    this._previewIframe = null;
    this._adding = false;
    this._addingLogic = false;
    this._dropTarget = null;
  }

  // ─── Static definitions (unchanged) ─────────────────────────────────────

  static get ELEMENT_TYPES() {
    return {
      CONTAINER: {
        id: "container",
        label: "📦 Container",
        icon: "container",
        color: "#6c5ce7",
        canHaveChildren: true,
        defaultProps: {
          tag: "div",
          styles: {
            padding: "12px",
            background: "var(--bg-raised)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "div"} class="element-container ${classes}" ${idAttr} style="${style}"></${props.tag || "div"}>`;
        },
      },
      TEXT: {
        id: "text",
        label: "📝 Text",
        icon: "text",
        color: "#4a90d9",
        canHaveChildren: false,
        defaultProps: {
          tag: "p",
          content: "Hello World!",
          styles: {
            color: "var(--text-primary)",
            fontSize: "14px",
            margin: "4px 0",
          },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "p"} class="element-text ${classes}" ${idAttr} style="${style}">${props.content || ""}</${props.tag || "p"}>`;
        },
      },
      HEADING: {
        id: "heading",
        label: "📰 Heading",
        icon: "heading",
        color: "#e67e22",
        canHaveChildren: false,
        defaultProps: {
          tag: "h2",
          content: "My Heading",
          styles: {
            color: "var(--text-primary)",
            margin: "0 0 8px 0",
            fontWeight: "600",
          },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "h2"} class="element-heading ${classes}" ${idAttr} style="${style}">${props.content || ""}</${props.tag || "h2"}>`;
        },
      },
      BUTTON: {
        id: "button",
        label: "🔘 Button",
        icon: "button",
        color: "#e74c3c",
        canHaveChildren: false,
        defaultProps: {
          tag: "button",
          content: "Click Me",
          styles: {
            background: "var(--accent)",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "'Rubik', sans-serif",
            fontSize: "14px",
          },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "button"} class="element-button ${classes}" ${idAttr} style="${style}">${props.content || ""}</${props.tag || "button"}>`;
        },
      },
      IMAGE: {
        id: "image",
        label: "🖼️ Image",
        icon: "image",
        color: "#2ecc71",
        canHaveChildren: false,
        defaultProps: {
          tag: "img",
          src: "https://via.placeholder.com/200x100",
          alt: "Image",
          styles: { maxWidth: "100%", borderRadius: "6px" },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "img"} class="element-image ${classes}" ${idAttr} src="${props.src || ""}" alt="${props.alt || ""}" style="${style}" />`;
        },
      },
      INPUT: {
        id: "input",
        label: "✏️ Input",
        icon: "input",
        color: "#f39c12",
        canHaveChildren: false,
        defaultProps: {
          tag: "input",
          type: "text",
          placeholder: "Enter text...",
          styles: {
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            width: "100%",
            fontFamily: "'Rubik', sans-serif",
            fontSize: "14px",
            boxSizing: "border-box",
          },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "input"} class="element-input ${classes}" ${idAttr} type="${props.type || "text"}" placeholder="${props.placeholder || ""}" style="${style}">`;
        },
      },
      LABEL: {
        id: "label",
        label: "🏷️ Label",
        icon: "label",
        color: "#1abc9c",
        canHaveChildren: false,
        defaultProps: {
          tag: "label",
          content: "Label:",
          styles: {
            color: "var(--text-muted)",
            fontSize: "13px",
            margin: "4px 0",
            display: "block",
          },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "label"} class="element-label ${classes}" ${idAttr} style="${style}">${props.content || ""}</${props.tag || "label"}>`;
        },
      },
      SPACER: {
        id: "spacer",
        label: "⬛ Spacer",
        icon: "spacer",
        color: "#95a5a6",
        canHaveChildren: false,
        defaultProps: {
          tag: "div",
          styles: { height: "16px", width: "100%" },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "div"} class="element-spacer ${classes}" ${idAttr} style="${style}"></${props.tag || "div"}>`;
        },
      },
      ROW: {
        id: "row",
        label: "📐 Row (flex)",
        icon: "row",
        color: "#9b59b6",
        canHaveChildren: true,
        defaultProps: {
          tag: "div",
          styles: {
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            padding: "4px 0",
          },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "div"} class="element-row ${classes}" ${idAttr} style="${style}"></${props.tag || "div"}>`;
        },
      },
      COLUMN: {
        id: "column",
        label: "📋 Column (flex)",
        icon: "column",
        color: "#8e44ad",
        canHaveChildren: true,
        defaultProps: {
          tag: "div",
          styles: {
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            padding: "4px 0",
          },
          classes: [],
          id: "",
        },
        html: (props) => {
          const style = Object.entries(props.styles || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const classes = (props.classes || []).join(" ");
          const idAttr = props.id ? `id="${props.id}"` : "";
          return `<${props.tag || "div"} class="element-column ${classes}" ${idAttr} style="${style}"></${props.tag || "div"}>`;
        },
      },
    };
  }

  static get LOGIC_BLOCK_TYPES() {
    return {
      // ─── Events ──────────────────────────────
      ON_EVENT: {
        id: "on-event",
        label: "⚡ On Event",
        icon: "event",
        category: "events",
        color: "#3498db",
        shape: "hat",
        canHaveChildren: true,
        fields: [
          {
            id: "eventType",
            label: "When",
            type: "select",
            default: "click",
            options: ["load", "click", "change"],
          },
          {
            id: "elementId",
            label: "Element ID",
            type: "text",
            default: "myElement",
            showIf: (block) => (block.fields?.eventType || "click") !== "load",
          },
        ],
        generateJS: (block, childCode) => {
          const eventType = block.fields?.eventType || "click";
          if (eventType === "load") {
            return `// When card loads (once)\n(function() {\n  let hasRun = false;\n  sdk.onStateChange(async (state) => {\n    if (hasRun) return;\n    hasRun = true;\n${childCode}\n  });\n})();`;
          }
          const elId = escapeJsString(block.fields?.elementId || "myElement");
          const domEvent = eventType === "change" ? "input" : "click";
          const valueLine =
            eventType === "change" ? "    const value = e.target.value;\n" : "";
          return `// When ${eventType}\nconst el = document.getElementById('${elId}');\nif (el) {\n  el.addEventListener('${domEvent}', async function(e) {\n${valueLine}${childCode}\n  });\n}`;
        },
      },

      // ─── Control ──────────────────────────────
      IF: {
        id: "if",
        label: "❓ If Condition",
        icon: "if",
        category: "control",
        color: "#e74c3c",
        shape: "c-block",
        canHaveChildren: true,
        fields: [
          {
            id: "condition",
            label: "Condition (JS expr)",
            type: "text",
            default: "true",
          },
        ],
        generateJS: (block, childCode) => {
          const cond = block.fields?.condition || "true";
          return `if (${substituteVarsInExpression(cond)}) {\n${childCode}\n}`;
        },
      },
      REPEAT: {
        id: "repeat",
        label: "🔄 Repeat",
        icon: "loop",
        category: "control",
        color: "#9b59b6",
        shape: "c-block",
        canHaveChildren: true,
        fields: [{ id: "times", label: "Times", type: "number", default: 5 }],
        generateJS: (block, childCode) => {
          const times = block.fields?.times || 5;
          return `for (let i = 0; i < ${times}; i++) {\n${childCode}\n}`;
        },
      },
      FOR_EACH: {
        id: "for-each",
        label: "🔁 For Each Item",
        icon: "foreach",
        category: "control",
        color: "#8e44ad",
        shape: "c-block",
        canHaveChildren: true,
        fields: [
          {
            id: "listVar",
            label: "List variable",
            type: "text",
            default: "myList",
          },
          {
            id: "itemVar",
            label: "Item variable name",
            type: "text",
            default: "item",
          },
        ],
        generateJS: (block, childCode) => {
          const listVar = escapeJsString(block.fields?.listVar || "myList");
          const rawItemVar = block.fields?.itemVar || "item";
          // itemVar becomes a real JS identifier, not a string literal — validate
          // it rather than escape it, since it can't be quote-escaped safely.
          const itemVar = /^[A-Za-z_$][\w$]*$/.test(rawItemVar)
            ? rawItemVar
            : "item";
          return `for (const ${itemVar} of (vars['${listVar}'] || [])) {\n${childCode}\n}`;
        },
      },
      WAIT: {
        id: "wait",
        label: "⏳ Wait (seconds)",
        icon: "wait",
        category: "control",
        color: "#95a5a6",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          { id: "seconds", label: "Seconds", type: "number", default: 1 },
        ],
        generateJS: (block) => {
          const sec = block.fields?.seconds || 1;
          return `await new Promise(resolve => setTimeout(resolve, ${sec * 1000}));`;
        },
      },

      // ─── Data ──────────────────────────────────
      FETCH_DATA: {
        id: "fetch-data",
        label: "📊 Fetch Data",
        icon: "data",
        category: "data",
        color: "#2ecc71",
        shape: "c-block",
        canHaveChildren: true,
        fields: [
          {
            id: "sourceType",
            label: "Source",
            type: "select",
            default: "builtin",
            options: ["builtin", "custom"],
          },
          {
            id: "source",
            label: "Data Source",
            type: "select",
            default: "currentMatches",
            options: ["currentMatches", "currentEventData", "currentRankings"],
            showIf: (block) =>
              (block.fields?.sourceType || "builtin") === "builtin",
          },
          {
            id: "url",
            label: "URL (use {var}, must allow CORS)",
            type: "text",
            default: "https://",
            showIf: (block) => block.fields?.sourceType === "custom",
          },
          {
            id: "method",
            label: "Method",
            type: "select",
            default: "GET",
            options: ["GET", "POST"],
            showIf: (block) => block.fields?.sourceType === "custom",
          },
          {
            id: "headers",
            label:
              'Headers (JSON, use {var}, e.g. {"Authorization": "Bearer {apiKey}"})',
            type: "text",
            default: "",
            showIf: (block) => block.fields?.sourceType === "custom",
          },
          {
            id: "responseType",
            label: "Response format",
            type: "select",
            default: "json",
            options: ["json", "text"],
            showIf: (block) => block.fields?.sourceType === "custom",
          },
          {
            id: "variableName",
            label: "Store in variable",
            type: "text",
            default: "myData",
          },
        ],
        generateJS: (block, childCode) => {
          const sourceType = block.fields?.sourceType || "builtin";
          const varName = escapeJsString(
            block.fields?.variableName || "myData",
          );

          if (sourceType === "custom") {
            const url = block.fields?.url || "https://";
            const method = block.fields?.method || "GET";
            const responseType =
              block.fields?.responseType === "text" ? "text" : "json";
            const rawHeaders = (block.fields?.headers || "").trim();

            // Headers are optional. If provided, interpolate {var} placeholders
            // into the JSON text first, then parse at runtime — wrapped so a
            // malformed headers field fails just this fetch, not the whole card.
            const headersSetup = rawHeaders
              ? `let headers = {};\n  try {\n    headers = JSON.parse(${interpolateExpr(rawHeaders)});\n  } catch (err) {\n    console.warn('Invalid headers JSON:', err);\n  }\n  `
              : `const headers = {};\n  `;

            return `// Fetch custom endpoint\n(function() {\n  ${headersSetup}fetch(${interpolateExpr(url)}, { method: '${method}', headers })\n    .then(res => {\n      if (!res.ok) throw new Error('HTTP ' + res.status);\n      return res.${responseType}();\n    })\n    .then(data => {\n      vars['${varName}'] = data;\n${childCode}\n    })\n    .catch(err => {\n      console.warn('Custom fetch error:', err);\n      sdk.notify('Fetch failed: ' + err.message);\n    });\n})();`;
          }

          const source = block.fields?.source || "currentMatches";
          return `// Fetch data\nsdk.fetchDataSource('${escapeJsString(source)}').then(data => {\n  vars['${varName}'] = data;\n${childCode}\n}).catch(err => {\n  console.warn('Fetch error:', err);\n});`;
        },
      },
      GET_PROPERTY: {
        id: "get-property",
        label: "🔍 Get Property",
        icon: "property",
        category: "data",
        color: "#1abc9c",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          {
            id: "sourceVar",
            label: "Source variable",
            type: "text",
            default: "myData",
          },
          {
            id: "property",
            label: "Property (e.g. 'length', '0', 'name')",
            type: "text",
            default: "length",
          },
          {
            id: "targetVar",
            label: "Store in variable",
            type: "text",
            default: "myProperty",
          },
        ],
        generateJS: (block) => {
          const src = escapeJsString(block.fields?.sourceVar || "myData");
          const prop = escapeJsString(block.fields?.property || "length");
          const tgt = escapeJsString(block.fields?.targetVar || "myProperty");
          return `vars['${tgt}'] = (vars['${src}'] !== undefined) ? vars['${src}']['${prop}'] : undefined;`;
        },
      },
      GET_TEAM_NUMBER: {
        id: "get-team-number",
        label: "🏷️ Get Team Number",
        icon: "team",
        category: "data",
        color: "#f39c12",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          {
            id: "targetVar",
            label: "Store in variable",
            type: "text",
            default: "teamNum",
          },
        ],
        generateJS: (block) => {
          const tgt = escapeJsString(block.fields?.targetVar || "teamNum");
          return `vars['${tgt}'] = sdk.getTeamNumber();`;
        },
      },

      // ─── Variables ─────────────────────────────
      SET_VARIABLE: {
        id: "set-variable",
        label: "🔧 Set Variable",
        icon: "variable",
        category: "variables",
        color: "#16a085",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          {
            id: "name",
            label: "Variable name",
            type: "text",
            default: "myVar",
          },
          {
            id: "operation",
            label: "Operation",
            type: "select",
            default: "set",
            options: ["set", "add", "subtract"],
          },
          {
            id: "value",
            label: "Value (JS expr, e.g. 5, {otherVar}, true)",
            type: "text",
            default: "0",
          },
        ],
        generateJS: (block) => {
          const name = escapeJsString(block.fields?.name || "myVar");
          const op = block.fields?.operation || "set";
          const rawValue = block.fields?.value ?? "0";
          const valueExpr = substituteVarsInExpression(String(rawValue));
          if (op === "add") {
            return `vars['${name}'] = (vars['${name}'] || 0) + (${valueExpr});`;
          }
          if (op === "subtract") {
            return `vars['${name}'] = (vars['${name}'] || 0) - (${valueExpr});`;
          }
          return `vars['${name}'] = ${valueExpr};`;
        },
      },

      // ─── Display ───────────────────────────────
      UPDATE_ELEMENT: {
        id: "update-element",
        label: "📝 Update Element",
        icon: "text",
        category: "display",
        color: "#e74c3c",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          {
            id: "elementId",
            label: "Element ID",
            type: "text",
            default: "myElement",
          },
          {
            id: "target",
            label: "Update",
            type: "select",
            default: "text",
            options: ["text", "value"],
          },
          {
            id: "content",
            label: "Content (use {var})",
            type: "text",
            default: "Hello!",
          },
        ],
        generateJS: (block) => {
          const elId = escapeJsString(block.fields?.elementId || "myElement");
          const target = block.fields?.target || "text";
          const prop = target === "value" ? "value" : "textContent";
          const content = block.fields?.content ?? "";
          return `const el = document.getElementById('${elId}');\nif (el) el.${prop} = ${interpolateExpr(content)};`;
        },
      },
      SET_STYLE: {
        id: "set-style",
        label: "🎨 Set Style",
        icon: "style",
        category: "display",
        color: "#9b59b6",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          {
            id: "elementId",
            label: "Element ID",
            type: "text",
            default: "myElement",
          },
          {
            id: "property",
            label: "Property",
            type: "select",
            default: "color",
            options: ["color", "background", "fontSize", "display", "opacity"],
          },
          {
            id: "value",
            label: "Value (use {var})",
            type: "text",
            default: "red",
          },
        ],
        generateJS: (block) => {
          const elId = escapeJsString(block.fields?.elementId || "myElement");
          const prop = block.fields?.property || "color";
          const value = block.fields?.value || "red";
          return `const el = document.getElementById('${elId}');\nif (el) el.style.${prop} = ${interpolateExpr(value)};`;
        },
      },
      SHOW_HIDE: {
        id: "show-hide",
        label: "👁️ Show/Hide",
        icon: "visible",
        category: "display",
        color: "#1abc9c",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          {
            id: "elementId",
            label: "Element ID",
            type: "text",
            default: "myElement",
          },
          {
            id: "action",
            label: "Action",
            type: "select",
            default: "show",
            options: ["show", "hide", "toggle"],
          },
        ],
        generateJS: (block) => {
          const elId = escapeJsString(block.fields?.elementId || "myElement");
          const action = block.fields?.action || "show";
          return `const el = document.getElementById('${elId}');\nif (el) {\n  if ('${action}' === 'show') el.style.display = '';\n  else if ('${action}' === 'hide') el.style.display = 'none';\n  else if ('${action}' === 'toggle') {\n    el.style.display = el.style.display === 'none' ? '' : 'none';\n  }\n}`;
        },
      },

      // ─── Utilities ─────────────────────────────
      TRIGGER_ALARM: {
        id: "trigger-alarm",
        label: "🔔 Trigger Alarm",
        icon: "alarm",
        category: "utilities",
        color: "#e74c3c",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          {
            id: "type",
            label: "Alarm Type",
            type: "select",
            default: "custom",
            options: ["match", "note", "custom"],
          },
        ],
        generateJS: (block) => {
          const type = block.fields?.type || "custom";
          return `sdk.triggerAlarm('${escapeJsString(type)}');`;
        },
      },
      NOTIFY: {
        id: "notify",
        label: "💬 Show Notification",
        icon: "notify",
        category: "utilities",
        color: "#3498db",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          { id: "message", label: "Message", type: "text", default: "Hello!" },
        ],
        generateJS: (block) => {
          const msg = block.fields?.message || "Hello!";
          return `sdk.notify(${interpolateExpr(msg)});`;
        },
      },

      // ─── Advanced ──────────────────────────────
      CUSTOM_JS: {
        id: "custom-js",
        label: "⚙️ Custom JS",
        icon: "code",
        category: "advanced",
        color: "#7f8c8d",
        shape: "stack",
        canHaveChildren: false,
        fields: [
          {
            id: "code",
            label: "JavaScript (one or more lines)",
            type: "text",
            default: "// your code here",
          },
        ],
        generateJS: (block) => block.fields?.code || "",
      },
    };
  }

  // ─── Open Builder ──────────────────────────────────────────────────────

  openBuilder() {
    let modal = document.getElementById("visualBuilderModal");
    if (!modal) {
      this._createModal();
      modal = document.getElementById("visualBuilderModal");
      if (!modal) {
        console.error("Failed to create visual builder modal");
        return;
      }
    }
    modal.classList.add("active");
    this._showPicker();
  }

  _createModal() {
    const modal = document.createElement("div");
    modal.id = "visualBuilderModal";
    modal.className = "visual-builder-modal";
    modal.innerHTML = `
      <div class="vb-shell">
          <div class="vb-header">
              <h2 class="vb-title">🎨 Visual Card Builder</h2>
              <div class="vb-header-fields" id="vbHeaderFields" style="display:none;">
                  <input type="text" id="vbCardId" class="vb-header-input" placeholder="card-id" />
                  <input type="text" id="vbCardLabel" class="vb-header-input" placeholder="Card Label" />
              </div>
              <div class="vb-header-actions">
                  <button class="vb-btn vb-btn-sm" id="vbBackToPicker" style="display:none;">← Back</button>
                  <button class="vb-btn vb-btn-save" id="vbSaveCard" style="display:none;">💾 Save Card</button>
                  <button class="vb-btn vb-btn-close" id="vbClose">✕</button>
              </div>
          </div>

          <!-- Picker step -->
          <div class="vb-picker" id="vbPicker">
              <div class="vb-picker-inner">
                  <button class="vb-btn vb-btn-primary" id="vbPickerNew">➕ Create New Card</button>
                  <div class="vb-picker-divider">or edit an existing card</div>
                  <div class="vb-picker-list" id="vbPickerList"></div>
              </div>
          </div>

          <div class="vb-tabs" id="vbEditorTabs" style="display:none;">
              <button class="vb-tab active" data-tab="visual">🎨 Design</button>
              <button class="vb-tab" data-tab="logic">🧩 Logic</button>
              <button class="vb-tab" data-tab="preview">👁️ Preview</button>
              <button class="vb-tab" data-tab="code">📄 Code</button>
          </div>
          <div class="vb-body" id="vbEditorBody" style="display:none;">
              <!-- Visual Design Tab -->
              <div class="vb-tab-content active" id="vbTabVisual">
                  <div class="vb-sidebar">
                      <div class="vb-sidebar-section">
                          <div class="vb-sidebar-title">Elements</div>
                          <div class="vb-element-palette" id="vbElementPalette"></div>
                      </div>
                      <div class="vb-sidebar-section" style="flex:1;overflow:hidden;display:flex;flex-direction:column;">
                          <div class="vb-sidebar-title">Element Properties</div>
                          <div class="vb-element-properties" id="vbElementProperties">
                              <p style="color:var(--text-dim);font-size:0.8rem;font-style:italic;padding:8px;">Select an element to edit</p>
                          </div>
                      </div>
                  </div>
                  <div class="vb-canvas">
                      <div class="vb-canvas-header">
                          <span class="vb-canvas-title">Design Canvas</span>
                          <div class="vb-canvas-actions">
                              <button class="vb-btn vb-btn-sm" id="vbClearVisual">🗑️ Clear All</button>
                          </div>
                      </div>
                      <div class="vb-canvas-area" id="vbCanvasArea">
                          <div class="vb-drop-zone" id="vbDropZone">
                              <p class="vb-drop-hint">Click an element above or drag it here to add it</p>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Logic Tab -->
              <div class="vb-tab-content" id="vbTabLogic">
                  <div class="vb-sidebar">
                      <div class="vb-sidebar-section">
                          <div class="vb-sidebar-title">Logic Blocks</div>
                          <div class="vb-logic-palette" id="vbLogicPalette"></div>
                      </div>
                      <div class="vb-sidebar-section" style="flex:1;overflow:hidden;display:flex;flex-direction:column;">
                          <div class="vb-sidebar-title">Block Properties</div>
                          <div class="vb-block-properties" id="vbBlockProperties">
                              <p style="color:var(--text-dim);font-size:0.8rem;font-style:italic;padding:8px;">Select a logic block to edit</p>
                          </div>
                      </div>
                  </div>
                  <div class="vb-canvas">
                      <div class="vb-canvas-header">
                          <span class="vb-canvas-title">Logic Workspace</span>
                          <div class="vb-canvas-actions">
                              <button class="vb-btn vb-btn-sm" id="vbClearLogic">🗑️ Clear All</button>
                          </div>
                      </div>
                      <div class="vb-canvas-area" id="vbLogicArea">
                          <div class="vb-logic-workspace" id="vbLogicWorkspace">
                              <p class="vb-drop-hint">Drop logic blocks here to build your program</p>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Preview Tab -->
              <div class="vb-tab-content" id="vbTabPreview">
                  <div class="vb-preview-full">
                      <div class="vb-preview-header">
                          <span class="vb-preview-title">Card Preview</span>
                          <button class="vb-btn vb-btn-sm" id="vbRefreshPreview">🔄 Refresh</button>
                      </div>
                      <div class="vb-preview-body" id="vbPreviewBody">
                          <div style="text-align:center;color:var(--text-dim);padding:40px;">Build your card to see preview</div>
                      </div>
                  </div>
              </div>

              <!-- Code Tab -->
              <div class="vb-tab-content" id="vbTabCode">
                  <div class="vb-code-view">
                      <div class="vb-code-header">
                          <span class="vb-code-title">Generated Code</span>
                          <button class="vb-btn vb-btn-sm" id="vbCopyCode">📋 Copy</button>
                      </div>
                      <div class="vb-code-body">
                          <div class="vb-code-section">
                              <div class="vb-code-label">HTML</div>
                              <pre class="vb-code-block" id="vbCodeHTML"></pre>
                          </div>
                          <div class="vb-code-section">
                              <div class="vb-code-label">CSS</div>
                              <pre class="vb-code-block" id="vbCodeCSS"></pre>
                          </div>
                          <div class="vb-code-section">
                              <div class="vb-code-label">JavaScript</div>
                              <pre class="vb-code-block" id="vbCodeJS"></pre>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `;
    document.body.appendChild(modal);
    this._setupModalListeners(modal);
  }

  _setupModalListeners(modal) {
    // Close button
    modal.querySelector("#vbClose").addEventListener("click", () => {
      modal.classList.remove("active");
      if (this._previewIframe) {
        this._previewIframe = null;
      }
    });

    // Picker: create new
    modal.querySelector("#vbPickerNew").addEventListener("click", () => {
      this._startNewCard();
    });

    // Back to picker
    modal.querySelector("#vbBackToPicker").addEventListener("click", () => {
      this._showPicker();
    });

    // Keep _cardData in sync with the header inputs as the user types
    modal.querySelector("#vbCardId").addEventListener("input", (e) => {
      this._cardData.id = e.target.value;
    });
    modal.querySelector("#vbCardLabel").addEventListener("input", (e) => {
      this._cardData.label = e.target.value;
    });

    // Tab switching
    modal.querySelectorAll(".vb-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        modal
          .querySelectorAll(".vb-tab")
          .forEach((t) => t.classList.remove("active"));
        modal
          .querySelectorAll(".vb-tab-content")
          .forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        const tabId = tab.dataset.tab;
        document
          .getElementById(
            `vbTab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`,
          )
          .classList.add("active");
        if (tabId === "preview") {
          this._refreshPreview();
        } else if (tabId === "code") {
          this._updateCodeView();
        }
      });
    });

    // Save card
    modal.querySelector("#vbSaveCard").addEventListener("click", () => {
      this._saveCard();
    });

    // Clear visual
    modal.querySelector("#vbClearVisual").addEventListener("click", () => {
      if (confirm("Clear all visual elements?")) {
        this._cardData.elements = [];
        this._renderBuilder();
      }
    });

    // Clear logic
    modal.querySelector("#vbClearLogic").addEventListener("click", () => {
      if (confirm("Clear all logic blocks?")) {
        this._cardData.logic = [];
        this._renderLogicBuilder();
      }
    });

    // Refresh preview
    modal.querySelector("#vbRefreshPreview")?.addEventListener("click", () => {
      this._refreshPreview();
    });

    // Copy code
    modal.querySelector("#vbCopyCode")?.addEventListener("click", () => {
      const result = this._generateCardCode();
      const fullCode = `<!-- HTML -->\n${result.html}\n\n/* CSS */\n${result.css}\n\n/* JavaScript */\n${result.js}`;
      navigator.clipboard
        .writeText(fullCode)
        .then(() => {
          if (window.displayMessage)
            window.displayMessage("Code copied to clipboard!", "message");
        })
        .catch(() => {
          const textarea = document.createElement("textarea");
          textarea.value = fullCode;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          if (window.displayMessage)
            window.displayMessage("Code copied to clipboard!", "message");
        });
    });
  }

  // ─── Visual Builder ────────────────────────────────────────────────────

  _renderBuilder() {
    this._renderElementPalette();
    this._renderCanvas();
    this._updateElementProperties();
  }
  _showPicker() {
    const picker = document.getElementById("vbPicker");
    const tabs = document.getElementById("vbEditorTabs");
    const body = document.getElementById("vbEditorBody");
    const headerFields = document.getElementById("vbHeaderFields");
    const backBtn = document.getElementById("vbBackToPicker");
    const saveBtn = document.getElementById("vbSaveCard");
    if (!picker || !tabs || !body) return;

    picker.style.display = "";
    tabs.style.display = "none";
    body.style.display = "none";
    if (headerFields) headerFields.style.display = "none";
    if (backBtn) backBtn.style.display = "none";
    if (saveBtn) saveBtn.style.display = "none";

    this._renderPickerList();
  }

  _renderPickerList() {
    const list = document.getElementById("vbPickerList");
    if (!list) return;
    list.innerHTML = "";

    const definitions = this._registry.getDefinitions();
    const editableEntries = Object.entries(definitions).filter(
      ([, def]) => def.developer === true,
    );

    if (editableEntries.length === 0) {
      list.innerHTML = `<p style="color:var(--text-dim);font-size:0.85rem;font-style:italic;padding:8px;">No saved developer cards yet.</p>`;
      return;
    }

    editableEntries.forEach(([id, def]) => {
      const hasVisualData = !!def.visualData;
      const item = document.createElement("div");
      item.className =
        "vb-picker-item" + (hasVisualData ? "" : " vb-picker-item-disabled");
      item.innerHTML = `
      <span class="vb-picker-item-label">${def.label || id}</span>
      <span class="vb-picker-item-id">#${id}</span>
      ${hasVisualData ? "" : `<span class="vb-picker-item-badge" title="Created outside the Visual Builder — edit it in the Code editor instead">raw code only</span>`}
    `;
      item.addEventListener("click", () => this._loadCardForEditing(id, def));
      list.appendChild(item);
    });
  }

  _loadCardForEditing(id, def) {
    if (!def.visualData) {
      if (window.displayMessage)
        window.displayMessage(
          `"${def.label || id}" wasn't created in the Visual Builder and can't be loaded here — edit it in the Code editor instead.`,
          "error",
        );
      return;
    }

    this._cardData = {
      id,
      label: def.label || id,
      elements: JSON.parse(JSON.stringify(def.visualData.elements || [])),
      logic: JSON.parse(JSON.stringify(def.visualData.logic || [])),
    };

    // ─── Repair parent-child relationships ───
    const allIds = new Set(this._cardData.logic.map((b) => b.id));
    for (const block of this._cardData.logic) {
      if (block.parentId && !allIds.has(block.parentId)) {
        block.parentId = null; // orphan → top-level
      }
    }

    // Remove duplicate entries (if any) by keeping last occurrence?
    // We'll just warn, but we can also deduplicate by id.
    const seen = new Set();
    this._cardData.logic = this._cardData.logic.filter((b) => {
      if (seen.has(b.id)) {
        console.warn(`Duplicate block id ${b.id} removed`);
        return false;
      }
      seen.add(b.id);
      return true;
    });

    // Keep _nextId ahead of every id already used in this card so new
    // elements/blocks can't collide with ones loaded from storage.
    const used = [];
    const scan = (arr) =>
      arr.forEach((item) => {
        const m = /-(\d+)$/.exec(item.id || "");
        if (m) used.push(parseInt(m[1], 10));
      });
    scan(this._cardData.elements);
    scan(this._cardData.logic);
    this._nextId = used.length ? Math.max(...used) + 1 : 1;

    this._selectedElement = null;
    this._selectedLogicBlock = null;
    this._enterEditor();
  }

  _startNewCard() {
    this._cardData = {
      id: `visual-card-${Date.now()}`,
      label: "My Visual Card",
      elements: [],
      logic: [],
    };
    this._nextId = 1;
    this._selectedElement = null;
    this._selectedLogicBlock = null;
    this._enterEditor();
  }

  _enterEditor() {
    const picker = document.getElementById("vbPicker");
    const tabs = document.getElementById("vbEditorTabs");
    const body = document.getElementById("vbEditorBody");
    const headerFields = document.getElementById("vbHeaderFields");
    const backBtn = document.getElementById("vbBackToPicker");
    const saveBtn = document.getElementById("vbSaveCard");

    if (picker) picker.style.display = "none";
    if (tabs) tabs.style.display = "";
    if (body) body.style.display = "";
    if (headerFields) headerFields.style.display = "";
    if (backBtn) backBtn.style.display = "";
    if (saveBtn) saveBtn.style.display = "";

    const idInput = document.getElementById("vbCardId");
    const labelInput = document.getElementById("vbCardLabel");
    if (idInput) idInput.value = this._cardData.id;
    if (labelInput) labelInput.value = this._cardData.label;

    this._renderBuilder();
    this._renderLogicBuilder();
  }
  _renderElementPalette() {
    const palette = document.getElementById("vbElementPalette");
    if (!palette) return;
    palette.innerHTML = "";
    const elementTypes = VisualCardBuilder.ELEMENT_TYPES;
    const grid = document.createElement("div");
    grid.className = "vb-palette-grid";
    for (const [key, type] of Object.entries(elementTypes)) {
      const item = document.createElement("div");
      item.className = "vb-palette-item";
      item.style.borderLeftColor = type.color;
      item.innerHTML = `
                <span class="vb-palette-icon">${type.icon}</span>
                <span class="vb-palette-label">${type.label}</span>
            `;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this._addElement(key);
      });
      item.draggable = true;
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("elementType", key);
        e.dataTransfer.effectAllowed = "copy";
      });
      grid.appendChild(item);
    }
    palette.appendChild(grid);
  }

  _renderCanvas() {
    const dropZone = document.getElementById("vbDropZone");
    if (!dropZone) return;
    while (dropZone.firstChild) dropZone.removeChild(dropZone.firstChild);

    if (!this._cardData.elements || this._cardData.elements.length === 0) {
      dropZone.innerHTML = `<p class="vb-drop-hint">Click an element above or drag it here to add it</p>`;
      dropZone.classList.add("vb-drop-zone-active");
      this._setupVisualDropZone(dropZone, null);
      return;
    }

    dropZone.classList.remove("vb-drop-zone-active");
    // Render top-level elements (no parent)
    const topLevel = this._cardData.elements.filter((el) => !el.parentId);
    topLevel.forEach((element, index) => {
      const el = this._renderVisualElement(element, index, dropZone);
      if (el) dropZone.appendChild(el);
    });
    this._setupVisualDropZone(dropZone, null);
  }

  _renderVisualElement(element, index, parentElement) {
    const type = VisualCardBuilder.ELEMENT_TYPES[element.type];
    if (!type) return null;

    const el = document.createElement("div");
    el.className = "vb-element";
    el.dataset.elementId = element.id;
    el.dataset.index = index;

    const previewHTML = type.html(element.props || {});

    const canHaveChildren = type.canHaveChildren || false;

    el.innerHTML = `
            <div class="vb-element-header">
                <span class="vb-element-icon">${type.icon}</span>
                <span class="vb-element-label">${type.label}</span>
                <span class="vb-element-id">#${element.props?.id || "no-id"}</span>
                <span class="vb-element-actions">
                    <button class="vb-element-btn vb-element-duplicate" title="Duplicate">📋</button>
                    <button class="vb-element-btn vb-element-delete" title="Delete">✕</button>
                    <button class="vb-element-btn vb-element-move-up" title="Move Up">↑</button>
                    <button class="vb-element-btn vb-element-move-down" title="Move Down">↓</button>
                </span>
            </div>
            <div class="vb-element-preview">
                ${previewHTML}
            </div>
            ${canHaveChildren ? `<div class="vb-element-children" data-parent-id="${element.id}"><p class="vb-element-child-hint">Drop elements here</p></div>` : ""}
        `;

    // Selection
    el.addEventListener("click", (e) => {
      if (e.target.closest(".vb-element-btn")) return;
      e.stopPropagation();
      this._selectedElement = element;
      this._updateElementProperties();
      document
        .querySelectorAll(".vb-element")
        .forEach((e) => e.classList.remove("selected"));
      el.classList.add("selected");
    });
    el.draggable = true;

    el.addEventListener("dragstart", (e) => {
      if (e.target.closest(".vb-element-btn")) {
        e.preventDefault();
        return;
      }
      e.stopPropagation();
      e.dataTransfer.setData("moveElementId", element.id);
      e.dataTransfer.effectAllowed = "move";
      el.classList.add("dragging");
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      document
        .querySelectorAll(".vb-element")
        .forEach((e) => e.classList.remove("drop-before", "drop-after"));
    });

    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      const rect = el.getBoundingClientRect();
      const isBefore = e.clientY - rect.top < rect.height / 2;
      el.classList.toggle("drop-before", isBefore);
      el.classList.toggle("drop-after", !isBefore);
    });

    el.addEventListener("dragleave", (e) => {
      const related = e.relatedTarget;
      if (!related || !el.contains(related)) {
        el.classList.remove("drop-before", "drop-after");
      }
    });

    el.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isBefore = el.classList.contains("drop-before");
      el.classList.remove("drop-before", "drop-after");

      const movedId = e.dataTransfer.getData("moveElementId");
      if (movedId) {
        this._moveVisualElement(
          movedId,
          element.id,
          isBefore ? "before" : "after",
        );
        return;
      }

      const elementType = e.dataTransfer.getData("elementType");
      if (elementType) {
        const type = VisualCardBuilder.ELEMENT_TYPES[elementType];
        if (type) {
          const id = `el-${this._nextId++}`;
          const newElement = {
            id,
            type: elementType,
            props: JSON.parse(JSON.stringify(type.defaultProps || {})),
            parentId: element.parentId || null,
          };
          newElement.props.id = id;
          this._cardData.elements.push(newElement);
          this._moveVisualElement(
            id,
            element.id,
            isBefore ? "before" : "after",
          );
          if (window.displayMessage)
            window.displayMessage(`Added ${type.label}`, "message");
        }
      }
    });
    // Delete
    const delBtn = el.querySelector(".vb-element-delete");
    if (delBtn) {
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = element.id;
        this._removeVisualElementAndChildren(id);
        this._renderBuilder();
        if (window.displayMessage)
          window.displayMessage("Element deleted", "message");
      });
    }

    // Duplicate
    const dupBtn = el.querySelector(".vb-element-duplicate");
    if (dupBtn) {
      dupBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const newEl = JSON.parse(JSON.stringify(element));
        const newId = `el-${this._nextId++}`;
        newEl.id = newId;
        newEl.props.id = newId;
        newEl.parentId = element.parentId || null;
        this._cardData.elements.push(newEl);
        this._renderBuilder();
        if (window.displayMessage)
          window.displayMessage("Element duplicated", "message");
      });
    }

    // Move up/down (only within same parent)
    const upBtn = el.querySelector(".vb-element-move-up");
    const downBtn = el.querySelector(".vb-element-move-down");
    if (upBtn) {
      upBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const siblings = this._cardData.elements.filter(
          (el) => el.parentId === element.parentId,
        );
        const idx = siblings.indexOf(element);
        if (idx > 0) {
          const prev = siblings[idx - 1];
          const i1 = this._cardData.elements.indexOf(element);
          const i2 = this._cardData.elements.indexOf(prev);
          [this._cardData.elements[i1], this._cardData.elements[i2]] = [
            this._cardData.elements[i2],
            this._cardData.elements[i1],
          ];
          this._renderBuilder();
        }
      });
    }
    if (downBtn) {
      downBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const siblings = this._cardData.elements.filter(
          (el) => el.parentId === element.parentId,
        );
        const idx = siblings.indexOf(element);
        if (idx < siblings.length - 1) {
          const next = siblings[idx + 1];
          const i1 = this._cardData.elements.indexOf(element);
          const i2 = this._cardData.elements.indexOf(next);
          [this._cardData.elements[i1], this._cardData.elements[i2]] = [
            this._cardData.elements[i2],
            this._cardData.elements[i1],
          ];
          this._renderBuilder();
        }
      });
    }

    // Render children
    if (canHaveChildren) {
      const childContainer = el.querySelector(".vb-element-children");
      const children = this._cardData.elements.filter(
        (el) => el.parentId === element.id,
      );
      if (children.length) {
        const hint = childContainer.querySelector(".vb-element-child-hint");
        if (hint) hint.remove();
        children.forEach((child, idx) => {
          const childEl = this._renderVisualElement(child, idx, childContainer);
          if (childEl) childContainer.appendChild(childEl);
        });
      }
      this._setupVisualDropZone(childContainer, element.id);
    }

    return el;
  }
  _isSameOrDescendant(id, ancestorId) {
    if (id === ancestorId) return true;
    let current = this._cardData.elements.find((el) => el.id === id);
    while (current && current.parentId) {
      if (current.parentId === ancestorId) return true;
      current = this._cardData.elements.find(
        (el) => el.id === current.parentId,
      );
    }
    return false;
  }

  _moveVisualElement(movedId, targetId, position) {
    if (movedId === targetId) return;
    const moved = this._cardData.elements.find((el) => el.id === movedId);
    const target = this._cardData.elements.find((el) => el.id === targetId);
    if (!moved || !target) return;
    // Refuse to drop an element onto itself or one of its own children
    if (this._isSameOrDescendant(targetId, movedId)) return;

    moved.parentId = target.parentId || null;

    const fromIndex = this._cardData.elements.indexOf(moved);
    this._cardData.elements.splice(fromIndex, 1);

    let targetIndex = this._cardData.elements.indexOf(target);
    if (position === "after") targetIndex += 1;
    this._cardData.elements.splice(targetIndex, 0, moved);

    this._renderBuilder();
  }

  _moveVisualElementToParent(movedId, newParentId) {
    if (movedId === newParentId) return;
    const moved = this._cardData.elements.find((el) => el.id === movedId);
    if (!moved) return;
    if (newParentId && this._isSameOrDescendant(newParentId, movedId)) return;

    moved.parentId = newParentId || null;
    const fromIndex = this._cardData.elements.indexOf(moved);
    this._cardData.elements.splice(fromIndex, 1);
    this._cardData.elements.push(moved); // append as last child of newParentId
    this._renderBuilder();
  }
  _removeVisualElementAndChildren(id) {
    const toRemove = new Set();
    toRemove.add(id);
    let found = true;
    while (found) {
      found = false;
      for (const el of this._cardData.elements) {
        if (el.parentId && toRemove.has(el.parentId) && !toRemove.has(el.id)) {
          toRemove.add(el.id);
          found = true;
        }
      }
    }
    this._cardData.elements = this._cardData.elements.filter(
      (el) => !toRemove.has(el.id),
    );
    if (this._selectedElement && toRemove.has(this._selectedElement.id)) {
      this._selectedElement = null;
    }
  }

  _setupVisualDropZone(container, parentId) {
    if (!container) return;
    container.dataset.parentId =
      parentId !== null && parentId !== undefined ? parentId : "";

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      container.classList.add("drag-over");
      const hint = container.querySelector(".vb-element-child-hint");
      if (hint) hint.style.display = "none";
    });

    container.addEventListener("dragleave", (e) => {
      e.stopPropagation();
      const related = e.relatedTarget;
      if (!related || !container.contains(related)) {
        container.classList.remove("drag-over");
        const hint = container.querySelector(".vb-element-child-hint");
        if (hint) hint.style.display = "";
      }
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.remove("drag-over");
      const elementType = e.dataTransfer.getData("elementType");
      if (elementType) {
        const targetParentId = container.dataset.parentId || null;
        this._addElement(elementType, targetParentId);
      }
    });
  }

  _addElement(elementType, parentId = null) {
    if (this._adding) return;
    this._adding = true;
    const type = VisualCardBuilder.ELEMENT_TYPES[elementType];
    if (!type) {
      this._adding = false;
      return;
    }

    const id = `el-${this._nextId++}`;
    const newElement = {
      id: id,
      type: elementType,
      props: JSON.parse(JSON.stringify(type.defaultProps || {})),
      parentId: parentId || null,
    };
    newElement.props.id = id;

    this._cardData.elements.push(newElement);
    this._renderBuilder();
    this._selectedElement = newElement;
    this._updateElementProperties();
    if (window.displayMessage)
      window.displayMessage(`Added ${type.label}`, "message");
    setTimeout(() => {
      this._adding = false;
    }, 200);
  }

  _updateElementProperties() {
    const container = document.getElementById("vbElementProperties");
    if (!container) return;
    container.innerHTML = "";

    if (!this._selectedElement) {
      container.innerHTML = `<p style="color:var(--text-dim);font-size:0.8rem;font-style:italic;padding:8px;">Select an element to edit</p>`;
      return;
    }

    const element = this._selectedElement;
    const props = element.props || (element.props = {});

    const addRow = (labelText, inputEl) => {
      const row = document.createElement("div");
      row.className = "vb-prop-row";
      const label = document.createElement("label");
      label.className = "vb-prop-label";
      label.textContent = labelText;
      row.appendChild(label);
      row.appendChild(inputEl);
      container.appendChild(row);
    };

    const idInput = document.createElement("input");
    idInput.type = "text";
    idInput.className = "vb-prop-input";
    idInput.value = props.id || "";
    idInput.addEventListener("input", (e) => {
      props.id = e.target.value;
      this._renderCanvas();
    });
    addRow("Element ID", idInput);

    if ("content" in props) {
      const contentInput = document.createElement("textarea");
      contentInput.className = "vb-prop-input";
      contentInput.rows = 2;
      contentInput.value = props.content || "";
      contentInput.addEventListener("input", (e) => {
        props.content = e.target.value;
        this._renderCanvas();
      });
      addRow("Content", contentInput);
    }

    if (element.type === "IMAGE") {
      const srcInput = document.createElement("input");
      srcInput.type = "text";
      srcInput.className = "vb-prop-input";
      srcInput.value = props.src || "";
      srcInput.addEventListener("input", (e) => {
        props.src = e.target.value;
        this._renderCanvas();
      });
      addRow("Image URL", srcInput);

      const altInput = document.createElement("input");
      altInput.type = "text";
      altInput.className = "vb-prop-input";
      altInput.value = props.alt || "";
      altInput.addEventListener("input", (e) => {
        props.alt = e.target.value;
        this._renderCanvas();
      });
      addRow("Alt Text", altInput);
    }

    if (element.type === "INPUT") {
      const typeSelect = document.createElement("select");
      typeSelect.className = "vb-prop-input";
      ["text", "number", "email", "password", "checkbox", "date"].forEach(
        (t) => {
          const opt = document.createElement("option");
          opt.value = t;
          opt.textContent = t;
          if (props.type === t) opt.selected = true;
          typeSelect.appendChild(opt);
        },
      );
      typeSelect.addEventListener("change", (e) => {
        props.type = e.target.value;
        this._renderCanvas();
      });
      addRow("Input Type", typeSelect);

      const placeholderInput = document.createElement("input");
      placeholderInput.type = "text";
      placeholderInput.className = "vb-prop-input";
      placeholderInput.value = props.placeholder || "";
      placeholderInput.addEventListener("input", (e) => {
        props.placeholder = e.target.value;
        this._renderCanvas();
      });
      addRow("Placeholder", placeholderInput);
    }

    const stylesTitle = document.createElement("div");
    stylesTitle.className = "vb-sidebar-title";
    stylesTitle.style.marginTop = "12px";
    stylesTitle.textContent = "Styles";
    container.appendChild(stylesTitle);

    props.styles = props.styles || {};
    Object.entries(props.styles).forEach(([key, value]) => {
      const row = document.createElement("div");
      row.className = "vb-prop-row vb-prop-style-row";

      const keyInput = document.createElement("input");
      keyInput.type = "text";
      keyInput.className = "vb-prop-input vb-prop-style-key";
      keyInput.value = key;
      keyInput.addEventListener("change", (e) => {
        const newKey = e.target.value;
        if (newKey && newKey !== key) {
          props.styles[newKey] = props.styles[key];
          delete props.styles[key];
        }
        this._updateElementProperties();
        this._renderCanvas();
      });

      const valueInput = document.createElement("input");
      valueInput.type = "text";
      valueInput.className = "vb-prop-input vb-prop-style-value";
      valueInput.value = value;
      valueInput.addEventListener("input", (e) => {
        props.styles[key] = e.target.value;
        this._renderCanvas();
      });

      const removeBtn = document.createElement("button");
      removeBtn.className = "vb-element-btn";
      removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", () => {
        delete props.styles[key];
        this._updateElementProperties();
        this._renderCanvas();
      });

      row.appendChild(keyInput);
      row.appendChild(valueInput);
      row.appendChild(removeBtn);
      container.appendChild(row);
    });

    const addStyleBtn = document.createElement("button");
    addStyleBtn.className = "vb-btn vb-btn-sm";
    addStyleBtn.textContent = "+ Add Style";
    addStyleBtn.style.marginTop = "6px";
    addStyleBtn.addEventListener("click", () => {
      props.styles["newProperty"] = "";
      this._updateElementProperties();
    });
    container.appendChild(addStyleBtn);
  }

  // ─── Logic Builder ────────────────────────────────────────────────────

  _renderLogicBuilder() {
    this._renderLogicPalette();
    this._renderLogicWorkspace();
    this._updateBlockProperties();
  }

  _renderLogicPalette() {
    const palette = document.getElementById("vbLogicPalette");
    if (!palette) return;
    palette.innerHTML = "";
    const logicTypes = VisualCardBuilder.LOGIC_BLOCK_TYPES;
    const categories = {};
    for (const [key, block] of Object.entries(logicTypes)) {
      if (!categories[block.category]) categories[block.category] = [];
      categories[block.category].push({ key, ...block });
    }
    for (const [category, blocks] of Object.entries(categories)) {
      const section = document.createElement("div");
      section.className = "vb-palette-category";
      section.innerHTML = `<div class="vb-palette-category-title">${category.charAt(0).toUpperCase() + category.slice(1)}</div>`;
      const grid = document.createElement("div");
      grid.className = "vb-palette-grid";
      blocks.forEach((block) => {
        const item = document.createElement("div");
        item.className = "vb-palette-item";
        item.style.borderLeftColor = block.color;
        item.draggable = true;
        item.dataset.logicType = block.key;
        item.innerHTML = `
                    <span class="vb-palette-icon">${block.icon}</span>
                    <span class="vb-palette-label">${block.label}</span>
                `;
        item.addEventListener("click", () => this._addLogicBlock(block.key));
        item.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("logicType", block.key);
          e.dataTransfer.effectAllowed = "copy";
        });
        grid.appendChild(item);
      });
      section.appendChild(grid);
      palette.appendChild(section);
    }
  }
  // Decides whether a drop near this block should nest inside it (if it can
  // have children and the pointer is near its vertical center) or just insert
  // before/after it as a sibling. Previously this hit-test was duplicated
  // verbatim in two branches of the drop handler.
  _getLogicDropIntent(e, el, blockType) {
    const rect = el.getBoundingClientRect();
    const relativeY = (e.clientY - rect.top) / rect.height;
    const canNest =
      (blockType.canHaveChildren || false) &&
      relativeY > 0.25 &&
      relativeY < 0.75;
    const isBefore = relativeY < 0.5;
    return { canNest, isBefore };
  }
  _renderLogicWorkspace() {
    const workspace = document.getElementById("vbLogicWorkspace");
    if (!workspace) return;
    while (workspace.firstChild) workspace.removeChild(workspace.firstChild);

    const topLevel = this._cardData.logic.filter((b) => !b.parentId);
    if (topLevel.length === 0) {
      workspace.innerHTML = `<p class="vb-drop-hint">Click a logic block above or drag it here</p>`;
      workspace.classList.add("vb-drop-zone-active");
      this._setupLogicDropZone(workspace, null);
      return;
    }

    workspace.classList.remove("vb-drop-zone-active");
    topLevel.forEach((block, index) => {
      const el = this._renderLogicBlock(block, index, workspace);
      if (el) workspace.appendChild(el);
    });
    this._setupLogicDropZone(workspace, null);
  }

  _renderLogicBlock(block, index, parentElement) {
    const blockType = VisualCardBuilder.LOGIC_BLOCK_TYPES[block.type];
    if (!blockType) return null;

    const el = document.createElement("div");
    el.className = "vb-logic-block";
    el.style.borderLeftColor = blockType.color;
    el.dataset.blockId = block.id;
    el.dataset.index = index;

    let fieldsDisplay = "";
    if (block.fields) {
      const fieldEntries = Object.entries(block.fields).filter(
        ([_, v]) => v !== "",
      );
      if (fieldEntries.length) {
        fieldsDisplay = fieldEntries
          .map(
            ([key, value]) =>
              `<span class="vb-logic-field"><span class="vb-logic-field-label">${key}:</span> <span class="vb-logic-field-value">${value}</span></span>`,
          )
          .join(" ");
      }
    }

    const canHaveChildren = blockType.canHaveChildren || false;

    el.innerHTML = `
            <div class="vb-logic-header">
                <span class="vb-logic-icon">${blockType.icon}</span>
                <span class="vb-logic-label">${blockType.label}</span>
                <span class="vb-logic-fields">${fieldsDisplay}</span>
                <span class="vb-logic-actions">
                    <button class="vb-logic-btn vb-logic-delete" data-block-id="${block.id}" title="Delete">✕</button>
                </span>
            </div>
            ${canHaveChildren ? `<div class="vb-logic-children" data-parent-id="${block.id}" style="min-height:40px;padding:8px;border:2px dashed transparent;border-radius:4px;transition:border-color 0.2s,background 0.2s;"><p class="vb-logic-child-hint" style="color:var(--text-dim);font-size:0.7rem;font-style:italic;text-align:center;margin:4px 0;">Drop blocks here</p></div>` : ""}
        `;

    el.addEventListener("click", (e) => {
      if (e.target.closest(".vb-logic-btn")) return;
      e.stopPropagation();
      this._selectedLogicBlock = block;
      this._updateBlockProperties();
      document
        .querySelectorAll(".vb-logic-block")
        .forEach((e) => e.classList.remove("selected"));
      el.classList.add("selected");
    });
    el.draggable = true;

    el.addEventListener("dragstart", (e) => {
      if (e.target.closest(".vb-logic-btn")) {
        e.preventDefault();
        return;
      }
      e.stopPropagation();
      e.dataTransfer.setData("moveLogicBlockId", block.id);
      e.dataTransfer.effectAllowed = "move";
      el.classList.add("dragging");
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      document
        .querySelectorAll(".vb-logic-block")
        .forEach((e) => e.classList.remove("drop-before", "drop-after"));
    });

    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      const { canNest, isBefore } = this._getLogicDropIntent(e, el, blockType);
      el.classList.toggle("drop-inside", canNest);
      el.classList.toggle("drop-before", !canNest && isBefore);
      el.classList.toggle("drop-after", !canNest && !isBefore);
    });

    el.addEventListener("dragleave", (e) => {
      const related = e.relatedTarget;
      if (!related || !el.contains(related)) {
        el.classList.remove("drop-before", "drop-after", "drop-inside");
      }
    });

    el.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { canNest, isBefore } = this._getLogicDropIntent(e, el, blockType);
      el.classList.remove("drop-before", "drop-after", "drop-inside");

      const movedId = e.dataTransfer.getData("moveLogicBlockId");
      if (movedId) {
        if (canNest) {
          if (!this._isSameOrDescendantLogic(movedId, block.id)) {
            this._moveLogicBlockToParent(movedId, block.id);
            if (window.displayMessage)
              window.displayMessage("Moved block inside", "message");
          } else if (window.displayMessage) {
            window.displayMessage("Cannot move into itself", "error");
          }
        } else {
          this._moveLogicBlock(
            movedId,
            block.id,
            isBefore ? "before" : "after",
          );
          if (window.displayMessage)
            window.displayMessage("Moved block", "message");
        }
        return;
      }

      const logicType = e.dataTransfer.getData("logicType");
      if (logicType) {
        const type = VisualCardBuilder.LOGIC_BLOCK_TYPES[logicType];
        if (!type) return;

        if (canNest) {
          const newBlock = {
            id: `logic-${this._nextId++}`,
            type: logicType,
            fields: {},
            parentId: block.id,
          };
          (type.fields || []).forEach((field) => {
            newBlock.fields[field.id] = field.default || "";
          });
          this._cardData.logic.push(newBlock);
          this._renderLogicBuilder();
          if (window.displayMessage)
            window.displayMessage(`Added ${type.label} inside`, "message");
        } else {
          const newBlock = {
            id: `logic-${this._nextId++}`,
            type: logicType,
            fields: {},
            parentId: block.parentId || null,
          };
          (type.fields || []).forEach((field) => {
            newBlock.fields[field.id] = field.default || "";
          });
          this._cardData.logic.push(newBlock);
          this._moveLogicBlock(
            newBlock.id,
            block.id,
            isBefore ? "before" : "after",
          );
          if (window.displayMessage)
            window.displayMessage(`Added ${type.label}`, "message");
        }
      }
    });

    // Delete - using data attribute and event listener directly
    const delBtn = el.querySelector(".vb-logic-delete");
    if (delBtn) {
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const blockId = delBtn.dataset.blockId;
        if (blockId) {
          this._removeBlockAndChildren(blockId);
          this._renderLogicBuilder();
          if (window.displayMessage)
            window.displayMessage("Logic block deleted", "message");
        }
      });
    }

    if (canHaveChildren) {
      const childContainer = el.querySelector(".vb-logic-children");
      const children = this._cardData.logic.filter(
        (b) => b.parentId === block.id,
      );
      if (children.length) {
        const hint = childContainer.querySelector(".vb-logic-child-hint");
        if (hint) hint.remove();
        children.forEach((child, idx) => {
          const childEl = this._renderLogicBlock(child, idx, childContainer);
          if (childEl) childContainer.appendChild(childEl);
        });
      }
      this._setupLogicDropZone(childContainer, block.id);
    }

    return el;
  }

  _removeBlockAndChildren(blockId) {
    const toRemove = new Set();
    toRemove.add(blockId);
    let found = true;
    while (found) {
      found = false;
      for (const b of this._cardData.logic) {
        if (b.parentId && toRemove.has(b.parentId) && !toRemove.has(b.id)) {
          toRemove.add(b.id);
          found = true;
        }
      }
    }
    this._cardData.logic = this._cardData.logic.filter(
      (b) => !toRemove.has(b.id),
    );
    if (this._selectedLogicBlock && toRemove.has(this._selectedLogicBlock.id)) {
      this._selectedLogicBlock = null;
    }
  }
  _setupLogicDropZone(container, parentId) {
    if (!container) return;
    container.dataset.parentId =
      parentId !== null && parentId !== undefined ? parentId : "";

    // Remove any existing listeners to avoid duplicates
    container.removeEventListener("dragover", this._logicDragOverHandler);
    container.removeEventListener("dragleave", this._logicDragLeaveHandler);
    container.removeEventListener("drop", this._logicDropHandler);

    // Store bound handlers so we can remove them later if needed
    this._logicDragOverHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      container.classList.add("drag-over");
      // Visual feedback
      container.style.borderColor = "var(--accent)";
      container.style.background = "rgba(47,48,112,0.08)";
      const hint = container.querySelector(".vb-logic-child-hint");
      if (hint) hint.style.display = "none";
    };

    this._logicDragLeaveHandler = (e) => {
      e.stopPropagation();
      const related = e.relatedTarget;
      if (!related || !container.contains(related)) {
        container.classList.remove("drag-over");
        container.style.borderColor = "transparent";
        container.style.background = "transparent";
        const hint = container.querySelector(".vb-logic-child-hint");
        if (hint) hint.style.display = "";
      }
    };

    this._logicDropHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.remove("drag-over");
      container.style.borderColor = "transparent";
      container.style.background = "transparent";

      const targetParentId = container.dataset.parentId || null;

      // Check if we are moving an existing block
      const movedId = e.dataTransfer.getData("moveLogicBlockId");
      if (movedId) {
        this._moveLogicBlockToParent(movedId, targetParentId);
        return;
      }

      // Check if we are adding a new block from the palette
      const logicType = e.dataTransfer.getData("logicType");
      if (logicType) {
        this._addLogicBlock(logicType, targetParentId);
        return;
      }

      // Fallback: if the data is empty, try to read from the drag source (useful for cross-browser)
      // but we rely on the above.
    };

    container.addEventListener("dragover", this._logicDragOverHandler);
    container.addEventListener("dragleave", this._logicDragLeaveHandler);
    container.addEventListener("drop", this._logicDropHandler);
  }

  _addLogicBlock(blockType, parentId = null) {
    if (this._addingLogic) return;
    this._addingLogic = true;
    const type = VisualCardBuilder.LOGIC_BLOCK_TYPES[blockType];
    if (!type) {
      this._addingLogic = false;
      return;
    }

    const newBlock = {
      id: `logic-${this._nextId++}`,
      type: blockType,
      fields: {},
      parentId: parentId || null,
    };
    if (type.fields) {
      type.fields.forEach((field) => {
        newBlock.fields[field.id] = field.default || "";
      });
    }
    this._cardData.logic.push(newBlock);
    this._renderLogicBuilder();
    this._selectedLogicBlock = newBlock;
    this._updateBlockProperties();
    if (window.displayMessage)
      window.displayMessage(`Added ${type.label}`, "message");
    setTimeout(() => {
      this._addingLogic = false;
    }, 200);
  }

  _updateBlockProperties() {
    const container = document.getElementById("vbBlockProperties");
    if (!container) return;
    container.innerHTML = "";

    if (!this._selectedLogicBlock) {
      container.innerHTML = `<p style="color:var(--text-dim);font-size:0.8rem;font-style:italic;padding:8px;">Select a logic block to edit</p>`;
      return;
    }

    const block = this._selectedLogicBlock;
    const type = VisualCardBuilder.LOGIC_BLOCK_TYPES[block.type];
    if (!type) return;

    const visibleFields = (type.fields || []).filter(
      (field) => !field.showIf || field.showIf(block),
    );

    if (visibleFields.length === 0) {
      container.innerHTML = `<p style="color:var(--text-dim);font-size:0.8rem;font-style:italic;padding:8px;">This block has no configurable properties</p>`;
      return;
    }

    // Any field change can affect which OTHER fields should be visible (e.g.
    // switching ON_EVENT's "When" away from "load" reveals Element ID), so
    // every field's change handler refreshes this panel in addition to the
    // workspace, rather than each field deciding individually whether it
    // might affect visibility.
    const refresh = () => {
      this._renderLogicWorkspace();
      this._updateBlockProperties();
    };

    visibleFields.forEach((field) => {
      const row = document.createElement("div");
      row.className = "vb-prop-row";
      const label = document.createElement("label");
      label.className = "vb-prop-label";
      label.textContent = field.label;
      row.appendChild(label);

      let input;
      const isElementIdField =
        field.id === "elementId" || field.id === "targetId";

      if (isElementIdField) {
        const existingIds = this._cardData.elements
          .map((el) => el.props?.id)
          .filter(Boolean);
        const currentVal = block.fields[field.id] ?? field.default ?? "";
        if (currentVal && !existingIds.includes(currentVal)) {
          existingIds.unshift(currentVal);
        }

        input = document.createElement("select");
        input.className = "vb-prop-input";
        if (existingIds.length === 0) {
          const opt = document.createElement("option");
          opt.value = "";
          opt.textContent = "No elements yet — add one in Design tab";
          input.appendChild(opt);
        } else {
          existingIds.forEach((idVal) => {
            const opt = document.createElement("option");
            opt.value = idVal;
            opt.textContent = idVal;
            if (idVal === currentVal) opt.selected = true;
            input.appendChild(opt);
          });
        }
        input.addEventListener("change", (e) => {
          block.fields[field.id] = e.target.value;
          refresh();
        });
      } else if (field.type === "select") {
        input = document.createElement("select");
        input.className = "vb-prop-input";
        (field.options || []).forEach((opt) => {
          const o = document.createElement("option");
          o.value = opt;
          o.textContent = opt;
          if (block.fields[field.id] === opt) o.selected = true;
          input.appendChild(o);
        });
        input.addEventListener("change", (e) => {
          block.fields[field.id] = e.target.value;
          refresh();
        });
      } else if (field.type === "number") {
        input = document.createElement("input");
        input.type = "number";
        input.className = "vb-prop-input";
        input.value = block.fields[field.id] ?? field.default ?? 0;
        input.addEventListener("input", (e) => {
          block.fields[field.id] = Number(e.target.value);
          this._renderLogicWorkspace();
        });
      } else {
        input = document.createElement("input");
        input.type = "text";
        input.className = "vb-prop-input";
        input.value = block.fields[field.id] ?? field.default ?? "";
        input.addEventListener("input", (e) => {
          block.fields[field.id] = e.target.value;
          this._renderLogicWorkspace();
        });
      }

      row.appendChild(input);
      container.appendChild(row);
    });
  }
  _isSameOrDescendantLogic(id, ancestorId) {
    if (id === ancestorId) return true;
    let current = this._cardData.logic.find((b) => b.id === id);
    while (current && current.parentId) {
      if (current.parentId === ancestorId) return true;
      current = this._cardData.logic.find((b) => b.id === current.parentId);
    }
    return false;
  }

  _moveLogicBlock(movedId, targetId, position) {
    if (movedId === targetId) return;
    const moved = this._cardData.logic.find((b) => b.id === movedId);
    const target = this._cardData.logic.find((b) => b.id === targetId);
    if (!moved || !target) return;
    if (this._isSameOrDescendantLogic(targetId, movedId)) return;

    moved.parentId = target.parentId || null;

    const fromIndex = this._cardData.logic.indexOf(moved);
    this._cardData.logic.splice(fromIndex, 1);

    let targetIndex = this._cardData.logic.indexOf(target);
    if (position === "after") targetIndex += 1;
    this._cardData.logic.splice(targetIndex, 0, moved);

    this._renderLogicBuilder();
  }

  _moveLogicBlockToParent(movedId, newParentId) {
    if (movedId === newParentId) return;
    const moved = this._cardData.logic.find((b) => b.id === movedId);
    if (!moved) return;
    if (newParentId && this._isSameOrDescendantLogic(newParentId, movedId))
      return;

    moved.parentId = newParentId || null;
    const fromIndex = this._cardData.logic.indexOf(moved);
    this._cardData.logic.splice(fromIndex, 1);
    this._cardData.logic.push(moved);
    this._renderLogicBuilder();
  }
  // ─── Preview, Code, Save ──────────────────────────────────────────────

  _refreshPreview() {
    const previewBody = document.getElementById("vbPreviewBody");
    if (!previewBody) return;

    const { html, css, js } = this._generateCardCode();

    let iframe = previewBody.querySelector(".vb-preview-iframe");
    if (!iframe) {
      previewBody.innerHTML = "";
      iframe = document.createElement("iframe");
      iframe.className = "vb-preview-iframe";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.sandbox = "allow-scripts allow-same-origin";
      previewBody.appendChild(iframe);
    }

    this._devCardRuntime._previewSandbox(iframe, {
      id: this._cardData.id,
      label: this._cardData.label,
      html,
      css,
      js,
    });

    this._previewIframe = iframe;
  }
  _updateCodeView() {
    const htmlEl = document.getElementById("vbCodeHTML");
    const cssEl = document.getElementById("vbCodeCSS");
    const jsEl = document.getElementById("vbCodeJS");
    if (!htmlEl || !cssEl || !jsEl) return;

    const { html, css, js } = this._generateCardCode();

    // textContent (not innerHTML) so generated markup shows as text, not rendered
    htmlEl.textContent = html;
    cssEl.textContent = css;
    jsEl.textContent = js;
  }
  _generateCardCode() {
    let html = `<div class="visual-card-content">\n`;
    let css = `.visual-card-content { padding: 8px; }\n`;
    let js = `// Visual Card - Generated Code\n(async function() {\n  const sdk = window.__pitbeaconSDK;\n  const vars = {};\n  function interpolate(str) {\n    return String(str).replace(/\\{(\\w+)\\}/g, function(_m, name) {\n      return (name in vars) ? vars[name] : _m;\n    });\n  }\n\n`;
    const topLevelElements = this._cardData.elements.filter(
      (el) => !el.parentId,
    );
    topLevelElements.forEach((el) => {
      html += this._generateElementHTML(el, 1);
    });
    html += `</div>`;

    this._cardData.elements.forEach((element) => {
      const props = element.props || {};
      const typeDef = VisualCardBuilder.ELEMENT_TYPES[element.type];
      if (!typeDef) return;
      if (props.styles && Object.keys(props.styles).length > 0) {
        const selector = props.id ? `#${props.id}` : `.element-${typeDef.id}`;
        const styleStr = Object.entries(props.styles)
          .filter(([_, v]) => v)
          .map(([k, v]) => `  ${k}: ${v}`)
          .join(";\n");
        if (styleStr) {
          css += `\n${selector} {\n${styleStr}\n}\n`;
        }
      }
    });

    const topLevelLogic = this._cardData.logic.filter((b) => !b.parentId);
    topLevelLogic.forEach((block) => {
      js += this._generateBlockJS(block) + "\n\n";
    });

    js += `})();`;

    return { html, css, js };
  }

  _generateElementHTML(element, indent) {
    const type = VisualCardBuilder.ELEMENT_TYPES[element.type];
    if (!type) return "";
    let html = "  ".repeat(indent) + type.html(element.props || {}) + "\n";
    // Children
    const children = this._cardData.elements.filter(
      (el) => el.parentId === element.id,
    );
    children.forEach((child) => {
      html += this._generateElementHTML(child, indent + 1);
    });
    return html;
  }

  _generateBlockJS(block) {
    const type = VisualCardBuilder.LOGIC_BLOCK_TYPES[block.type];
    if (!type) return "";
    const children = this._cardData.logic.filter(
      (b) => b.parentId === block.id,
    );
    let childCode = "";
    if (children.length) {
      childCode = children
        .map((child) => this._generateBlockJS(child))
        .join("\n");
    }
    if (type.canHaveChildren) {
      return type.generateJS(block, childCode);
    } else {
      return type.generateJS(block);
    }
  }

  _saveCard() {
    const id = (this._cardData.id || "").trim();
    const label = (this._cardData.label || "").trim();

    if (!id) {
      if (window.displayMessage)
        window.displayMessage("Card ID is required", "error");
      else console.error("Card ID is required");
      return;
    }

    if (!this._cardData.elements.length && !this._cardData.logic.length) {
      if (window.displayMessage)
        window.displayMessage(
          "Nothing to save — add some elements first",
          "error",
        );
      return;
    }

    this._cardData.label = label || id;

    const { html, css, js } = this._generateCardCode();
    const def = {
      label: this._cardData.label,
      html,
      css,
      js,
      // Structured tree, kept alongside the compiled output so this card
      // can be reopened in the Visual Builder later instead of only ever
      // being editable as raw HTML/CSS/JS.
      visualData: {
        elements: this._cardData.elements,
        logic: this._cardData.logic,
      },
    };

    try {
      const developerCards = JSON.parse(
        localStorage.getItem("developerCards") || "{}",
      );
      developerCards[id] = def;
      localStorage.setItem("developerCards", JSON.stringify(developerCards));

      const cardDef = this._devCardRuntime.createCardDefinition(id, def);
      // Explicitly allow overwrite — the whole point of "edit existing" is
      // updating a definition that's already registered under this id.
      cardDef.allowOverride = true;
      this._registry.register(id, cardDef);

      if (window.displayMessage)
        window.displayMessage(`Card "${id}" saved!`, "message");
      if (window._pitbeaconRender) window._pitbeaconRender();
    } catch (err) {
      console.error("Failed to save card:", err);
      if (window.displayMessage)
        window.displayMessage(`Failed to save card: ${err.message}`, "error");
    }
  }
}
