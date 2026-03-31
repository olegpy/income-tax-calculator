module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['accessibility'],
    emulatedFormFactor: 'desktop',
  },
}
