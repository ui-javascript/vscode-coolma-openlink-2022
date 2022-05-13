import Vue from "vue";
import VueCompositionApi, { onMounted, ref } from "@vue/composition-api";
import { watchDebounced, watchThrottled, useIntervalFn } from "@vueuse/core";
import "./style.less";
import unifiedParser from "./utils/unifiedParserUtil";

// <button v-if="isActive" class="secondary outline" @click="pause">
//   关闭自动刷新
// </button>
// <button v-if="!isActive" class="outline" @click="resume">
//   开启自动刷新
// </button>

const App = {
  template: `
    <div>

    <main class="container-fluid">
  
    <div class="grid">

      <div v-html="after"></div>

    </div>
   
    </main>
    </div>

  `,
  setup() {
    const before = ref("");
    const after = ref("");

    watchDebounced(
      before,
      async () => {
        const res = await unifiedParser(before.value);

        console.log(String(res));
        after.value = String(res);
      },
      {
        debounce: 200,
        maxWait: 1000,
      }
    );

    // const interval = ref(500)
    // const { pause, resume, isActive } = useIntervalFn(() => {
    //   debugger
    //   before.value = window.$CONTENT;
    // }, interval)


    // const writeFile = () => {
    //   before.value = window.$CONTENT;

    //   // window.parent.postMessage({
    //   //   cmd: 'writeFile',
    //   //   data: {
    //   //       code: before.value,
    //   //       mdPath: window.$MDPATH
    //   //   }
    //   // }, '*')
    // }

    return {
      before,
      after,
      // writeFile,
      // pause, 
      // resume, 
      // isActive
    };
  },
};

Vue.use(VueCompositionApi);

Vue.config.productionTip = false;

window.addEventListener("message", init, false);
const init = async (event) => {
  if (event.data.cmd === "mountApp") {
    window.$CONTENT = event.data.data; // MD内容
    window.$MDPATH = event.data.mdPath; // MD路径

    window.$VUE = new Vue({
      el: "#app",
      render: (h) => h(App),
    });
  }

  if (event.data.cmd === "mdSync") {
    window.$CONTENT = event.data.data; // MD内容
    window.$MDPATH = event.data.mdPath; // MD路径

    if (window.$VUE) {
      window.$VUE.$children[0].before = window.$CONTENT
    } 
    
  }

};

window.$VUE = new Vue({
  el: "#app",
  render: (h) => h(App),
});
