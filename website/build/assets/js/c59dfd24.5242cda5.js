(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{85:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return c})),t.d(n,"metadata",(function(){return i})),t.d(n,"toc",(function(){return l})),t.d(n,"default",(function(){return s}));var r=t(3),a=t(7),o=(t(0),t(93)),c={id:"introduction",title:"Introduction to GraphQL Config",sidebar_label:"Introduction"},i={unversionedId:"introduction",id:"introduction",isDocsHomePage:!1,title:"Introduction to GraphQL Config",description:"GraphQL Config",source:"@site/docs/user-introduction.md",slug:"/introduction",permalink:"/introduction",editUrl:"https://github.com/kamilkisiela/graphql-config/edit/master/website/docs/user-introduction.md",version:"current",sidebar_label:"Introduction",sidebar:"docs",next:{title:"Installation",permalink:"/installation"}},l=[{value:"As a developer",id:"as-a-developer",children:[]},{value:"As a library author",id:"as-a-library-author",children:[]},{value:"Examples",id:"examples",children:[{value:"<code>.graphqlrc</code>, or <code>.graphqlrc.yml/yaml</code>",id:"graphqlrc-or-graphqlrcymlyaml",children:[]},{value:"<code>.graphqlrc</code>,<code>graphql.config.json</code> or <code>.graphqlrc.json</code>",id:"graphqlrcgraphqlconfigjson-or-graphqlrcjson",children:[]},{value:"<code>graphql.config.toml</code> or <code>.graphqlrc.toml</code>",id:"graphqlconfigtoml-or-graphqlrctoml",children:[]},{value:"<code>graphql.config.js</code> or <code>.graphqlrc.js</code>",id:"graphqlconfigjs-or-graphqlrcjs",children:[]},{value:"<code>graphql.config.ts</code> or <code>.graphqlrc.ts</code>",id:"graphqlconfigts-or-graphqlrcts",children:[]},{value:"Custom paths",id:"custom-paths",children:[]},{value:"Lookup Order",id:"lookup-order",children:[]}]}],p={toc:l};function s(e){var n=e.components,t=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},p,t,{components:n,mdxType:"MDXLayout"}),Object(o.b)("h1",{id:"graphql-config"},"GraphQL Config"),Object(o.b)("p",null,"There are many ways to configure your application to use GraphQL, and while it is often enough to specify configuration options directly in your application code, maintaining and understanding the hard-coded configuration options may become a challenge as the scale grows. We recommend configuring your application with a ",Object(o.b)("inlineCode",{parentName:"p"},".graphqlrc")," file that contains commonly needed GraphQL-related artifacts."),Object(o.b)("p",null,"Think about GraphQL Config as ",Object(o.b)("strong",{parentName:"p"},"one configuration for all your GraphQL tools"),"."),Object(o.b)("p",null,"The basic idea is to have one configuration file that any GraphQL tool could consume. "),Object(o.b)("h2",{id:"as-a-developer"},"As a developer"),Object(o.b)("p",null,"From the developer perspective, you gain simplicity and a central place to setup libraries, tools and your IDE extensions. "),Object(o.b)("h2",{id:"as-a-library-author"},"As a library author"),Object(o.b)("p",null,"From the point of view of a library author, GraphQL Config makes it easier to maintain the code responsible for handling configuration, loading GraphQL schemas or even files with GraphQL operations and fragments. GraphQL Config provides a set of useful methods and an easy-to-work-with API."),Object(o.b)("h2",{id:"examples"},"Examples"),Object(o.b)("p",null,"Learn more in ",Object(o.b)("a",{parentName:"p",href:"usage"},"usage docs")),Object(o.b)("h3",{id:"graphqlrc-or-graphqlrcymlyaml"},Object(o.b)("inlineCode",{parentName:"h3"},".graphqlrc"),", or ",Object(o.b)("inlineCode",{parentName:"h3"},".graphqlrc.yml/yaml")),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-yaml"},"schema: 'packages/api/src/schema.graphql'\ndocuments: 'packages/app/src/components/**/*.graphql'\nextensions:\n  customExtension:\n    foo: true\n")),Object(o.b)("h3",{id:"graphqlrcgraphqlconfigjson-or-graphqlrcjson"},Object(o.b)("inlineCode",{parentName:"h3"},".graphqlrc"),",",Object(o.b)("inlineCode",{parentName:"h3"},"graphql.config.json")," or ",Object(o.b)("inlineCode",{parentName:"h3"},".graphqlrc.json")),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json"},'{\n  "schema": "https://localhost:8000"\n}\n')),Object(o.b)("h3",{id:"graphqlconfigtoml-or-graphqlrctoml"},Object(o.b)("inlineCode",{parentName:"h3"},"graphql.config.toml")," or ",Object(o.b)("inlineCode",{parentName:"h3"},".graphqlrc.toml")),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-toml"},'schema = "https://localhost:8080"\n')),Object(o.b)("h3",{id:"graphqlconfigjs-or-graphqlrcjs"},Object(o.b)("inlineCode",{parentName:"h3"},"graphql.config.js")," or ",Object(o.b)("inlineCode",{parentName:"h3"},".graphqlrc.js")),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"module.exports = {\n  schema: 'https://localhost:8000'\n};\n")),Object(o.b)("h3",{id:"graphqlconfigts-or-graphqlrcts"},Object(o.b)("inlineCode",{parentName:"h3"},"graphql.config.ts")," or ",Object(o.b)("inlineCode",{parentName:"h3"},".graphqlrc.ts")),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"import type { GraphQLConfig } from 'graphql-config'\n\nconst config: GraphQLConfig = {\n  schema: 'https://localhost:8000'\n}\n\nexport default config;\n")),Object(o.b)("h3",{id:"custom-paths"},"Custom paths"),Object(o.b)("p",null,"custom extension paths with ",Object(o.b)("inlineCode",{parentName:"p"},".mycustomrc.js"),", ",Object(o.b)("inlineCode",{parentName:"p"},"mycustom.config.yml"),", etcetera - any filename listed in ",Object(o.b)("a",{parentName:"p",href:"'./user-usage'"},"usage docs")," with ",Object(o.b)("inlineCode",{parentName:"p"},"graphql")," replaced by the ",Object(o.b)("inlineCode",{parentName:"p"},"loadConfig()")," parameter ",Object(o.b)("a",{parentName:"p",href:"load-config#configname"},Object(o.b)("inlineCode",{parentName:"a"},"configName"))),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"await loadConfig({ configName: 'mycustom' })\n")),Object(o.b)("p",null,"would allow you to use ",Object(o.b)("inlineCode",{parentName:"p"},".mycustomrc.js"),":"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"module.exports = {\n  schema: 'https://localhost:8000'\n};\n")),Object(o.b)("h3",{id:"lookup-order"},"Lookup Order"),Object(o.b)("p",null,"We are using ",Object(o.b)("inlineCode",{parentName:"p"},"cosmiconfig")," to load the schema, and it uses the following flow to look for configurations:"),Object(o.b)("ol",null,Object(o.b)("li",{parentName:"ol"},"a ",Object(o.b)("inlineCode",{parentName:"li"},"package.json")," property"),Object(o.b)("li",{parentName:"ol"},'a JSON or YAML, extensionless "rc file"'),Object(o.b)("li",{parentName:"ol"},'an "rc file" with the extensions ',Object(o.b)("inlineCode",{parentName:"li"},".json"),", ",Object(o.b)("inlineCode",{parentName:"li"},".yaml"),", ",Object(o.b)("inlineCode",{parentName:"li"},".yml"),", ",Object(o.b)("inlineCode",{parentName:"li"},".toml"),", ",Object(o.b)("inlineCode",{parentName:"li"},".ts")," or ",Object(o.b)("inlineCode",{parentName:"li"},".js"),"."),Object(o.b)("li",{parentName:"ol"},"a ",Object(o.b)("inlineCode",{parentName:"li"},".config.js")," CommonJS module, or a ",Object(o.b)("inlineCode",{parentName:"li"},".config.ts")," Typescript module using ",Object(o.b)("a",{parentName:"li",href:"https://github.com/EndemolShineGroup/cosmiconfig-typescript-loader"},Object(o.b)("inlineCode",{parentName:"a"},"cosmiconfig-typescript-loader")))))}s.isMDXComponent=!0},93:function(e,n,t){"use strict";t.d(n,"a",(function(){return b})),t.d(n,"b",(function(){return u}));var r=t(0),a=t.n(r);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function c(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?c(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):c(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=a.a.createContext({}),s=function(e){var n=a.a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},b=function(e){var n=s(e.components);return a.a.createElement(p.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return a.a.createElement(a.a.Fragment,{},n)}},m=a.a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,o=e.originalType,c=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),b=s(t),m=r,u=b["".concat(c,".").concat(m)]||b[m]||d[m]||o;return t?a.a.createElement(u,i(i({ref:n},p),{},{components:t})):a.a.createElement(u,i({ref:n},p))}));function u(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var o=t.length,c=new Array(o);c[0]=m;var i={};for(var l in n)hasOwnProperty.call(n,l)&&(i[l]=n[l]);i.originalType=e,i.mdxType="string"==typeof e?e:r,c[1]=i;for(var p=2;p<o;p++)c[p]=t[p];return a.a.createElement.apply(null,c)}return a.a.createElement.apply(null,t)}m.displayName="MDXCreateElement"}}]);