module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  "pluginOptions": {
    "electronBuilder": {
      "builderOptions": {
        "win": {
          "target": ["portable"]
        },
        "portable": {
          "artifactName": "Image-Processor_portable_x64.exe"
        }
      }
    }
  }
}
