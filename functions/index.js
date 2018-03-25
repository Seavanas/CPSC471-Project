const functions = require('firebase-functions');
const admin = require('firebase-admin');

function buildHtmlWithPost (post) {

  const title = post.title + ' | Example Website';

  var head = {
    title: title,
    meta: [
      // This may not be a valid combination of tags for the services you need to support;
      // they're only shown here as an example.
      { property: 'og:title', content: title },
      { property: 'og:description', content: post.description },
      { property: 'og:image', content: post.imageURL },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: post.description },
      { property: 'twitter:image', content: post.imageURL }
    ],
    link: [
      { rel: 'icon', 'href': 'https://example.com/favicon.png' },
    ],
  };

  // Is this crazy object-to-HTML parsing necessary? Of course not.
  // We could have just declared one long HTML string. But alas
  var string = '<!DOCTYPE html><head>';
  Object.keys(head).forEach(key => {
    if (typeof head[key] === 'string')
      string += '<' + key + '>' + head[key] + '</' + key + '>';
    else if (Array.isArray(head[key])) {
      for (const obj of head[key]) {
        string += '<' + key;
        Object.keys(obj).forEach(key2 => {
          string += ' ' + key2 + '="' + obj[key2] + '"';
        });
        string += '>';
      }
    }
  });
  string += '</head><body>';
  string += '<script>window.location="https://instacomm-da2a2.firebaseapp.com/?post=' + post.id + '";</script>';
  string += '</body></html>';

  return string;
}

exports.post = functions.https.onRequest((req, res) => {

  const path = req.path.split('/');

  if (path.length < 3 || path[1] !== 'posts') {
    res.status(404).send('Post not found :(');
    return;
  }

  const postId = path[2];

  admin.database.ref('/posts').child(postId).once('value').then(snapshot => {

    const post = snapshot.val();
    post.id = snapshot.key;

    if (!post) {
      res.status(404).send('Post not found :(');
      return;
    }

    const htmlString = buildHtmlWithPost(post);
    res.status(200).end(htmlString);

  });
});
