// 🔥 YOUR API
const API = "https://w8dac3s836.execute-api.ap-south-1.amazonaws.com";

// 🔥 LOAD SUBJECTS (AUTO)
window.onload = loadSubjects;

async function loadSubjects() {
  const select = document.getElementById("subject");
  try {
    const res = await fetch(API + "/syllabus?year=2");
    const data = await res.json();

    select.innerHTML = `<option value="">Select Subject</option>`;

    const unique = {};
    data.forEach(i => {
      unique[i.subject_code] = i.subject_name;
    });

    Object.keys(unique).forEach(code => {
      select.innerHTML += `
        <option value="${code}">
          ${code} - ${unique[code]}
        </option>
      `;
    });

  } catch (e) {
    select.innerHTML = `<option value="">Error loading subjects</option>`;
  }
}

// 🔥 LOAD PYQ
async function loadPYQ(type, btnElement) {
  const subject = document.getElementById("subject").value;

  if (!subject) {
    showToast("Please select a subject first!", "warning");
    return;
  }
  
  // Handle active button styling
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-btn'));
  if (btnElement) {
    btnElement.classList.add('active-btn');
  }

  const div = document.getElementById("pyqList");
  const loader = document.getElementById("loader");
  const loaderText = document.getElementById("loaderText");
  
  div.innerHTML = "";
  div.style.display = "none";
  loader.style.display = "flex";
  loaderText.innerText = `Fetching ${type.toUpperCase()} Details...`;

  try {
    const res = await fetch(
      API + `/pyq?subject_code=${subject}&type=${type}`
    );

    const data = await res.json();
    loader.style.display = "none";
    div.style.display = "grid";

    if (!data.length) {
      div.innerHTML = `<div class="empty-state">No PYQs found for ${type.toUpperCase()}</div>`;
      return;
    }

    div.innerHTML = data.map(p => `
      <div class="card">
        <h3>${p.file_name}</h3>
        <p style="margin-bottom: 12px;">${p.subject_code} • ${p.type.toUpperCase()}</p>
        
        <iframe 
          src="${p.file_url}" 
          width="100%" 
          height="400px"
          style="border-radius: 8px; border: 1px solid var(--card-border); margin-bottom: 20px; background: #fff;">
        </iframe>

        <div class="card-actions">
          <a href="${p.file_url}" target="_blank" class="action-link preview-link">👁 Full Screen</a>
          <a href="${p.file_url}" download class="action-link download-link">⬇ Download</a>
        </div>
      </div>
    `).join("");

  } catch (e) {
    loader.style.display = "none";
    div.style.display = "grid";
    div.innerHTML = `<div class="empty-state">Error loading PYQs. Please try again later.</div>`;
  }
}

// 🔥 TOAST NOTIFICATION LOGIC
function showToast(message, type = "warning") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  
  // Custom Icon and colors
  let icon = type === "warning" ? "⚠️" : type === "error" ? "❌" : "✅";
  let borderColor = type === "warning" ? "#fbbf24" : type === "error" ? "#f87171" : "#28a8ba";
  
  toast.style.borderLeft = `4px solid ${borderColor}`;
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span style="font-weight: 500; font-size: 14px;">${message}</span>
  `;
  
  // Force reflow
  void toast.offsetWidth;
  
  toast.classList.add("show");
  
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}