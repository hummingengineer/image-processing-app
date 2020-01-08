<template>
  <v-container>

    <v-row>
      <v-col>
        <v-file-input v-model="originalFile" class="mt-5" label="파일 선택" outlined prepend-icon="mdi-camera" accept="image/*" :clearable="false" append-outer-icon="mdi-close-circle" @click:append-outer="previewImg = null; originalFile = null; convertedImg = null; selectedTechnique = null" />
      </v-col>
    </v-row>

    <v-autocomplete v-model="selectedTechnique" label="적용할 기법 선택" :items="techniques" no-data-text="검색결과가 없습니다"></v-autocomplete>

    <v-row class="text-center">
      <v-col>
        <v-btn icon text @click="convertImg" color="#E91E63" large :disabled="!originalFile || !selectedTechnique ? true : false">
          <v-icon>mdi-reload</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-subheader>기존 이미지</v-subheader>
        <v-img v-if="previewImg" :src="previewImg"></v-img>
      </v-col>
      <v-col>
        <v-subheader>변환된 이미지</v-subheader>
        <v-img v-if="convertedImg" :src="convertedImg"></v-img>
      </v-col>
    </v-row>

    <v-row v-if="convertedImg" class="text-center">
      <v-col>
        <a style="text-decoration: none;" :href="convertedImg" :download="`${selectedTechnique}_${originalFile.name}`"><v-btn class="mt-5" light color="success">변환된 이미지 다운로드</v-btn></a>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'home',

  data: function () {
    return {
      originalFile: null,
      previewImg: null,
      convertedImg: null,
      techniques: [
        'Image Thresholding', 'Dilate'
      ],
      selectedTechnique: null
    }
  },

  watch: {
    originalFile: function (val) {
      if(!val || val.length === 0) { this.previewImg = null; this.originalFile = null; this.convertedImg = null; this.selectedTechnique = null; return; }
      let reader = new FileReader()
      reader.addEventListener('load', () => {
        this.previewImg = reader.result
      }, false)
      reader.readAsDataURL(val)
    }
  },

  methods: {
    convertImg: function () {
      ipcRenderer.once('convert-image', (event, converted) => {
        this.convertedImg = converted
      })
      ipcRenderer.send('convert-image', this.originalFile.path, this.selectedTechnique)
    }
  }

}
</script>

<style>

</style>
