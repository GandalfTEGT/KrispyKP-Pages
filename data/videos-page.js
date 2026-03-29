
(function(){
  const data = window.KRISPY_VIDEOS || {};
  const featured = document.getElementById('featuredVideoFrame');
  const ytList = document.getElementById('youtubeList');
  const vodList = document.getElementById('vodList');
  if(featured){
    if(data.featuredYouTubeId && data.featuredYouTubeId !== 'REPLACE_WITH_VIDEO_ID'){
      featured.src = `https://www.youtube.com/embed/${data.featuredYouTubeId}`;
    } else {
      featured.srcdoc = `<style>body{margin:0;display:grid;place-items:center;background:#0b1014;color:#93b2bc;font-family:Segoe UI,Arial,sans-serif;text-align:center;padding:24px}</style><div><div style="font-size:14px;letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px">Placeholder</div><div>Replace <b>featuredYouTubeId</b> in <b>data/videos.js</b></div></div>`;
    }
  }
  function renderList(host, items){
    if(!host) return;
    host.innerHTML = '';
    (items || []).forEach(item => {
      const article = document.createElement('article');
      article.className = 'frame media-item';
      article.innerHTML = `<div><h3>${item.title}</h3><p>${item.note || 'Placeholder'}</p></div><a class="media-tag" href="${item.url || '#'}" target="_blank" rel="noopener noreferrer">${item.tag || 'Open'}</a>`;
      host.appendChild(article);
    });
  }
  renderList(ytList, data.youtubeItems);
  renderList(vodList, data.vodItems);
})();
