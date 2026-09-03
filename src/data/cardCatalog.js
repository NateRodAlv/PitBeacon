const MAX_CARD_BYTES = 100 * 1024;

function normalizeCard(card) {
  const js = String(card.js || card.javascript || "");
  return {
    id: String(card.id || "").trim(),
    label: String(card.label || card.id || "").trim(),
    description: String(card.description || "").trim(),
    authorName: String(card.author_name || card.authorName || "Community author").trim(),
    icon: String(card.icon || "code").trim(),
    settings:
      card.settings && typeof card.settings === "object"
        ? card.settings
        : detectConfigurableSettings(js),
    html: String(card.html || ""),
    css: String(card.css || ""),
    js,
    version: String(card.version || "1.0.0").trim(),
  };
}

function validateCard(card) {
  const normalized = normalizeCard(card);
  const errors = [];
  if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(normalized.id)) {
    errors.push("Card ID must use lowercase letters, numbers, and hyphens.");
  }
  if (!normalized.label || normalized.label.length > 80) {
    errors.push("Card label is required and must be 80 characters or fewer.");
  }
  if (!normalized.html || normalized.html.length > 40_000) {
    errors.push("Card HTML is required and must be 40 KB or smaller.");
  }
  if (normalized.css.length > 40_000 || normalized.js.length > 40_000) {
    errors.push("Card CSS and JavaScript must each be 40 KB or smaller.");
  }
  if (JSON.stringify(normalized).length > MAX_CARD_BYTES) {
    errors.push("The complete card package must be 100 KB or smaller.");
  }
  return { card: normalized, errors };
}

function inferSettingType(value, options = {}) {
  if (options.type) return options.type;
  if (typeof value === "boolean") return "checkbox";
  if (typeof value === "number") return "number";
  if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) return "color";
  return "text";
}

function parseLiteral(value) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return undefined;
}

function splitArguments(source) {
  const parts = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && source[index - 1] !== "\\") quote = null;
    } else if (character === "'" || character === '"' || character === "`") {
      quote = character;
    } else if (character === "{" || character === "[" || character === "(") {
      depth += 1;
    } else if (character === "}" || character === "]" || character === ")") {
      depth -= 1;
    } else if (character === "," && depth === 0) {
      parts.push(source.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(source.slice(start));
  return parts;
}

export function detectConfigurableSettings(js = "") {
  const settings = {};
  const pattern = /sdk\.configurable\s*\(([^()]*(?:\([^)]*\)[^()]*)*)\)/g;
  let match;
  while ((match = pattern.exec(js))) {
    const [nameSource, defaultSource, optionsSource] = splitArguments(match[1]);
    const name = parseLiteral(nameSource || "");
    const defaultValue = parseLiteral(defaultSource || "");
    if (typeof name !== "string" || defaultValue === undefined) continue;
    let options = {};
    if (optionsSource?.trim().startsWith("{")) {
      try {
        options = JSON.parse(optionsSource.replace(/([{,])\s*([a-zA-Z][\w]*)\s*:/g, '$1"$2":'));
      } catch {
        options = {};
      }
    }
    settings[name] = {
      label: options.label || name.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
      type: inferSettingType(defaultValue, options),
      default: defaultValue,
      ...(options.min !== undefined ? { min: options.min } : {}),
      ...(options.max !== undefined ? { max: options.max } : {}),
      ...(options.step !== undefined ? { step: options.step } : {}),
      ...(options.options ? { options: options.options } : {}),
    };
  }
  return settings;
}

export class CardCatalog {
  constructor(config, runtime, stateManager, sdk) {
    this._config = config;
    this._runtime = runtime;
    this._stateManager = stateManager;
    this._sdk = sdk;
  }

  isConfigured() {
    return Boolean(this._config.supabaseUrl && this._config.supabaseAnonKey);
  }

  async listApproved() {
    if (!this.isConfigured()) return [];
    const url = `${this._config.supabaseUrl.replace(/\/$/, "")}/rest/v1/cards?select=id,label,description,author_name,icon,html,css,js,version,settings,created_at&status=eq.approved&order=created_at.desc`;
    const response = await fetch(url, {
      headers: {
        apikey: this._config.supabaseAnonKey,
        Authorization: `Bearer ${this._config.supabaseAnonKey}`,
      },
    });
    if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
    return (await response.json()).map(normalizeCard);
  }

  async submit(card, turnstileToken = "") {
    const { card: normalized, errors } = validateCard(card);
    if (errors.length) throw new Error(errors.join(" "));
    if (!this._config.cardSubmitFunctionUrl) {
      throw new Error("Card submission is not configured yet.");
    }
    const response = await fetch(this._config.cardSubmitFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: this._config.supabaseAnonKey,
        Authorization: `Bearer ${this._config.supabaseAnonKey}`,
      },
      body: JSON.stringify({ card: normalized, turnstileToken }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Card submission failed.");
    return result;
  }

  renderPreview(element, card) {
    const definition = {
      ...card,
      developer: true,
      builtin: false,
      settings: card.settings,
      settingsValues: card.settingsValues,
    };
    this._runtime._renderDevCard(
      element,
      `catalog-preview-${card.id}`,
      definition,
      this._stateManager.getState(),
      this._sdk,
    );
  }
}

export { validateCard };
