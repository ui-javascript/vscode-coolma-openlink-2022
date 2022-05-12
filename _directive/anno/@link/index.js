import { getNextNodeByLatestAncestor, renderVoidElement } from "../../utils/utils";
import { h } from "hastscript";
import { trim } from "lodash";

export const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/

export default {
  namespace: "link",
  
  realAnnoExpectedArgNames: ['href'],
  autoConvertArg2Attr: true,
  
  realAnnoShortcutAttrs: null,

  beforeRender: {
    args2Attr: (node, ancestors) => {},

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
  render: (node, ancestors, realAnnoExpectedArgNames, realAnnoShortcutAttrs, loseAttrs)  => {

  const linkSplitArr =  node.attributes[realAnnoExpectedArgNames[0]].split("/");
  const linkSplitName =
    linkSplitArr.length > 0
      ? linkSplitArr[linkSplitArr.length - 1] || node.attributes[realAnnoExpectedArgNames[0]]
      : node.attributes[realAnnoExpectedArgNames[0]];

    const data = node.data || (node.data = {});
    const hast = h(
      node.attributes.tagName || "a",
      {
        ...node.attributes,
        [node.attributes.srcName || realAnnoExpectedArgNames[0]]: node.attributes[realAnnoExpectedArgNames[0]],
        target: "_blank",
      },
      [node.attributes.title || linkSplitName]
    );

    data.hName = hast.tagName;
    data.hProperties = hast.properties;
    data.hChildren = hast.children;



  },


};
