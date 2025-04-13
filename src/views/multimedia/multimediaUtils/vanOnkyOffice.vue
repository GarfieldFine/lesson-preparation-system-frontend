<template>
  <div id="vabOnlyOffice"></div>
</template>

<script>
import { getFileType } from "/src/views/multimedia/multimediaUtils/wayne.js";

export default {
  name: "VabOnlyOffice",
  props: {
    option: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      doctype: "",
      //参数说明
      parameters: {
        document: {
          //文件扩展名
          fileType: "pptx",
          //key 默认置空则不走缓存 always update
          key: "",
          //为已查看或编辑的文档定义所需的文件名，该文件名在下载文档时也将用作文件名。
          title: "",
          //文件地址
          url: "",
          //相关权限
          permissions: {
            copy: true, //定义内容是否可以复制到剪贴板。如果该参数设置为false，则只能在当前文档编辑器中粘贴内容。默认值为true。
            download: true, //定义文档是可以下载还是只能在线查看或编辑。如果下载权限设置为“假”的下载为...菜单选项将是缺席的文件菜单。默认值为true。
            edit: true, //定义文档是可以编辑还是只能查看。如果编辑权限设置为“true”，则文件菜单将包含编辑文档菜单选项；请注意，如果编辑权限设置为“false”，文档将在查看器中打开，即使模式参数设置为edit，您也无法将其切换到编辑器。默认值为true。
            print: true, //定义是否可以打印文档。如果打印权限设置为“false”的打印菜单选项将是缺席的文件菜单。默认值为true
          },
        },
        //文件类型
        documentType: "slide",
        height: "100%",
        width: "100%",
        editorConfig: {
          //语言：zh-CN简体中文/en英文
          lang: "zh-CN",
          //阅读状态 view/edit
          mode: "edit",
          customization: {
            //是否显示插件
            plugins: false,
          },
        },
      },
    };
  },
  watch: {
    option: {
      handler: function (n) {
        this.setEditor(n);
        this.doctype = getFileType(n.fileType);
      },
      deep: true,
    },
  },
  mounted() {
    if (this.option.url) {
      this.setEditor(this.option);
    }
  },
  methods: {
    async setEditor(option) {
      this.doctype = getFileType(option.fileType);

      let config = {
        document: {
          //后缀
          fileType: option.fileType,
          key: "yRlt4nZ5v5BX6ER1OGG5S19A1aOcGF0W",
          title: option.title,
          permissions: {
            edit: option.isEdit, //是否可以编辑: 只能查看，传false
            print: option.isPrint,
            download: false,
            // "fillForms": true,//是否可以填写表格，如果将mode参数设置为edit，则填写表单仅对文档编辑器可用。 默认值与edit或review参数的值一致。
            // "review": true //跟踪变化
          },
          url: option.url,
        },
        documentType: this.doctype,
        editorConfig: {
          callbackUrl: option.editUrl, //"编辑word后保存时回调的地址，这个api需要自己写了，将编辑后的文件通过这个api保存到自己想要的位置
          lang: option.lang, //语言设置
          //定制
          customization: {
            autosave: true, //是否自动保存
            chat: false,
            comments: false,
            help: false,
            // "hideRightMenu": false,//定义在第一次加载时是显示还是隐藏右侧菜单。 默认值为false
            //是否显示插件
            plugins: true,
            //暂时无法生效
            customer: {
              address: "12333333333",
              info: "S11",
              logo: "123",
              mail: "j123",
              name: "123",
              www: "123",
            },
          },
        },
        width: "100%",
        height: "100%",
      };

      // eslint-disable-next-line no-undef
      new DocsAPI.DocEditor("vabOnlyOffice", config);
    },
  },
};
</script>

