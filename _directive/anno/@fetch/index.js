import Axios from "axios";
import { renderVoidElement } from "../../utils/utils";
import { h } from "hastscript";
import { nanoid } from "nanoid";
import { difference, intersection, trim } from "lodash";

export const api = {
  weather: "https://v0.yiketianqi.com/api?unescape=1&version=v91&appid=43656176&appsecret=I42og6Lm&ext=&cityid=&city="
}

export const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/

export default {
  namespace: "fetch",
  
  realAnnoExpectedArgNames: ['url'],
  autoConvertArg2Attr: true,
  
  realAnnoShortcutAttrs: Object.keys(api),

  beforeRender: {
    args2Attr: (node, ancestors) => {},

    // 不要用后置节点
    nextNode2Attr: (node, ancestors, realAnnoExpectedArgNames, nextNode) => {
        // 判断后置节点内容是否为URL
        let nextVal = trim(nextNode.value)
        if (!urlRegex.test(nextVal)) {
            return
        }
        
        node.attributes[realAnnoExpectedArgNames[0]] = nextVal
        renderVoidElement(nextNode) // 取值结束不再需要渲染后置节点
    }

  },

  // @advice node.args映射至node.attributes的工作 请在beforeRender的函数内完成
  render: async (node, ancestors, realAnnoExpectedArgNames, realAnnoShortcutAttrs, loseAttrs) => {
    let isWeatherApi = false;

    // 没有快捷属性匹配
    // const shortcutAttrMatch = intersection(realAnnoShortcutAttrs, node.attributes)
    if (loseAttrs && loseAttrs.length > 0 
      && realAnnoShortcutAttrs && realAnnoShortcutAttrs.length > 0) { // 需要补全缺失的属性

      for (let idx in realAnnoShortcutAttrs) {
        const shortcutAttr = realAnnoShortcutAttrs[idx]
        if (node.attributes[shortcutAttr] && api[shortcutAttr]) {
          node.attributes[realAnnoExpectedArgNames[0]] = api[shortcutAttr];
          isWeatherApi =  shortcutAttr === "weather"
          break
        }
      }
   
      // 仍然没有矫正属性则提前结束
      if (!node.attributes[realAnnoExpectedArgNames[0]]) {
        return 
      }
    }


    

    const tableId = nanoid();
    const loadingDivId = nanoid();
    const tableTitleId = nanoid();

    const data = node.data || (node.data = {});
    const hast = h(
      `div#${loadingDivId}`,
      { "aria-busy": "true", style: "width: 100%;min-height: 50px;" },
      // @todo 耦合代码
      [
        h("figure", {}, [
          isWeatherApi
            ? [
                h(`table#${tableId}`, { role: "grid" }, []),
                h(`h6#${tableTitleId}`, { class: "text-center" }, ""),
              ]
            : [h(`table#${tableId}`, { role: "grid" }, [])],
        ]),
      ]
    );

    data.hName = hast.tagName;
    data.hProperties = hast.properties;
    data.hChildren = hast.children;

    const res = await Axios.get(node.attributes[realAnnoExpectedArgNames[0]]);

    let resData;
    if (res.data) {
      if (res.data.data) {
        resData = res.data.data;
      } else {
        resData = res.data;
      }
    } else {
      resData = res;
    }

    let includeKeys = node.attributes["includeKeys"];

    // @todo 耦合代码
    if (isWeatherApi && !includeKeys) {
      includeKeys = ["day", "date", "week", "wea"];
    }

    const table = document.getElementById(tableId);
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    for (let key in resData[0]) {
      if (
        includeKeys &&
        !includeKeys.includes("*") &&
        !includeKeys.includes(key)
      ) {
        continue;
      }
      const th = document.createElement("th");
      th.innerText = key;
      tr.appendChild(th);
    }
    thead.appendChild(tr);

    const tbody = document.createElement("tbody");
    for (let i = 0; i < resData.length; i++) {
      const tr = document.createElement("tr");
      for (let key in resData[i]) {
        if (
          includeKeys &&
          !includeKeys.includes("*") &&
          !includeKeys.includes(key)
        ) {
          continue;
        }
        const td = document.createElement("td");
        td.innerText = JSON.stringify(resData[i][key]);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    let loadingDiv = document.getElementById(loadingDivId);
    loadingDiv.setAttribute("aria-busy", false);

    // @todo 耦合代码
    if (isWeatherApi) {
      let tableTitle = document.getElementById(tableTitleId);
      tableTitle.innerText = `(${res.data.city}-未来一周天气表)`;
    }
  },
};
