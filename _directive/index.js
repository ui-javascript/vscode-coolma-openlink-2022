import Vue from "vue";
import VueCompositionApi, { onMounted, ref } from "@vue/composition-api";
import { watchDebounced, watchThrottled, useIntervalFn } from "@vueuse/core";
import "./style.less";
import unifiedParser from "./utils/unifiedParserUtil";



const App = {
  template: `
    <div>

    <nav>
      <button v-if="isActive" class="outline" @click="pause">
        本地MD文件 自动预览中（{{interval}}ms）
      </button>
      <button v-if="!isActive" class="secondary outline" @click="resume">
        开启 本地MD文件 自动预览
      </button>
    </nav> 


    <main class="container-fluid">
  
    <div class="grid">

      <textarea v-if="!isActive" style="display: block;height: 700px" v-model="before"></textarea>
      <div style="min-height: 700px" v-html="after"></div>

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

    onMounted(() => {
      before.value = window.$CONTENT
    })

    const interval = ref(500)
    const { pause, resume, isActive } = useIntervalFn(() => {
      // console.log("定时器")
      before.value = window.$CONTENT;
    }, interval, {
      immediate: false
    })


    const writeFile = () => {

      window.parent.postMessage({
        cmd: 'writeFile',
        data: {
            code: before.value,
            mdPath: window.$MDPATH
        }
      }, '*')
    }

    return {
      before,
      after,
      writeFile,
      pause, 
      resume, 
      isActive,
      interval
    };
  },
};

Vue.use(VueCompositionApi);

Vue.config.productionTip = false;

window.addEventListener("message", init, false);
const init = async (event) => {

  // console.log(JSON.stringify(event))
  // alert(JSON.stringify(event))

  if (event.data.cmd === "mountApp") {
    window.$CONTENT = event.data.data; // MD内容
    window.$MDPATH = event.data.mdPath; // MD路径

    // window.$VUE = new Vue({
    //   el: "#app",
    //   render: (h) => h(App),
    // });

    window.$VUE = new Vue({
        render: h => h(App),
    }).$mount('#app');
  
  }

  if (event.data.cmd === "mdSync" || event.data.cmd === "changeContent") {
    window.$CONTENT = event.data.data; // MD内容
    window.$MDPATH = event.data.mdPath; // MD路径
  }

};

// window.$VUE = new Vue({
//   render: h => h(App),
// }).$mount('#app');
