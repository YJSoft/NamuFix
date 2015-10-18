function getEnvironment() {
  var ENV = {};
  ENV.IsSSL = location.protocol == "https:";
  ENV.IsEditing = /^\/edit\/(.+?)/.test(location.pathname);
  ENV.IsDiscussing = /^\/topic\/([0-9]+?)/.test(location.pathname);
  ENV.IsDocument = /^\/w\/(.+)/.test(location.pathname); //&& document.querySelector('p.wiki-edit-date');
  ENV.IsSettings = /^\/settings/.test(location.pathname);
  ENV.IsUserPage = /^\/contribution\/(?:author|ip)\/.+\/(?:document|discuss)/.test(location.pathname);
  ENV.IsUploadPage = /^\/Upload$/.test(location.pathname);
  ENV.IsDiff = /^\/diff\/.+/.test(location.pathname);
  ENV.IsLoggedIn = document.querySelector('img.user-img') != null;
  if (ENV.IsLoggedIn) {
    ENV.UserName = document.querySelector('div.user-info > div.user-info > div:first-child').textContent.trim();
  }
  if (document.querySelector("input[name=section]"))
    ENV.section = document.querySelector("input[name=section]").value;
  else
    ENV.section = -2;
  if (document.querySelector("h1.title > a"))
    ENV.docTitle = document.querySelector("h1.title > a").innerHTML;
  else if (document.querySelector("h1.title"))
    ENV.docTitle = document.querySelector("h1.title").innerHTML;
  if (ENV.Discussing) {
    ENV.topicNo = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/topic\/([0-9]+)/.exec(location.href)[1];
    ENV.topicTitle = document.querySelector('article > h2').innerHTML;
  }
  if (ENV.IsDiff) {
    //ENV.docTitle = /diff\/(.+?)\?/.exec(location.href)[1];
    ENV.beforeRev = Number(/[\&\?]oldrev=([0-9]+)/.exec(location.href)[1]);
    ENV.afterRev = Number(/[\&\?]rev=([0-9]+)/.exec(location.href)[1]);
  }
  return ENV;
}
