import Vue from "vue";
import VueCompositionApi, { onMounted, ref, watchEffect } from "@vue/composition-api";
// import { watchDebounced, watchThrottled, useIntervalFn } from "@vueuse/core";
import "./style.less";
import unifiedParser from "./utils/unifiedParserUtil";




const App = {
  template: `

  <main class="container-fluid">

  <div class="grid">

    <div v-html="after"></div>

  </div>
  
  </main>

  `,
  setup() {
    const before = ref("");
    const after = ref("");

    // 节流防抖已交给vscode插件实现
    watchEffect(async () => {
        const res = await unifiedParser(before.value);
        console.log(String(res));
        after.value = String(res);
    });

    onMounted(() => {
      before.value = window.$CONTENT
    })

    // const writeFile = () => {
    //   window.parent.postMessage({
    //     cmd: 'writeFile',
    //     data: {
    //         code: before.value,
    //         mdPath: window.$MDPATH
    //     }
    //   }, '*')
    // }

    return {
      before,
      after,
      // writeFile,
    };
  },
};

Vue.use(VueCompositionApi);

Vue.config.productionTip = false;

window.addEventListener("message", init, false);
function init (event) {

  console.log(event)

  if (event.data.cmd === "mountApp") {
    window.$CONTENT = event.data.data; // MD内容
    window.$MDPATH = event.data.mdPath; // MD路径

    window.$VUE = new Vue({
        render: h => h(App),
    }).$mount('#app');
  
  }

  if (event.data.cmd === "mdSync") {
    window.$CONTENT = event.data.data; // MD内容
    window.$MDPATH = event.data.mdPath; // MD路径

    if (window.$VUE) {
      window.$VUE.$children[0].before = window.$CONTENT
    } 
  
  }
  
};

