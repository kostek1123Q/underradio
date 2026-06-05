const API = "https://underradio-backend.onrender.com";

let tracks = [];

/* ---------------- LOAD ---------------- */

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
    return `https://www.youtube.com/embed/${url.split("/").pop()}`;
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
  const tags = document.getElementById("tags")?.value || "";

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
  await fetch(`${API}/tracks/${id}/like`,{method:"POST"});
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

  input.value="";
  loadTracks();
}

/* ---------------- RENDER ---------------- */

async function render(){
  const box = document.getElementById("tracks");
  box.innerHTML = "";

  for(const t of tracks){

    const comments = await loadComments(t.id);

    const tags = (t.hashtags || "")
      .split(" ")
      .filter(Boolean)
      .map(tag => `<span class="tag" onclick="filterTag('${tag}')">${tag}</span>`)
      .join("");

    const previewComments = comments.slice(0,3);
    const more = comments.length > 3;

    box.innerHTML += `
      <div class="track">

        <div class="top">
          <div class="nick">${t.nickname}</div>
          <div class="like" onclick="likeTrack(${t.id})">💖 ${t.likes}</div>
        </div>

        <a href="${t.track_url}" target="_blank">OPEN</a>

        <div>${tags}</div>

        ${embed(t.track_url) ? `<iframe src="${embed(t.track_url)}"></iframe>` : ""}

        <div class="comments">
          ${previewComments.map(c =>
            `<div>💬 <b>${c.nickname}</b>: ${c.comment}</div>`
          ).join("")}

          ${more ? `<div onclick="toggleComments(${t.id})">+ more</div>` : ""}
        </div>

        <input id="c-${t.id}" class="commentBox">
        <button class="smallBtn" onclick="addComment(${t.id})">send</button>

      </div>
    `;
  }
}

/* ---------------- FILTER TAG ---------------- */

function filterTag(tag){
  document.querySelectorAll(".track").forEach(el=>{
    if(!el.innerText.includes(tag)){
      el.style.display="none";
    }
  });
}

/* ---------------- INIT ---------------- */

loadTracks();
setInterval(loadTracks, 25000);