const form = document.querySelector("#survey-form");
const fields = [...form.querySelectorAll("input, textarea")];
const progressCount = document.querySelector("#progress-count");
const progressValue = document.querySelector("#progress-value");
const feedback = document.querySelector("#feedback");
const submitButton = document.querySelector("#submit-button");

function updateProgress() {
  const completed = fields.filter((field) => field.value.trim()).length;
  progressCount.textContent = completed + "/" + fields.length;
  progressValue.style.width = Math.round((completed / fields.length) * 100) + "%";
}

fields.forEach((field) => field.addEventListener("input", updateProgress));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  submitButton.disabled = true;
  submitButton.firstElementChild.textContent = "Enviando...";
  feedback.className = "feedback";

  const payload = Object.fromEntries(new FormData(form).entries());
  const config = window.APP_CONFIG || {};
  const supabaseUrl = config.SUPABASE_URL;
  const apiKey = config.SUPABASE_PUBLISHABLE_KEY || config.SUPABASE_ANON_KEY;

  try {
    if (!supabaseUrl || !apiKey) {
      throw new Error("A conexão com o banco ainda não está configurada.");
    }

    const response = await fetch(supabaseUrl + "/rest/v1/respostas_multi_controle", {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.message || "Não foi possível registrar a resposta.");
    }

    feedback.textContent = "Resposta enviada com sucesso.";
    feedback.className = "feedback success";
    form.reset();
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    feedback.textContent = error.message || "Ocorreu um erro. Tente novamente.";
    feedback.className = "feedback error";
  } finally {
    submitButton.disabled = false;
    submitButton.firstElementChild.textContent = "Enviar pesquisa";
  }
});
