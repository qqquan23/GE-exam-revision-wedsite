const data = window.GE_DATA;
const byId = (id) => document.getElementById(id);

let activeItems = [];
let answered = new Map();

function answerToggle(label, value) {
  return `
    <details class="answer-toggle">
      <summary>${label}</summary>
      <div>${value}</div>
    </details>
  `;
}

function tag(part) {
  return `<span class="tag ${part}">${part === "main" ? "正卷" : "加分"}</span>`;
}

function renderCoverage() {
  byId("coverageGrid").innerHTML = data.coverage.map((item) => `
    <article class="coverage-card">
      ${tag(item.part)}
      <h3>${item.title}</h3>
      <p>${item.focus}</p>
    </article>
  `).join("");
}

function renderMindsetTable() {
  const headers = ["No.", "Key vocabulary", "Noun", "Verb", "Adjective", "Adverb"];
  const rows = data.mindsetVocab.map((row) => [row.no, row.key, row.noun, row.verb, row.adjective, row.adverb]);
  byId("mindsetTable").innerHTML = `
    <table>
      <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map((row) => `
          <tr>${row.map((cell, idx) => `<td class="${idx > 1 ? "covered" : ""}">${String(cell || "").replaceAll("\n", "<br>")}</td>`).join("")}</tr>
        `).join("")}
      </tbody>
    </table>
  `;
  byId("mindsetTable").querySelectorAll("td").forEach((td) => {
    td.addEventListener("click", () => td.classList.toggle("covered"));
  });
}

