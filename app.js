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

/* ---------------- LOAD (FIXED HARD) ---------------- */

async function loadTracks(){
  try {
    const res = await fetch(`${API}/tracks`);

    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();

    tracks = Array.isArray(data) ? data : [];

    render();

  } catch (e) {
    console.error("TRACK LOAD FAIL:", e);
    tracks = [];
    render();
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
  return str
    .split("#")
    .map(t => t.trim())
    .filter(Boolean);
}

function matchTag(track){
  if(!activeTag) return true;
  return parseTags(track.hashtags || "").includes(activeTag);
}

/* ---------------- ADD ---------------- */

async function addTrack(){
  const nick = document.getElementById("nick").value;
  const url = document.getElementById("url").value;
  const tags = document.getElementById("tags").value;

  await fetch(`${API}/tracks`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      nickname:nick,
      track_url:url,
      hashtags: tags
    })
  });

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

/* ---------------- COMMENTS ---------------- */

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
  const val = input.value.trim();
  if(!val) return;

  await fetch(`${API}/tracks/${id}/comments`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      nickname:"user",
      comment: val
    })
  });

  input.value = "";
  loadTracks();
}

/* ---------------- RENDER (FIXED CORE BUG) ---------------- */

async function render(){
  const box = document.getElementById("tracks");

  if(!Array.isArray(tracks) || tracks.length === 0){
    box.innerHTML = "<div style='opacity:.6'>no tracks yet...</div>";
    return;
  }

  const html = await Promise.all(
    tracks
      .filter(matchTag)
      .map(async (t) => {
        const comments = await loadComments(t.id);
        const tags = parseTags(t.hashtags || "");

        return `
          <div class="track">

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
                ${tags.map(tag => `<span onclick="setTag('${tag}')">#${tag}</span>`).join("")}
              </div>
            ` : ""}

            ${embed(t.track_url) ? `<iframe src="${embed(t.track_url)}"></iframe>` : ""}

            <div class="comments">
              ${(comments || []).slice(0,3).map(c =>
                `<div>💬 <b>${c.nickname}</b>: ${c.comment}</div>`
              ).join("")}
            </div>

            <input id="c-${t.id}" class="commentBox" placeholder="comment...">
            <button class="smallBtn" onclick="addComment(${t.id})">send</button>

          </div>
        `;
      })
  );

  box.innerHTML = html.join("");
}

/* ---------------- INIT ---------------- */

loadTracks();
setInterval(loadTracks, 30000);