const API = "https://underradio-backend.onrender.com";

let tracks = [];

/* ---------------- SMART KEEP-ALIVE ---------------- */

let lastPing = 0;
let failCount = 0;

async function smartKeepAlive() {
  const now = Date.now();

  // 1 request / 60s max
  if (now - lastPing < 60000) return;

  // only when tab active
  if (document.hidden) return;

  lastPing = now;

  try {
    await fetch(`${API}/test`);
    failCount = 0;
    console.log("🟢 keep-alive OK");

  } catch (e) {
    failCount++;
    console.log("🔴 keep-alive FAIL:", failCount);

    // backoff (max 5 min)
    lastPing = Date.now() + Math.min(60000 * failCount, 300000);
  }
}

smartKeepAlive();
setInterval(smartKeepAlive, 15000);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) smartKeepAlive();
});

/* ---------------- LOAD TRACKS ---------------- */

async function loadTracks(){
  const res = await fetch(`${API}/tracks`);
  tracks = await res.json();
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

/* ---------------- COMMENTS ---------------- */

async function loadComments(id){
  const res = await fetch(`${API}/tracks/${id}/comments`);
  return await res.json();
}

/* ---------------- ADD TRACK ---------------- */

async function addTrack(){
  const nick = document.getElementById("nick").value;
  const url = document.getElementById("url").value;

  await fetch(`${API}/tracks`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ nickname:nick, track_url:url })
  });

  document.getElementById("nick").value = "";
  document.getElementById("url").value = "";

  loadTracks();
}

/* ---------------- LIKE ---------------- */

async function likeTrack(id){
  await fetch(`${API}/tracks/${id}/like`, { method:"POST" });
  loadTracks();
}

/* ---------------- COMMENT ---------------- */

async function addComment(id){
  const input = document.getElementById(`c-${id}`);

  await fetch(`${API}/tracks/${id}/comments`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      nickname:"user",
      comment: input.value
    })
  });

  input.value = "";
  loadTracks();
}

/* ---------------- RENDER ---------------- */

async function render(){

  const box = document.getElementById("tracks");
  box.innerHTML = "";

  for(const t of tracks){

    const comments = await loadComments(t.id);

    box.innerHTML += `
      <div class="track">

        <div class="top">
          <div class="nick">${t.nickname}</div>

          <div class="like" onclick="likeTrack(${t.id})">
            💖 ${t.likes}
          </div>
        </div>

        <a href="${t.track_url}" target="_blank">OPEN</a>

        ${embed(t.track_url) ? `
          <iframe src="${embed(t.track_url)}"></iframe>
        ` : ""}

        <div class="comments">
          ${comments.map(c =>
            `<div>💬 <b>${c.nickname}</b>: ${c.comment}</div>`
          ).join("")}
        </div>

        <input id="c-${t.id}" class="commentBox" placeholder="comment...">
        <button class="smallBtn" onclick="addComment(${t.id})">send</button>

      </div>
    `;
  }
}

loadTracks();
setInterval(loadTracks, 25000);