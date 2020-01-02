<template>
  <v-container>
    <v-row>
      <v-col>
        <v-file-input v-model="originalFile" class="mt-5" label="파일 선택" outlined prepend-icon="mdi-camera" accept="image/*" :clearable="false" append-outer-icon="mdi-close-circle" @click:append-outer="previewImg = null; originalFile = null" />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-subheader>기존 이미지</v-subheader>
        <v-img v-if="previewImg" :src="previewImg"></v-img>
      </v-col>
      <v-col>
        <v-subheader>변환된 이미지</v-subheader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'home',

  data: function () {
    return {
      originalFile: null,
      convertedFile: null,
      previewImg: null
    }
  },

  watch: {
    originalFile: function (val) {
      if(!val) return;
      let reader = new FileReader()
      reader.addEventListener('load', () => {
        this.previewImg = reader.result
      }, false)
      reader.readAsDataURL(val)
    }
  }

}
</script>

<style>

</style>