function renderMindsetPractice() {
  const study = data.mindsetStudy;
  const all = [...study.docPractice, ...study.pptPractice];
  byId("mindsetPractice").innerHTML = `
    <div class="exam-list">
      ${all.map((item, idx) => `
        <div class="exam-item">
          <b>${idx + 1}. ${item.prompt}</b>
          ${answerToggle("Show answer", `<strong>${item.answer}</strong>`)}
          <small>${item.source}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function setMindsetCovered(covered) {
  byId("mindsetTable").querySelectorAll("td").forEach((td) => {
    if (covered) td.classList.add("covered");
    else td.classList.remove("covered");
  });
}

function renderWordskill() {
  const study = data.wordskillStudy;
  byId("wordskillCards").innerHTML = `
    <section class="wordskill-block">
      <h4>Glossary definitions</h4>
      ${study.glossary.map((item) => `
        <div class="flash-card">
          <strong>${item.term} ${item.cn ? `<small>(${item.cn})</small>` : ""}</strong>
          <span class="wordskill-chip meaning-chip"><b>Definition:</b> ${item.definition}</span>
          ${item.forms?.length ? `<span class="wordskill-chip forms-chip"><b>Forms:</b> ${item.forms.join(", ")}</span>` : ""}
          ${item.usage?.length ? `<span class="wordskill-chip usage-chip"><b>Usage:</b> ${item.usage.join("; ")}</span>` : ""}
          <small>${item.unit} · 需要背 definition</small>
        </div>
      `).join("")}
    </section>

    <section class="wordskill-block">
      <h4>Unit 45 change verbs</h4>
      ${study.changeWords.map((item) => `
        <div class="flash-card change-card">
          <strong>${item.word || "word"} ${item.cn ? `<small>(${item.cn})</small>` : ""}</strong>
          <span class="wordskill-chip meaning-chip">${item.meaning}</span>
          ${item.forms?.length ? `<span class="wordskill-chip forms-chip"><b>Related forms:</b> ${item.forms.join(", ")}</span>` : ""}
          ${item.usage?.length ? `<span class="wordskill-chip usage-chip"><b>Usage:</b> ${item.usage.join("; ")}</span>` : ""}
          <small>${item.example}</small>
        </div>
      `).join("")}
    </section>

    <section class="wordskill-block">
      <h4>Spotlight usage</h4>
      ${study.spotlight.map((item) => `
        <div class="flash-card">
          <strong>${item.unit}: ${item.title}</strong>
          ${item.points.map((point) => `<span>${point}</span>`).join("")}
          <small>${item.needDefinition ? "需要背 definition" : "不用背 definition，但要懂用法"}</small>
        </div>
      `).join("")}
    </section>

    <section class="wordskill-block">
      <h4>Fill-in practice from revision PPT</h4>
      ${study.fillPractice.map((item, idx) => `
        <div class="flash-card practice-card">
          <strong>${idx + 1}. ${item.prompt}</strong>
          ${answerToggle("Show answer", item.answer)}
        </div>
      `).join("")}
    </section>

    <section class="wordskill-block">
      <h4>20-word Q&A</h4>
      ${study.qna.map((item) => `
        <div class="flash-card">
          <strong>${item}</strong>
          <span>溫習方向：用 Word Skills U46 energy-saving / conserve / consumption / saving / appliance 等詞彙作答。</span>
        </div>
      `).join("")}
    </section>
  `;
}

function compactTable(table) {
  const header = table[0] || [];
  const body = table.slice(1, 4);
  return body.map((row) => {
    const title = row[0] || header[0] || "Rule";
    const example = row[1] || "";
    const meaning = row[2] || "";
    return { title, example, meaning };
  });
}

function cnFor(rule, source) {
  const lookup = source === "adverbial" ? data.adverbialCn : data.participleCn;
  return lookup[rule.title] || lookup[rule.example] || "";
}

function renderRules() {
  const categories = ["Time", "Manner", "Reason", "Place", "Result", "Purpose", "Concession", "Condition"];
  byId("adverbialRules").innerHTML = categories.map((category) => {
    const rules = data.adverbialRevision.filter((rule) => rule.category === category);
    return `
      <section class="rule-group">
        <h4>${category}</h4>
        ${rules.map((rule) => `
          <div class="rule-item">
            <b>${rule.title.replaceAll("\n", "<br>")}</b>
            ${rule.cn ? `<p class="cn-note">${rule.cn}</p>` : ""}
            ${rule.example ? `<div>${rule.example.replaceAll("\n", "<br>")}</div>` : ""}
            ${rule.meaning ? `<small>${rule.meaning.replaceAll("\n", "<br>")}</small>` : ""}
          </div>
        `).join("")}
      </section>
    `;
  }).join("");

  const participles = data.participleTables.flatMap(compactTable).filter((x) => x.example || x.meaning);
  byId("participleRules").innerHTML = `
    <section class="rule-group">
      <h4>Tense / Voice Forms</h4>
      <div class="form-grid">
        ${data.participleForms.map((item) => `
          <div class="form-card">
            <strong>${item.voice} · ${item.tense}</strong>
            <span>${item.form}</span>
            <small>${item.cn}</small>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="rule-group">
      <h4>Usage Examples</h4>
      ${participles.map((rule) => `
        <div class="rule-item">
          <b>${rule.title.replaceAll("\n", "<br>")}</b>
          ${cnFor(rule, "participle") ? `<p class="cn-note">${cnFor(rule, "participle")}</p>` : ""}
          <div>${rule.example.replaceAll("\n", "<br>")}</div>
          ${rule.meaning ? `<small>${rule.meaning.replaceAll("\n", "<br>")}</small>` : ""}
        </div>
      `).join("")}
    </section>
  `;
}

function renderDecoding() {
  const study = data.decodingStudy;
  byId("decodingPage").innerHTML = `
    <article class="bonus-study full-span">
      <div class="bonus-study-head">
        <span>20</span>
        <div>
          <h3>${study.title}</h3>
          <p>${study.focus}</p>
        </div>
      </div>
      <div class="exam-list">
        ${study.items.map((item, idx) => `
          <div class="exam-item">
            <b>${idx + 1}. ${item.prompt}</b>
            <div class="mini-options">${item.options.map((option) => `<span>${option.key}. ${option.text}</span>`).join("")}</div>
            ${answerToggle("Show answer", `<strong>${item.answer}</strong>`)}
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderPptStudy() {
  const study = data.pptStudy;
  byId("pptPage").innerHTML = `
    <article class="bonus-study full-span">
      <div class="bonus-study-head">
        <span>${study.slides.length}</span>
        <div>
          <h3>${study.title}</h3>
          <p>${study.focus}</p>
        </div>
      </div>
      <div class="ppt-slide-list">
        ${study.slides.map((slide) => `
          <section class="ppt-slide-card">
            <h4>Slide ${slide.slide}: ${slide.title}</h4>
            <div class="exam-list">
              ${slide.items.map((item, idx) => `
                <div class="exam-item">
                  <b>${idx + 1}. ${item.prompt}</b>
                  ${item.options ? `<div class="mini-options">${item.options.map((option) => `<span>${option.key}. ${option.text}</span>`).join("")}</div>` : ""}
                  ${answerToggle("Show answer", `<strong>${item.answer}</strong>`)}
                </div>
              `).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    </article>
  `;
}

function markWrong(prompt, wrong) {
  if (!wrong || !prompt.includes(wrong)) return prompt;
  return prompt.replace(wrong, `<mark>${wrong}</mark>`);
}

function renderBonusPages() {
  const { u60, examSkill, cet } = data.bonusStudy;
  byId("u60Page").innerHTML = `
    <article class="bonus-study full-span">
      <div class="bonus-study-head">
        <span>01</span>
        <div>
          <h3>${u60.title}</h3>
          <p>${u60.focus}</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Word</th><th>意思</th><th>Noun</th><th>Verb</th><th>Adjective</th><th>Adverb</th></tr></thead>
          <tbody>
            ${u60.items.map((item) => `
              <tr>
                <td>${item.word}</td>
                <td>${item.meaning}</td>
                <td>${item.noun}</td>
                <td>${item.verb}</td>
                <td>${item.adjective}</td>
                <td>${item.adverb}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      ${u60.notes.length ? `<div class="note-list">${u60.notes.map((note) => `<p>${note}</p>`).join("")}</div>` : ""}
    </article>
  `;

  byId("cetPage").innerHTML = `
    <article class="bonus-study full-span">
      <div class="bonus-study-head">
        <span>01</span>
        <div>
          <h3>${cet.title}</h3>
          <p>${cet.focus}</p>
        </div>
      </div>
      <div class="vocab-toolbar">
        <span class="pill">${cet.items.length} words</span>
        <span class="pill">Unit 5: ${cet.items.filter((item) => item.unit === "Unit 5").length}</span>
        <span class="pill">Unit 6: ${cet.items.filter((item) => item.unit === "Unit 6").length}</span>
      </div>
      <div class="cet-list">
        ${cet.items.map((item) => `
          <div class="cet-item">
            <div>
              <strong>${item.word}</strong>
              <span>${item.pos}</span>
              <small>${item.unit}</small>
            </div>
            <p>${item.meaning}</p>
            ${item.phrases.length ? `<em>${item.phrases.join("<br>")}</em>` : ""}
            ${item.examples.slice(0, 2).map((example) => `<blockquote>${example.en}<br><span>${example.zh}</span></blockquote>`).join("")}
            ${item.notes.length ? `<small>${item.notes.slice(0, 2).join("<br>")}</small>` : ""}
          </div>
        `).join("")}
      </div>
    </article>
  `;

  byId("examSkillPage").innerHTML = `
    <article class="bonus-study full-span">
      <div class="bonus-study-head">
        <span>01</span>
        <div>
          <h3>${examSkill.title}</h3>
          <p>${examSkill.focus}</p>
        </div>
      </div>
      <h4>Choose the best answers</h4>
      <div class="exam-list">
        ${examSkill.mcq.map((item) => `
          <div class="exam-item">
            <b>${item.number}. ${item.prompt}</b>
            <div class="mini-options">${item.options.map((option) => `<span>${option.key}. ${option.text}</span>`).join("")}</div>
            ${answerToggle("Show answer", `<strong>${item.answer}</strong>`)}
          </div>
        `).join("")}
      </div>
      <h4>Underline the mistake and correct it</h4>
      <div class="exam-list">
        ${examSkill.correction.map((item) => `
          <div class="exam-item">
            <b>${item.number}. ${markWrong(item.prompt, item.wrong)}</b>
            ${answerToggle("Show wrong part", `<mark>${item.wrong}</mark>`)}
            ${answerToggle("Show correction", `<strong>${item.answer}</strong>`)}
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function uniqueSections() {
  return ["all", ...Array.from(new Set(data.quiz.map((item) => item.section))).sort()];
}

function renderFilters() {
  byId("sectionFilter").innerHTML = uniqueSections().map((section) => `
    <option value="${section}">${section === "all" ? "All" : section}</option>
  `).join("");
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesAnswer(value, answer) {
  const a = normalize(answer);
  const v = normalize(value);
  return v === a || a.split("/").map(normalize).includes(v);
}

function filteredItems() {
  const part = byId("partFilter").value;
  const section = byId("sectionFilter").value;
  const type = byId("typeFilter").value;
  return data.quiz.filter((item) => {
    if (part !== "all" && item.part !== part) return false;
    if (section !== "all" && item.section !== section) return false;
    if (type !== "all" && item.type !== type) return false;
    return true;
  });
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function updateScore() {
  const total = answered.size;
  const score = Array.from(answered.values()).filter(Boolean).length;
  byId("scoreText").textContent = `${score} / ${total}`;
}

function selectMcq(card, item, key) {
  const correct = key === item.answer;
  answered.set(item.id, correct);
  card.querySelectorAll(".option").forEach((button) => {
    const choice = button.dataset.key;
    button.classList.toggle("correct", choice === item.answer);
    button.classList.toggle("wrong", choice === key && !correct);
    button.disabled = true;
  });
  card.querySelector(".feedback").textContent = correct ? "Correct" : `Answer: ${item.answer}`;
  updateScore();
}

function submitText(card, item) {
  const input = card.querySelector("input");
  const correct = matchesAnswer(input.value, item.answer);
  answered.set(item.id, correct);
  input.disabled = true;
  card.querySelector(".feedback").textContent = correct ? "Correct" : `Answer: ${item.answer}`;
  updateScore();
}

function quizCard(item) {
  const options = item.type === "mcq" ? `
    <div class="options">
      ${(item.options || []).map((option) => `<button class="option" type="button" data-key="${option.key}">${option.key}. ${option.text}</button>`).join("")}
    </div>
  ` : item.type === "open" ? `
    <div class="answer-row">
      <button class="check-answer" type="button">Reveal answer</button>
    </div>
  ` : `
    <div class="answer-row">
      <input type="text" autocomplete="off" aria-label="answer">
      <button class="check-answer" type="button">Check</button>
    </div>
  `;

  return `
    <article class="quiz-card" data-id="${item.id}">
      <div class="quiz-meta">
        ${tag(item.part)}
        <span class="pill">${item.section}</span>
        <span class="pill">${item.type}</span>
      </div>
      <strong>${item.prompt}</strong>
      ${options}
      <div class="feedback"></div>
      <div class="source-note">${item.source}</div>
    </article>
  `;
}

function renderQuiz() {
  answered = new Map();
  activeItems = shuffle(filteredItems()).slice(0, 20);
  byId("quizList").innerHTML = activeItems.length
    ? activeItems.map(quizCard).join("")
    : `<article class="quiz-card">No items in this filter.</article>`;

  byId("quizList").querySelectorAll(".quiz-card").forEach((card) => {
    const item = activeItems.find((entry) => entry.id === card.dataset.id);
    if (!item) return;
    card.querySelectorAll(".option").forEach((button) => {
      button.addEventListener("click", () => selectMcq(card, item, button.dataset.key));
    });
    const check = card.querySelector(".check-answer");
    if (check) {
      if (item.type === "open") {
        check.addEventListener("click", () => {
          answered.set(item.id, true);
          card.querySelector(".feedback").textContent = `Suggested answer: ${item.answer}`;
          check.disabled = true;
          updateScore();
        });
      } else {
        check.addEventListener("click", () => submitText(card, item));
        card.querySelector("input").addEventListener("keydown", (event) => {
          if (event.key === "Enter") submitText(card, item);
        });
      }
    }
  });
  updateScore();
}

function bindEvents() {
  byId("coverMindset").addEventListener("click", () => setMindsetCovered(true));
  byId("revealMindset").addEventListener("click", () => setMindsetCovered(false));
  document.querySelectorAll(".nav-button[data-page]").forEach((button) => {
    button.addEventListener("click", () => setAppPage(button.dataset.page));
  });
  ["partFilter", "sectionFilter", "typeFilter"].forEach((id) => {
    byId(id).addEventListener("change", renderQuiz);
  });
  byId("newQuiz").addEventListener("click", renderQuiz);
  window.addEventListener("hashchange", () => {
    const page = location.hash.replace("#", "") || "home";
    setAppPage(page, false);
  });
}

function setAppPage(page, updateHash = true) {
  const target = byId(page) ? page : "home";
  document.querySelectorAll(".app-page").forEach((section) => {
    section.classList.toggle("active", section.id === target);
  });
  document.querySelectorAll(".nav-button[data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === target);
  });
  if (updateHash) history.replaceState(null, "", `#${target}`);
  window.scrollTo({ top: 0, behavior: "auto" });
}

renderCoverage();
renderMindsetTable();
renderMindsetPractice();
renderWordskill();
renderRules();
renderDecoding();
renderPptStudy();
renderBonusPages();
renderFilters();
renderQuiz();
bindEvents();
setAppPage(location.hash.replace("#", "") || "home", false);
