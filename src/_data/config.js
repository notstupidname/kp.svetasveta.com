const isDev = process.env.ELEVENTY_ENV === 'dev';
const isCF = process.env.CF_PAGES == 1;

let baseUrl = isDev ? `http://localhost:8080` : `https://project.svetasveta.com/`;

// if (isCF) {
//   baseUrl = process.env.CF_PAGES_URL;
// }

const config = {
  name: 'ProjectName',
  lang: 'ru',
  locale: 'ru_RU',
  gtag: 'GTM-KWWK3JZG', // Put Google Tag Manager tag here,like GTM-NQLKKG4
  baseUrl,
  logo: '/icon-512.png',
  social: ['https://www.facebook.com/svetasveta', 'http://instagram.com/svetasveta'],
  defaultTitle: 'светасвета',
  defaultDescription: 'Дизайн интерьера',
  defaultImage: '/icon-512.png',
}

module.exports = config;