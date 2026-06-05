const API = "https://underradio-backend.onrender.com";

let tracks = [];
let commentCache = {};
let activeTag = null;
let expandedComments = {};

/* ---------------- LOAD ---------------- */

async function loadTracks(){
  const res = await fetch(`${API}/tracks`);
  tracks = await res.json();
  commentCache = {};
  render();
}

/* ---------------- TAGS ---------------- */

function parseTags(str=""){
  return str.split(/[\s,]+/)
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.startsWith("#") ? t : "#"+t);
}

function setTag(tag){
  activeTag = activeTag === tag ? null : tag;
  render();
}

function filterTracks(list){
  if(!activeTag) return list;
  return list.filter(t => (t.hashtags || "").includes(activeTag));
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

/* ---------------- COMMENTS ---------------- */

async function loadComments(id){
  if(commentCache[id]) return commentCache[id];

  const res = await fetch(`${API}/tracks/${id}/comments`);
  const data = await res.json();

  commentCache[id] = data;
  return data;
}

function toggleComments(id){
  expandedComments[id] = !expandedComments[id];
  render();
}

/* ---------------- ADD TRACK ---------------- */

async function addTrack(){
  const nick = document.getElementById("nick").value;
  const url = document.getElementById("url").value;
  const tags = parseTags(document.getElementById("tags").value).join(" ");

  await fetch(`${API}/tracks`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ nickname:nick, track_url:url, hashtags:tags })
  });

  loadTracks();
}

/* ---------------- LIKE ---------------- */

async function likeTrack(id){
  await fetch(`${API}/tracks/${id}/like`, { method:"POST" });
  const t = tracks.find(x => x.id === id);
  if(t) t.likes++;
  render();
}

/* ---------------- DELETE ---------------- */

async function deleteTrack(id){
  const pass = prompt("Admin password:");
  if(pass !== "admin") return alert("DENIED");

  await fetch(`${API}/tracks/${id}`,{
    method:"DELETE",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ password:pass })
  });

  tracks = tracks.filter(t => t.id !== id);
  render();
}

/* ---------------- COMMENTS ---------------- */

async function addComment(id){
  const input = document.getElementById(`c-${id}`);
  const text = input.value.trim();
  if(!text) return;

  await fetch(`${API}/tracks/${id}/comments`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ nickname:"user", comment:text })
  });

  input.value = "";
  delete commentCache[id];
  render();
}

/* ---------------- RENDER COMMENTS ---------------- */

function renderComments(id, comments){
  const expanded = expandedComments[id];
  const visible = expanded ? comments : comments.slice(0,2);

  return `
    ${visible.map(c => `
      <div>💬 <b>${c.nickname}</b>: ${c.comment}</div>
    `).join("")}

    ${comments.length > 2 ? `
      <button class="smallBtn" onclick="toggleComments(${id})">
        ${expanded ? "less" : `more (${comments.length})`}
      </button>
    ` : ""}
  `;
}

/* ---------------- RENDER ---------------- */

async function render(){
  const box = document.getElementById("tracks");

  const list = filterTracks(tracks);

  const html = await Promise.all(list.map(async t => {

    const comments = await loadComments(t.id);

    const tags = (t.hashtags || "")
      .split(" ")
      .filter(Boolean)
      .map(tag => `<span class="tag" onclick="setTag('${tag}')">${tag}</span>`)
      .join("");

    return `
      <div class="track">

        <div class="delete" onclick="deleteTrack(${t.id})">🗑</div>

        <div class="top">
          <div class="nick">${t.nickname}</div>
          <div class="like" onclick="likeTrack(${t.id})">💖 ${t.likes}</div>
        </div>

        <a href="${t.track_url}" target="_blank">OPEN</a>

        ${tags ? `<div class="tags">${tags}</div>` : ""}

        ${embed(t.track_url) ? `<iframe src="${embed(t.track_url)}"></iframe>` : ""}

        <div class="comments">
          ${renderComments(t.id, comments)}
        </div>

        <input id="c-${t.id}" class="commentBox">
        <button class="smallBtn" onclick="addComment(${t.id})">send</button>

      </div>
    `;
  }));

  box.innerHTML = html.join("");
}

/* ---------------- INIT ---------------- */

loadTracks();
setInterval(loadTracks, 30000);