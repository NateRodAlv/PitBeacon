// Somewhere reusable, e.g. src/ui/docsModal.js
export class DocsModal {
  constructor() {
    this._mdLibPromise = null;
  }

  _loadMarkdownParser() {
    if (this._mdLibPromise) return this._mdLibPromise;
    this._mdLibPromise = new Promise((resolve) => {
      if (window.marked) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
    return this._mdLibPromise;
  }

  _resolveMarkdownPath(mdPath = "./pitbeacon-developer-editor-guide.md") {
    if (!mdPath) return "./pitbeacon-developer-editor-guide.md";

    try {
      if (/^(https?:)?\/\//i.test(mdPath) || mdPath.startsWith("/")) {
        return mdPath;
      }
      return new URL(mdPath, window.location.href).toString();
    } catch {
      return mdPath;
    }
  }

  async open(mdPath = "./pitbeacon-developer-editor-guide.md") {
    let modal = document.getElementById("docsModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "docsModal";
      modal.className = "docs-modal";
      modal.innerHTML = `
        <div class="docs-shell">
          <div class="docs-header">
            <h2 class="docs-title">📖 Developer Guide</h2>
            <button class="vb-btn vb-btn-close" id="docsClose" type="button">✕</button>
          </div>
          <div class="docs-body" id="docsBody">Loading…</div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector("#docsClose").addEventListener("click", () => {
        modal.classList.remove("active");
      });
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          modal.classList.remove("active");
        }
      });
    }
    modal.classList.add("active");

    const body = modal.querySelector("#docsBody");
    const resolvedMdPath = this._resolveMarkdownPath(mdPath);

    try {
      const [ok, res] = await Promise.all([
        this._loadMarkdownParser(),
        fetch(resolvedMdPath),
      ]);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const text = await res.text();
      body.innerHTML = ok && window.marked
        ? window.marked.parse(text)
        : `<pre style="white-space:pre-wrap;">${text}</pre>`; // plain-text fallback
    } catch (err) {
      body.innerHTML = `<p style="color:var(--text-dim);">Couldn't load the guide: ${err.message}</p>`;
    }
  }
}