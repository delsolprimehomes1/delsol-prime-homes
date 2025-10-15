export default {
  prerender: true,
  passToClient: ['pageProps'],
  isr: {
    expiration: 3600, // Regenerate every hour
  }
};
