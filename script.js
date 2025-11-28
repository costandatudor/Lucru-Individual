let albums = JSON.parse(localStorage.getItem("albums")) || {};
let currentAlbum = null;

const albumDiv = document.getElementById("album");
const albumSelect = document.getElementById("albumSelect");
const albumTitle = document.getElementById("albumTitle");

/* -------------------- DARK MODE -------------------- */
const toggleBtn = document.getElementById("themeToggle");
if (!localStorage.getItem("theme")) localStorage.setItem("theme", "dark");
document.body.classList.toggle("light", localStorage.getItem("theme") === "light");

toggleBtn.onclick = () => {
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
};

/* -------------------- CORE FUNCTIONS -------------------- */
function save() {
    localStorage.setItem("albums", JSON.stringify(albums));
}

function loadAlbumList() {
    albumSelect.innerHTML = "";
    for (let name in albums) albumSelect.innerHTML += `<option>${name}</option>`;
}

function createAlbum() {
    const name = albumName.value.trim();
    if (!name || albums[name]) return;

    albums[name] = [];
    save();
    loadAlbumList();
    albumSelect.value = name;
    changeAlbum();
}

function changeAlbum() {
    currentAlbum = albumSelect.value;
    albumTitle.textContent = "Album: " + currentAlbum;
    renderAlbum();
}

/* INITIAL LOAD */
loadAlbumList();
albumSelect.value = Object.keys(albums)[0];
changeAlbum();

/* -------------------- ADD IMAGES -------------------- */
document.getElementById("addBtn").onclick = () => {
    addImages(document.getElementById("fileInput").files);
};

function addImages(files) {
    for (let f of files) {
        const reader = new FileReader();
        reader.onload = () => {
            albums[currentAlbum].push({
                src: reader.result,
                name: f.name,
                date: Date.now()
            });
            save();
            renderAlbum();
        };
        reader.readAsDataURL(f);
    }
}

function renderAlbum() {
    albumDiv.innerHTML = "";
    albums[currentAlbum].forEach((img, i) => {

        const card = document.createElement("div");
        card.className = "photo-card";

        card.innerHTML = `
            <div style="position:relative;">
                <img src="${img.src}">
                <button class="delete-btn" onclick="deleteImg(${i})">X</button>
            </div>
        `;

        albumDiv.appendChild(card);
    });
}

function deleteImg(i) {
    albums[currentAlbum].splice(i, 1);
    save();
    renderAlbum();
}

/* -------------------- SORT -------------------- */
function sortImages() {
    const type = sortSelect.value;
    if (type === "name") albums[currentAlbum].sort((a,b)=>a.name.localeCompare(b.name));
    if (type === "date") albums[currentAlbum].sort((a,b)=>a.date - b.date);
    save();
    renderAlbum();
}

/* -------------------- DRAG & DROP -------------------- */
const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.style.background = "rgba(0,170,255,0.15)";
});

dropZone.addEventListener("dragleave", () => {
    dropZone.style.background = "transparent";
});

dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.style.background = "transparent";
    addImages(e.dataTransfer.files);
});

/* -------------------- ZIP DOWNLOAD -------------------- */
async function downloadAlbum() {
    const zip = new JSZip();
    const folder = zip.folder(currentAlbum);

    for (let img of albums[currentAlbum]) {
        const base64 = img.src.split(",")[1];
        folder.file(img.name, base64, {base64: true});
    }

    const blob = await zip.generateAsync({type: "blob"});
    saveAs(blob, currentAlbum + ".zip");
}

/* -------------------- SLIDESHOW -------------------- */
function startSlideshow() {
    if (albums[currentAlbum].length === 0) return;

    let index = 0;

    const overlay = document.createElement("div");
    overlay.className = "slideshow";

    const img = document.createElement("img");
    overlay.appendChild(img);

    document.body.appendChild(overlay);

    function next() {
        img.src = albums[currentAlbum][index].src;
        index = (index + 1) % albums[currentAlbum].length;
    }

    next();
    const timer = setInterval(next, 2000);

    overlay.onclick = () => {
        clearInterval(timer);
        overlay.remove();
    };
}
