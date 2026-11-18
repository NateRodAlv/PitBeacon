import { marked } from "marked";
import guideMarkdown from "../../pitbeacon-developer-editor-guide.md?raw";
import { icon } from "../lib/icons.js";

// The guide ships inside the bundle, so it opens instantly and works offline.
export class DocsModal {
  open() {
    let modal = document.getElementById("docsModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "docsModal";
      modal.className = "docs-modal";
      modal.innerHTML = `
        <div class="docs-shell">
          <div class="docs-header">
            <h2 class="docs-title">${icon("book", 20)} Developer Guide</h2>
            <button class="vb-btn vb-btn-close" id="docsClose" type="button">✕</button>
          </div>
          <div class="docs-body" id="docsBody"></div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector("#docsClose").addEventListener("click", () => {
        modal.classList.remove("active");
      });
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.classList.remove("active");
      });
      modal.querySelector("#docsBody").innerHTML = marked.parse(guideMarkdown);
    }
    modal.classList.add("active");
  }
}
