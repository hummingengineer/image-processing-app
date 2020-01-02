<template>
  <v-app>

    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img alt="Vuetify Logo" class="shrink mr-2" contain src="https://opencv.org/wp-content/uploads/2019/02/opencv-logo-1.png" transition="scale-transition" width="40" />
        <v-img alt="Vuetify Name" class="shrink mt-1 hidden-sm-and-down" contain min-width="100" src="./assets/Logo.png" width="250" />
      </div>

      <v-spacer />

      <v-btn href="https://github.com/hummingengineer/image-processing-app" target="_blank" text>
        <span class="mr-2">개발자 홈페이지</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view :key="$route.fullPath" />
    </v-content>

  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>
