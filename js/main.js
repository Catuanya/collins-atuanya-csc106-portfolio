const STORAGE_KEY = "collins-atuanya-academic-tasks";

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNav.classList.toggle("is-open", !isOpen);
  });
}

const taskForm = document.querySelector("#task-form");

if (taskForm) {
  const taskInput = document.querySelector("#task-input");
  const taskList = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const taskCount = document.querySelector("#task-count");
  const completedCount = document.querySelector("#completed-count");
  const listCount = document.querySelector("#list-count");
  const plannerFeedback = document.querySelector("#planner-feedback");
  const clearCompletedButton = document.querySelector("#clear-completed");
  let tasks = loadTasks();

  function loadTasks() {
    try {
      const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (!Array.isArray(savedTasks)) {
        return [];
      }
      return savedTasks.filter((task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
      );
    } catch (error) {
      console.error("Could not load saved planner tasks.", error);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      plannerFeedback.textContent = "";
    } catch (error) {
      console.error("Could not save planner tasks.", error);
      plannerFeedback.textContent = "Your browser could not save this change. Check its storage settings.";
    }
  }

  function renderTasks() {
    taskList.replaceChildren();
    const completeTotal = tasks.filter((task) => task.completed).length;
    taskCount.textContent = String(tasks.length - completeTotal);
    completedCount.textContent = String(completeTotal);
    listCount.textContent = `(${tasks.length})`;
    emptyState.hidden = tasks.length > 0;
    clearCompletedButton.disabled = completeTotal === 0;

    tasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = `task-item${task.completed ? " is-complete" : ""}`;

      const checkbox = document.createElement("button");
      checkbox.className = "task-check";
      checkbox.type = "button";
      checkbox.setAttribute("aria-label", `${task.completed ? "Mark as not completed" : "Mark as completed"}: ${task.text}`);
      checkbox.setAttribute("aria-pressed", String(task.completed));
      const checkmark = document.createElement("span");
      checkmark.setAttribute("aria-hidden", "true");
      checkmark.textContent = task.completed ? "✓" : "";
      checkbox.append(checkmark);
      checkbox.addEventListener("click", () => {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
      });

      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text;

      const deleteButton = document.createElement("button");
      deleteButton.className = "task-delete";
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
      deleteButton.addEventListener("click", () => {
        tasks = tasks.filter((entry) => entry.id !== task.id);
        saveTasks();
        renderTasks();
      });

      item.append(checkbox, text, deleteButton);
      taskList.append(item);
    });
  }

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (!text) {
      plannerFeedback.textContent = "Add a task before submitting.";
      taskInput.focus();
      return;
    }

    tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
    saveTasks();
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
  });

  clearCompletedButton.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
  });

  renderTasks();
}

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const feedback = document.querySelector("#contact-feedback");
  const fields = {
    name: { input: document.querySelector("#contact-name"), error: document.querySelector("#name-error") },
    email: { input: document.querySelector("#contact-email"), error: document.querySelector("#email-error") },
    phone: { input: document.querySelector("#contact-phone"), error: document.querySelector("#phone-error") },
    message: { input: document.querySelector("#contact-message"), error: document.querySelector("#message-error") },
  };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\d+$/;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalidField = null;

    Object.values(fields).forEach(({ input, error }) => {
      input.removeAttribute("aria-invalid");
      error.textContent = "";
    });

    const values = Object.fromEntries(
      Object.entries(fields).map(([name, { input }]) => [name, input.value.trim()])
    );

    const messages = {
      name: values.name ? "" : "Please enter your name.",
      email: !values.email ? "Please enter your email address." :
        !emailPattern.test(values.email) ? "Enter a valid email address." : "",
      phone: !values.phone ? "Please enter your phone number." :
        !phonePattern.test(values.phone) ? "Use digits only for your phone number." : "",
      message: values.message ? "" : "Please enter a message.",
    };

    Object.entries(messages).forEach(([name, message]) => {
      if (!message) {
        return;
      }
      fields[name].input.setAttribute("aria-invalid", "true");
      fields[name].error.textContent = message;
      firstInvalidField ??= fields[name].input;
    });

    if (firstInvalidField) {
      feedback.textContent = "Please correct the highlighted fields.";
      feedback.className = "form-feedback error";
      firstInvalidField.focus();
      return;
    }

    feedback.textContent = "Opening your email app with the message details. Nothing is stored on this website.";
    feedback.className = "form-feedback success";
    const subject = new URLSearchParams(window.location.search).get("subject") || "Portfolio enquiry";
    const body = `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone}\n\n${values.message}`;
    window.location.href = `mailto:c.atuanya5529@miva.edu.ng?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  Object.values(fields).forEach(({ input }) => {
    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      const describedBy = input.getAttribute("aria-describedby");
      const error = describedBy && document.getElementById(describedBy);
      if (error?.classList.contains("field-error")) {
        error.textContent = "";
      }
    });
  });
}
