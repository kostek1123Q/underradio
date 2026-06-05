const API = "https://underradio-backend.onrender.com";

let tracks = [];
let activeTag = null;

/* ---------------- DEVICE MODE ---------------- */

function setDeviceMode(){
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.innerWidth < 768;

  document.body.classList.toggle("mobile", isMobile);
  document.body.classList.toggle("desktop", !isMobile);
}

setDeviceMode();
window.addEventListener("resize", setDeviceMode);

/* ---------------- LOAD ---------------- */

async function loadTracks(){
  try {
    const res = await fetch(`${API}/tracks`);
    tracks = await res.json();
    render();
  } catch (e) {
    console.error("TRACK LOAD ERROR", e);
  }
}

/* ---------------- EMBED ---------------- */

function embed(url=""){
  if(!url) return "";

  if(url.includes("youtube.com/watch")){
    const id = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  if(url.includes("youtu.be")){
    const id = url.split("/").pop();
    return `https://www.youtube.com/embed/${id}`;
  }

  if(url.includes("spotify")){
    const id = url.split("/track/")[1]?.split("?")[0];
    return `https://open.spotify.com/embed/track/${id}`;
  }

  if(url.includes("soundcloud")){
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
  }

  return "";
}

/* ---------------- TAGS ---------------- */

function parseTags(str=""){
  return (str || "")
    .split("#")
    .map(t => t.trim())
    .filter(Boolean);
}

function matchTag(track){
  if(!activeTag) return true;

  const tags = parseTags(track.hashtags);
  return tags.includes(activeTag);
}

/* ---------------- ADD TRACK ---------------- */

async function addTrack(){
  const nick = document.getElementById("nick").value.trim();
  const url = document.getElementById("url").value.trim();
  const tags = document.getElementById("tags").value.trim();

  await fetch(`${API}/tracks`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      nickname:nick,
      track_url:url,
      hashtags: tags
    })
  });

  document.getElementById("nick").value = "";
  document.getElementById("url").value = "";
  document.getElementById("tags").value = "";

  loadTracks();
}

/* ---------------- LIKE ---------------- */

async function likeTrack(id){
  await fetch(`${API}/tracks/${id}/like`, { method:"POST" });
  loadTracks();
}

/* ---------------- DELETE ---------------- */

async function deleteTrack(id){
  const pass = prompt("ADMIN PASSWORD:");
  if(!pass) return;

  await fetch(`${API}/tracks/${id}`,{
    method:"DELETE",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ password: pass })
  });

  loadTracks();
}

/* ---------------- COMMENTS (SAFE + NON-BLOCKING) ---------------- */

async function loadComments(id){
  try {
    const res = await fetch(`${API}/tracks/${id}/comments`);
    return await res.json();
  } catch {
    return [];
  }
}

async function addComment(id){
  const input = document.getElementById(`c-${id}`);
  const value = input.value.trim();

  if(!value) return;

  await fetch(`${API}/tracks/${id}/comments`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      nickname:"user",
      comment: value
    })
  });

  input.value = "";

  // NIE reload całej listy (ważne)
  render();
}

/* ---------------- TAG FILTER ---------------- */

function setTag(tag){
  activeTag = tag;
  render();
}

/* ---------------- RENDER (FIXED CORE ISSUE) ---------------- */

async function render(){
  const box = document.getElementById("tracks");

  if(!tracks || tracks.length === 0){
    box.innerHTML = "<div style='opacity:.6'>no tracks yet...</div>";
    return;
  }

  box.innerHTML = "";

  const filtered = tracks.filter(matchTag);

  for(const t of filtered){

    const el = document.createElement("div");
    el.className = "track";

    const tags = parseTags(t.hashtags);

    el.innerHTML = `
      <div class="delete" onclick="deleteTrack(${t.id})">🗑</div>

      <div class="top">
        <div class="nick">${t.nickname ?? ""}</div>

        <div class="like" onclick="likeTrack(${t.id})">
          💖 ${t.likes ?? 0}
        </div>
      </div>

      <a href="${t.track_url}" target="_blank">OPEN</a>

      ${tags.length ? `
        <div class="tags">
          ${tags.map(tag =>
            `<span onclick="setTag('${tag}')">#${tag}</span>`
          ).join("")}
        </div>
      ` : ""}

      ${embed(t.track_url) ? `
        <iframe src="${embed(t.track_url)}"></iframe>
      ` : ""}

      <div class="comments" id="comments-${t.id}">
        loading comments...
      </div>

      <input id="c-${t.id}" class="commentBox" placeholder="comment...">
      <button class="smallBtn" onclick="addComment(${t.id})">send</button>
    `;

    box.appendChild(el);

    // 🔥 COMMENTS LOADING AFTER RENDER (NO BLOCK)
    loadComments(t.id).then(comments => {
      const cBox = document.getElementById(`comments-${t.id}`);
      if(!cBox) return;

      cBox.innerHTML = (comments || [])
        .slice(0,3)
        .map(c => `<div>💬 <b>${c.nickname}</b>: ${c.comment}</div>`)
        .join("");
    });
  }
}

/* ---------------- INIT ---------------- */

loadTracks();
setInterval(loadTracks, 30000);