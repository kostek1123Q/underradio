const API = "https://underradio-backend.onrender.com";

let tracks = [];
let commentCache = {}; // cache comments per track
let expandedComments = {};
let activeTag = null;

/* ---------------- LOAD ---------------- */

async function loadTracks(){
  const res = await fetch(`${API}/tracks`);
  tracks = await res.json();

  // reset cache when refresh from server
  commentCache = {};
  render();
}

/* ---------------- EMBED ---------------- */

function embed(url){
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

/* ---------------- HASHTAGS ---------------- */

function parseTags(str=""){
  return str
    .split(/[\s,]+/)
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.startsWith("#") ? t : "#" + t);
}

function filterTracks(){
  if(!activeTag) return tracks;
  return tracks.filter(t =>
    (t.hashtags || "").includes(activeTag)
  );
}

/* ---------------- COMMENTS ---------------- */

async function loadComments(id){
  if(commentCache[id]) return commentCache[id];

  const res = await fetch(`${API}/tracks/${id}/comments`);
  const data = await res.json();

  commentCache[id] = data;
  return data;
}

/* ---------------- ADD TRACK ---------------- */

async function addTrack(){
  const nick = document.getElementById("nick").value;
  const url = document.getElementById("url").value;
  const tagsRaw = document.getElementById("tags").value;

  const hashtags = parseTags(tagsRaw).join(" ");

  const res = await fetch(`${API}/tracks`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      nickname:nick,
      track_url:url,
      hashtags
    })
  });

  const newTrack = await res.json();
  tracks.unshift(newTrack);

  render();
}

/* ---------------- LIKE (NO RELOAD) ---------------- */

async function likeTrack(id){
  const res = await fetch(`${API}/tracks/${id}/like`, {
    method:"POST"
  });

  if(!res.ok) return;

  const t = tracks.find(x => x.id === id);
  if(t){
    t.likes++;
    renderTrack(id);
  }
}

/* ---------------- DELETE (WIN98 STYLE) ---------------- */

async function deleteTrack(id){
  const pass = prompt("🔐 Windows 98 Admin Panel\nEnter password:");

  if(pass !== "admin"){
    alert("Access denied.");
    return;
  }

  const res = await fetch(`${API}/tracks/${id}`, {
    method:"DELETE"
  });

  if(!res.ok) return;

  tracks = tracks.filter(t => t.id !== id);
  delete commentCache[id];

  render();
}

/* ---------------- COMMENT (NO RELOAD) ---------------- */

async function addComment(id){
  const input = document.getElementById(`c-${id}`);
  const text = input.value.trim();

  if(!text) return;

  await fetch(`${API}/tracks/${id}/comments`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      nickname:"user",
      comment: text
    })
  });

  input.value = "";
  delete commentCache[id];

  // update only comments section
  const box = document.querySelector(`#comments-${id}`);
  if(box){
    const comments = await loadComments(id);
    box.innerHTML = renderComments(id, comments);
  }
}

/* ---------------- COMMENTS UI ---------------- */

function renderComments(id, comments){

  const expanded = expandedComments[id];

  const visible = expanded ? comments : comments.slice(0, 2);

  return `
    ${visible.map(c =>
      `<div>💬 <b>${c.nickname}</b>: ${c.comment}</div>`
    ).join("")}

    ${comments.length > 2 ? `
      <button class="smallBtn" onclick="toggleComments(${id})">
        ${expanded ? "show less" : `more (${comments.length})`}
      </button>
    ` : ""}
  `;
}

function toggleComments(id){
  expandedComments[id] = !expandedComments[id];
  render();
}

/* ---------------- TAG CLICK ---------------- */

function setTag(tag){
  activeTag = tag === activeTag ? null : tag;
  render();
}

/* ---------------- RENDER SINGLE ---------------- */

async function renderTrack(id){
  const t = tracks.find(x => x.id === id);
  if(!t) return;

  const el = document.getElementById(`track-${id}`);
  if(el) el.outerHTML = await buildTrackHTML(t);
}

/* ---------------- FULL RENDER ---------------- */

async function render(){
  const box = document.getElementById("tracks");
  const list = filterTracks();

  const html = await Promise.all(list.map(t => buildTrackHTML(t)));

  box.innerHTML = html.join("");
}

/* ---------------- BUILD TRACK ---------------- */

async function buildTrackHTML(t){

  const comments = await loadComments(t.id);

  const tags = (t.hashtags || "")
    .split(" ")
    .filter(Boolean)
    .map(tag => `<span class="tag" onclick="setTag('${tag}')">${tag}</span>`)
    .join(" ");

  return `
    <div class="track" id="track-${t.id}">

      <div class="delete" onclick="deleteTrack(${t.id})">🗑</div>

      <div class="top">
        <div class="nick">${t.nickname}</div>

        <div class="like" onclick="likeTrack(${t.id})">
          💖 ${t.likes}
        </div>
      </div>

      <a href="${t.track_url}" target="_blank">OPEN</a>

      ${tags ? `<div class="tags">${tags}</div>` : ""}

      ${embed(t.track_url) ? `
        <iframe src="${embed(t.track_url)}"></iframe>
      ` : ""}

      <div class="comments" id="comments-${t.id}">
        ${renderComments(t.id, comments)}
      </div>

      <input id="c-${t.id}" class="commentBox" placeholder="comment...">
      <button class="smallBtn" onclick="addComment(${t.id})">send</button>

    </div>
  `;
}

/* ---------------- INIT ---------------- */

loadTracks();
setInterval(loadTracks, 30000);