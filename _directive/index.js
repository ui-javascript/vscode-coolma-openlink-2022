import Vue from "vue";
import VueCompositionApi, {
  onMounted,
  ref,
} from "@vue/composition-api";
import { watchDebounced, watchThrottled } from '@vueuse/core'
import "./style.less";
import unifiedParser from "./utils/unifiedParserUtil";

const App = {
  template: `
    <div>

    <nav>
      <button role="button" @click="writeFile">更新MD文件 + 关闭Tab页面</button>
    </nav>

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

    watchDebounced(before, async () => {
        const res = await unifiedParser(before.value);

        console.log(String(res));
        after.value = String(res);
    }, { 
      debounce: 200, 
      maxWait: 1000
    });

    onMounted(() => {
      before.value = window.$CONTENT
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
      writeFile
    };
  },
};

Vue.use(VueCompositionApi);

Vue.config.productionTip = false;

window.addEventListener('message', init, false)
function init(event) {
    if (event.data.cmd === 'mountApp') {
        window.$CONTENT = event.data.data // MD内容
        window.$MDPATH = event.data.mdPath // MD路径
  
        window.$VUE = new Vue({
          el: "#app",
          render: (h) => h(App),
        });
    }

    if (event.data.cmd === 'changeContent') {
      window.$CONTENT = event.data.data // MD内容
      window.$MDPATH = event.data.mdPath // MD路径


      window.$VUE.before.value = window.$CONTENT
    }
}

// new Vue({
//   el: "#app",
//   render: (h) => h(App),
// });
