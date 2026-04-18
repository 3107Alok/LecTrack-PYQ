// 🔥 YOUR API
const API = "https://w8dac3s836.execute-api.ap-south-1.amazonaws.com";

// 🔥 LOAD SUBJECTS (AUTO)
window.onload = loadSubjects;

// 🔥 TOAST UTILITY
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.classList.add("show");
    
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  } else {
    alert(message); // Fallback if UI is missing
  }
}

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
    showToast("Please select a subject first!");
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
      div.innerHTML = `<div class="empty-state">Will Upload Soon.....</div>`;
      return;
    }

    div.innerHTML = data.map((p, index) => `
      <div class="card" style="animation-delay: ${index * 0.08}s">
        <h3>${p.file_name}</h3>
        <p>${p.subject_code} • ${p.type.toUpperCase()}</p>
        <div class="card-actions">
          <a href="${p.file_url}" target="_blank" class="action-link preview-link">👁 Preview</a>
          <a href="#" onclick="downloadFile(getKeyFromUrl('${p.file_url}')); return false;" class="action-link download-link">⬇ Download</a>
        </div>
      </div>
    `).join("");

  } catch (e) {
    loader.style.display = "none";
    div.style.display = "grid";
    div.innerHTML = `<div class="empty-state">Error loading PYQs. Please try again later.</div>`;
  }
}

function getKeyFromUrl(url) {
  return url.split(".com/")[1];
}

// 🔥 DOWNLOAD FUNCTION
async function downloadFile(file_key) {
  console.log("FILE KEY:", file_key);

  if (!file_key) {
    showToast("File key missing!");
    return;
  }

  try {
    showToast("Generating download link...");
    const res = await fetch(API + `/get-download-url?file_key=${file_key}`);
    const data = await res.json();

    if (data.download_url) {
      window.location.href = data.download_url; // 🔥 force download
    } else {
      showToast("Download link not found");
    }

  } catch (e) {
    showToast("Download failed");
  }
}