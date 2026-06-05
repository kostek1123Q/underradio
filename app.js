const API = "https://underradio-backend.onrender.com";

let tracks = [];

/* --------------------------
   🔥 KEEP ALIVE (bezpieczny)
---------------------------*/
function keepAlive(){
  fetch(`${API}/test`)
    .then(r => console.log("PING OK:", r.status))
    .catch(e => console.log("PING FAIL:", e.message));
}
setInterval(keepAlive, 25000);
keepAlive();

/* --------------------------
   LOAD TRACKS (SAFE)
---------------------------*/
async function loadTracks(){
  try {
    const res = await fetch(`${API}/tracks`);

    if(!res.ok){
      console.log("TRACKS ERROR STATUS:", res.status);
      return;
    }

    tracks = await res.json();
    render();

  } catch (e) {
    console.log("LOAD ERROR:", e.message);
  }
}

/* --------------------------
   EMBED
---------------------------*/
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
    return url.replace("open.spotify.com","open.spotify.com/embed");
  }

  if(url.includes("soundcloud")){
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
  }

  return "";
}

/* --------------------------
   ADD TRACK (FULL DEBUG FIX)
---------------------------*/
async function addTrack(){

  const nick = document.getElementById("nick").value.trim();
  const url = document.getElementById("url").value.trim();

  console.log("ADD CLICK:", {nick, url});

  if(!nick || !url){
    alert("UZUPEŁNIJ POLA");
    return;
  }

  try {

    const res = await fetch(`${API}/tracks`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        nickname:nick,
        track_url:url
      })
    });

    const text = await res.text();
    console.log("RESPONSE:", res.status, text);

    if(!res.ok){
      alert("BŁĄD BACKEND: " + text);
      return;
    }

    alert("DODANO ✔");

    document.getElementById("nick").value = "";
    document.getElementById("url").value = "";

    loadTracks();

  } catch (e) {
    console.log("FETCH ERROR:", e);
    alert("BRAK POŁĄCZENIA: " + e.message);
  }
}

/* --------------------------
   LIKE
---------------------------*/
async function likeTrack(id){
  try {
    await fetch(`${API}/tracks/${id}/like`,{method:"POST"});
    loadTracks();
  } catch(e){
    alert("LIKE ERROR");
  }
}

/* --------------------------
   COMMENTS
---------------------------*/
async function addComment(id){

  const input = document.getElementById(`c-${id}`);
  const value = input.value.trim();

  if(!value) return;

  try {
    await fetch(`${API}/tracks/${id}/comments`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        nickname:"user",
        comment:value
      })
    });

    input.value = "";
    loadTracks();

  } catch(e){
    alert("COMMENT ERROR");
  }
}

/* --------------------------
   RENDER
---------------------------*/
function render(){

  tracks.sort((a,b)=>b.likes-a.likes);

  const box = document.getElementById("tracks");
  box.innerHTML = "";

  tracks.forEach(t => {

    box.innerHTML += `
      <div class="track">

        <div class="top">
          <div class="nick">${t.nickname}</div>

          <div class="like" onclick="likeTrack(${t.id})">
            🔥 ${t.likes}
          </div>
        </div>

        <a href="${t.track_url}" target="_blank">open link</a>

        ${embed(t.track_url) ? `
          <iframe src="${embed(t.track_url)}"></iframe>
        ` : ""}

        <input class="commentBox" id="c-${t.id}" placeholder="komentarz">
        <button class="smallBtn" onclick="addComment(${t.id})">dodaj</button>

      </div>
    `;
  });
}

/* --------------------------
   INIT
---------------------------*/
loadTracks();
setInterval(loadTracks, 5000);