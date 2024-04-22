# Changelog

## [2.49.0](https://github.com/mdn/yari/compare/v2.48.0...v2.49.0) (2024-04-18)


### Features

* **experiment:** rewrite Web/API page titles ([#10926](https://github.com/mdn/yari/issues/10926)) ([d8173cc](https://github.com/mdn/yari/commit/d8173cc190686634cd43f0a83b4f6178a133e9f5))


### Bug Fixes

* **experiment:** replace test group for Web/API page titles ([#10955](https://github.com/mdn/yari/issues/10955)) ([1dfb5b2](https://github.com/mdn/yari/commit/1dfb5b23db7e643e8ad4c7450b9d0ceacb227cbd))
* **playground:** dispatch DOMContentLoaded event on document + bubble ([7229dd3](https://github.com/mdn/yari/commit/7229dd334ed51281816629db88b9365858c56740))
* **playground:** dispatch readystatechange + bubble DOMContentLoaded on document ([#10946](https://github.com/mdn/yari/issues/10946)) ([7229dd3](https://github.com/mdn/yari/commit/7229dd334ed51281816629db88b9365858c56740))
* **playground:** dispatch readystatechange event ([7229dd3](https://github.com/mdn/yari/commit/7229dd334ed51281816629db88b9365858c56740))
* **stage-build:** provide GH_TOKEN + specify repo in trigger job ([#10932](https://github.com/mdn/yari/issues/10932)) ([d371c0a](https://github.com/mdn/yari/commit/d371c0a8b76a6c47eb8a11d59275860559232678))


### Enhancements

* **macros/PreviousMenuNext:** use the actual title of the document by default ([#10812](https://github.com/mdn/yari/issues/10812)) ([10da897](https://github.com/mdn/yari/commit/10da8978812024f0bf3d1e21db4a36e68da33d8a))


### Miscellaneous

* **deps-dev:** bump @swc/core from 1.4.14 to 1.4.15 ([#10941](https://github.com/mdn/yari/issues/10941)) ([28f775d](https://github.com/mdn/yari/commit/28f775d91a3163b446ee8855df66d8d4b56df277))
* **deps-dev:** bump @swc/core from 1.4.15 to 1.4.16 ([#10951](https://github.com/mdn/yari/issues/10951)) ([d099746](https://github.com/mdn/yari/commit/d09974644971491627705abd5da743fc24f65faf))
* **deps-dev:** bump mini-css-extract-plugin from 2.8.1 to 2.9.0 ([#10938](https://github.com/mdn/yari/issues/10938)) ([672e79a](https://github.com/mdn/yari/commit/672e79a6d70bc7cd2a17cbe314a6b7e3acb221e9))
* **deps-dev:** bump sass-loader from 14.2.0 to 14.2.1 ([#10937](https://github.com/mdn/yari/issues/10937)) ([85372d5](https://github.com/mdn/yari/commit/85372d56b9bef30c379a5e3846233feef59a1962))
* **deps:** bump @mdn/browser-compat-data from 5.5.21 to 5.5.22 ([#10939](https://github.com/mdn/yari/issues/10939)) ([c290528](https://github.com/mdn/yari/commit/c29052859667c74d5be831d56df0c42d13e0aa62))
* **deps:** bump @webref/css from 6.12.7 to 6.12.8 ([#10949](https://github.com/mdn/yari/issues/10949)) ([3051a61](https://github.com/mdn/yari/commit/3051a613edb2a169d63cf20415e302f56028ad7a))
* **deps:** bump inquirer from 9.2.18 to 9.2.19 ([#10940](https://github.com/mdn/yari/issues/10940)) ([b4520ff](https://github.com/mdn/yari/commit/b4520ff50ae976be365b6ca0531f4834e3451e7a))
* **deps:** bump openai from 4.35.0 to 4.36.0 ([#10936](https://github.com/mdn/yari/issues/10936)) ([dcda615](https://github.com/mdn/yari/commit/dcda6157cb8a0722ec43079b66bcf001fe6beb92))
* **deps:** bump openai from 4.36.0 to 4.37.1 ([#10950](https://github.com/mdn/yari/issues/10950)) ([c6212c4](https://github.com/mdn/yari/commit/c6212c4f155db69dd464e7708cdca33570b53e15))
* **deps:** bump web-specs from 3.7.1 to 3.8.0 ([#10952](https://github.com/mdn/yari/issues/10952)) ([126088d](https://github.com/mdn/yari/commit/126088dce86f68adeabed833943cd86883899f34))

## [2.48.0](https://github.com/mdn/yari/compare/v2.47.0...v2.48.0) (2024-04-16)


### Features

* **macros:** add Accessibility sidebar ([#10659](https://github.com/mdn/yari/issues/10659)) ([0b6e2ae](https://github.com/mdn/yari/commit/0b6e2aeabfd09b1312e84c9422216e6b90693f4d))
* **sidebar-filter:** measure when user types in the filter ([#10912](https://github.com/mdn/yari/issues/10912)) ([26ed0e5](https://github.com/mdn/yari/commit/26ed0e5609c1b574bad91de770f0fbc765068aa0))
* **stage-build:** deploy next with main merged ([#10930](https://github.com/mdn/yari/issues/10930)) ([8216930](https://github.com/mdn/yari/commit/821693052a0dc539ef0cc32ad4c644e098ae524e))
* **translations/differences:** visualize how many commits behind translations are ([#8338](https://github.com/mdn/yari/issues/8338)) ([42ab3e5](https://github.com/mdn/yari/commit/42ab3e592b79852e7e389b1b3d4f4babcfdc6f47))


### Bug Fixes

* **cloud-function:** use ts-node via NODE_OPTIONS ([#10873](https://github.com/mdn/yari/issues/10873)) ([512ebb0](https://github.com/mdn/yari/commit/512ebb02494213e1614afbe9d827f567679d8f27))
* **curriculum:** fix typo on landing page ([#10860](https://github.com/mdn/yari/issues/10860)) ([1229663](https://github.com/mdn/yari/commit/1229663870271bb5f807233c6979fb18768cff4b))
* **curriculum:** rename Module Contents heading ([#10852](https://github.com/mdn/yari/issues/10852)) ([b5d354a](https://github.com/mdn/yari/commit/b5d354a57f11fe2a93501eb5aed0a6205d6d206c))
* **interactive-examples:** grant clipboard-write permission to iframe ([#10910](https://github.com/mdn/yari/issues/10910)) ([fcf94ad](https://github.com/mdn/yari/commit/fcf94ad256b0d18474e1f569f7a6dff3cf5b8b51))
* **macros/CSSRef:** include level two functions ([#10679](https://github.com/mdn/yari/issues/10679)) ([cd7458c](https://github.com/mdn/yari/commit/cd7458c8e69d7a5f70577ed5a65611211341d859))
* **playground:** rename reset to clear ([#10806](https://github.com/mdn/yari/issues/10806)) ([54ad381](https://github.com/mdn/yari/commit/54ad381de3a3931005fea1a4baa01c8d9ec88672))
* **scripts:** specify loader via NODE_OPTIONS ([#10865](https://github.com/mdn/yari/issues/10865)) ([842c316](https://github.com/mdn/yari/commit/842c316ed5b8b3b62e9fc84cf2fc474d96c6cae9))
* **scripts:** use cross-env for tool ([#10874](https://github.com/mdn/yari/issues/10874)) ([eeb3784](https://github.com/mdn/yari/commit/eeb37840de2a6f2f4d1e5b4a618a8e9ec7f5678d))
* **sidebar:** unify sections by declaring them with CSS classes ([#9930](https://github.com/mdn/yari/issues/9930)) ([b5bb96e](https://github.com/mdn/yari/commit/b5bb96ef80cf295cc235a8246205d6f6e3cfa66b))
* **stage-build:** trigger `next` version of workflow on schedule ([#10931](https://github.com/mdn/yari/issues/10931)) ([9876306](https://github.com/mdn/yari/commit/98763063ca97cda112761e3ad0ccd6c9fdb8d13a))
* **toolbar:** make suggestion diffs theme-friendly ([#9322](https://github.com/mdn/yari/issues/9322)) ([d47c135](https://github.com/mdn/yari/commit/d47c1352e084ce2d6c0490fff573931bc3e69a29))
* **xyz:** update xyz build ([#10866](https://github.com/mdn/yari/issues/10866)) ([51b39a9](https://github.com/mdn/yari/commit/51b39a90a6269f121e707901ba2c872fb55111f7))


### Enhancements

* **ai-help:** add model to issue reports ([#10925](https://github.com/mdn/yari/issues/10925)) ([3765a90](https://github.com/mdn/yari/commit/3765a90484aa7c2daddb677e8fbf489a02515d2a))
* **dev-dashboard:** reuse Paginator molecule in flaws and translation dashboards ([#9319](https://github.com/mdn/yari/issues/9319)) ([b507c5c](https://github.com/mdn/yari/commit/b507c5c8ec8bc35b5e7c5a9692f2fbab8eb46b03))


### Miscellaneous

* **curriculum:** unify some spacing ([#10872](https://github.com/mdn/yari/issues/10872)) ([8e38b5e](https://github.com/mdn/yari/commit/8e38b5e83ebf5da0f40d8c889433ee73cffc6eb6))
* **deps-dev:** bump @babel/core from 7.24.3 to 7.24.4 ([#10850](https://github.com/mdn/yari/issues/10850)) ([424bbce](https://github.com/mdn/yari/commit/424bbce074cfae7e64a9028e05157f8af24e4f19))
* **deps-dev:** bump @babel/preset-env from 7.24.3 to 7.24.4 ([#10851](https://github.com/mdn/yari/issues/10851)) ([ed6b6b6](https://github.com/mdn/yari/commit/ed6b6b6e736ea796cf3b62b37bea458f927488e0))
* **deps-dev:** bump @playwright/test from 1.42.1 to 1.43.0 ([#10856](https://github.com/mdn/yari/issues/10856)) ([13387b4](https://github.com/mdn/yari/commit/13387b4563e8376acfc4354d4bcd1d27aba7476f))
* **deps-dev:** bump @playwright/test from 1.43.0 to 1.43.1 ([#10918](https://github.com/mdn/yari/issues/10918)) ([9ec5d70](https://github.com/mdn/yari/commit/9ec5d705d227349f7326fef7afff2e5722d5094a))
* **deps-dev:** bump @swc/core from 1.4.11 to 1.4.12 ([#10848](https://github.com/mdn/yari/issues/10848)) ([732b836](https://github.com/mdn/yari/commit/732b8365196774050336ec38abd47a5604a2edfc))
* **deps-dev:** bump @swc/core from 1.4.12 to 1.4.13 ([#10884](https://github.com/mdn/yari/issues/10884)) ([2a69acd](https://github.com/mdn/yari/commit/2a69acdb39f3d02cf02a6fbe1bbb6a4664aa38b3))
* **deps-dev:** bump @swc/core from 1.4.13 to 1.4.14 ([#10919](https://github.com/mdn/yari/issues/10919)) ([7374117](https://github.com/mdn/yari/commit/737411763c405ab0bea495912cb096f4924c05dd))
* **deps-dev:** bump @testing-library/react from 14.2.2 to 14.3.0 ([#10876](https://github.com/mdn/yari/issues/10876)) ([efb5630](https://github.com/mdn/yari/commit/efb5630dcb51d650ed37ed48709ef2a5b6e15321))
* **deps-dev:** bump @testing-library/react from 14.3.0 to 15.0.2 ([#10920](https://github.com/mdn/yari/issues/10920)) ([e531d03](https://github.com/mdn/yari/commit/e531d03f4607e3cf526e341dd3e6ab85ab570ab0))
* **deps-dev:** bump @types/react from 18.2.74 to 18.2.75 in the types group ([#10875](https://github.com/mdn/yari/issues/10875)) ([2e234e0](https://github.com/mdn/yari/commit/2e234e091cb512fa4766d804530d2ff0b5e3fadd))
* **deps-dev:** bump @types/react from 18.2.77 to 18.2.78 in the types group ([#10914](https://github.com/mdn/yari/issues/10914)) ([8db6ee0](https://github.com/mdn/yari/commit/8db6ee03c5d4aa13f3c01b1f9b0a019045598a9f))
* **deps-dev:** bump @types/react from 18.2.78 to 18.2.79 in the types group ([#10927](https://github.com/mdn/yari/issues/10927)) ([127286c](https://github.com/mdn/yari/commit/127286cc5c6219d7be8c48948146ff3850a4b4be))
* **deps-dev:** bump black from 24.3.0 to 24.4.0 in /testing/integration in the dependencies group ([#10916](https://github.com/mdn/yari/issues/10916)) ([990525e](https://github.com/mdn/yari/commit/990525e098e82e65d17fcee3a27310541006eea6))
* **deps-dev:** bump css-loader from 6.10.0 to 6.11.0 ([#10849](https://github.com/mdn/yari/issues/10849)) ([4eb5965](https://github.com/mdn/yari/commit/4eb5965bb73848fbad6a67fe745b2be614c7ce06))
* **deps-dev:** bump css-loader from 6.11.0 to 7.0.0 ([#10854](https://github.com/mdn/yari/issues/10854)) ([ee7f9d5](https://github.com/mdn/yari/commit/ee7f9d50914124d7563c6c61bcee9f1b22928616))
* **deps-dev:** bump css-loader from 7.0.0 to 7.1.0 ([#10877](https://github.com/mdn/yari/issues/10877)) ([4f03e6a](https://github.com/mdn/yari/commit/4f03e6a7b0d946757d628148a9c47403524007d2))
* **deps-dev:** bump css-loader from 7.1.0 to 7.1.1 ([#10894](https://github.com/mdn/yari/issues/10894)) ([54da696](https://github.com/mdn/yari/commit/54da696c7e4519f1ff05e53784a828b77046228b))
* **deps-dev:** bump eslint-plugin-jest from 27.9.0 to 28.2.0 ([#10869](https://github.com/mdn/yari/issues/10869)) ([e8d67c4](https://github.com/mdn/yari/commit/e8d67c4b14080da23a785a415dc48d689c879c7e))
* **deps-dev:** bump eslint-plugin-n from 16.6.2 to 17.0.0 ([#10870](https://github.com/mdn/yari/issues/10870)) ([d71f322](https://github.com/mdn/yari/commit/d71f3221b8c1470194bfa28c0d27f92d3dfb1f16))
* **deps-dev:** bump eslint-plugin-n from 17.0.0 to 17.1.0 ([#10881](https://github.com/mdn/yari/issues/10881)) ([4af72c6](https://github.com/mdn/yari/commit/4af72c63dd7fb324698d93666d0199443d8595af))
* **deps-dev:** bump eslint-plugin-n from 17.1.0 to 17.2.0 ([#10888](https://github.com/mdn/yari/issues/10888)) ([c8dc3e9](https://github.com/mdn/yari/commit/c8dc3e9ae1b57a025ae530bfbdef7d73a1493ad9))
* **deps-dev:** bump eslint-plugin-n from 17.2.0 to 17.2.1 ([#10921](https://github.com/mdn/yari/issues/10921)) ([ed933b0](https://github.com/mdn/yari/commit/ed933b076be0edb9a2f68d13bb918675b2da790e))
* **deps-dev:** bump eslint-plugin-unicorn from 51.0.1 to 52.0.0 ([#10845](https://github.com/mdn/yari/issues/10845)) ([458bbea](https://github.com/mdn/yari/commit/458bbea21f7de3b8602dbff4b88d64af59de77e0))
* **deps-dev:** bump postcss-preset-env from 9.5.4 to 9.5.5 ([#10907](https://github.com/mdn/yari/issues/10907)) ([a7a64b7](https://github.com/mdn/yari/commit/a7a64b7030c41d9598c9535054eca78dccc806af))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.14 to 2.5.0 ([#10903](https://github.com/mdn/yari/issues/10903)) ([0584534](https://github.com/mdn/yari/commit/05845344e7e82968046ae1ada73a61591d927ca3))
* **deps-dev:** bump sass from 1.72.0 to 1.74.1 ([#10847](https://github.com/mdn/yari/issues/10847)) ([962d17d](https://github.com/mdn/yari/commit/962d17d6cf9f6fc2432702b539943fcd07112d34))
* **deps-dev:** bump sass from 1.74.1 to 1.75.0 ([#10908](https://github.com/mdn/yari/issues/10908)) ([bd27a23](https://github.com/mdn/yari/commit/bd27a233fa287ab89496ef0fd79362b12e2b0895))
* **deps-dev:** bump sass-loader from 14.1.1 to 14.2.0 ([#10902](https://github.com/mdn/yari/issues/10902)) ([52bda8f](https://github.com/mdn/yari/commit/52bda8fdb3f0e1215c9d9f44ac822a0ee2d58940))
* **deps-dev:** bump the types group with 1 update ([#10837](https://github.com/mdn/yari/issues/10837)) ([d56ea44](https://github.com/mdn/yari/commit/d56ea44801bea4479ffc56689d34e8b32e73d5d1))
* **deps-dev:** bump the types group with 1 update ([#10844](https://github.com/mdn/yari/issues/10844)) ([76a4c9b](https://github.com/mdn/yari/commit/76a4c9b364271c8d6cd46e962b4083deb85e6dd6))
* **deps-dev:** bump the types group with 2 updates ([#10901](https://github.com/mdn/yari/issues/10901)) ([ee43a24](https://github.com/mdn/yari/commit/ee43a24ff14da7cca64b238111fba27bbed2a10e))
* **deps-dev:** bump typescript from 5.4.3 to 5.4.4 ([#10857](https://github.com/mdn/yari/issues/10857)) ([21c0b89](https://github.com/mdn/yari/commit/21c0b89d7ac138462f0518ce7a34b5930652e099))
* **deps-dev:** bump typescript from 5.4.3 to 5.4.4 in /client/pwa ([#10853](https://github.com/mdn/yari/issues/10853)) ([c07f3fa](https://github.com/mdn/yari/commit/c07f3fa5918b77b4c5531129210aa5e8e6e57703))
* **deps-dev:** bump typescript from 5.4.4 to 5.4.5 ([#10893](https://github.com/mdn/yari/issues/10893)) ([94e8bf6](https://github.com/mdn/yari/commit/94e8bf60a5e11caefa4143ad5c9673d90ef8af4f))
* **deps-dev:** bump typescript from 5.4.4 to 5.4.5 in /client/pwa ([#10892](https://github.com/mdn/yari/issues/10892)) ([7442b15](https://github.com/mdn/yari/commit/7442b15eb85d4167c9890c989ce0d689063470b0))
* **deps-dev:** bump typescript-eslint from 7.5.0 to 7.6.0 ([#10880](https://github.com/mdn/yari/issues/10880)) ([1ceb696](https://github.com/mdn/yari/commit/1ceb6960edf4ac8afb501a98d66e313eeba6063f))
* **deps-dev:** bump typescript-eslint from 7.6.0 to 7.7.0 ([#10928](https://github.com/mdn/yari/issues/10928)) ([493e21c](https://github.com/mdn/yari/commit/493e21cc572da49a2d362c20792eb83ec33c11a9))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.40 to 2.7.41 in /client/pwa ([#10836](https://github.com/mdn/yari/issues/10836)) ([ed6190b](https://github.com/mdn/yari/commit/ed6190bb62637b1adb8fd24e80591d0afe966795))
* **deps:** bump @codemirror/lang-html from 6.4.8 to 6.4.9 ([#10906](https://github.com/mdn/yari/issues/10906)) ([7f86fb5](https://github.com/mdn/yari/commit/7f86fb53c5a613c0287d4e3fa0d18e3f58cff4c9))
* **deps:** bump @mdn/browser-compat-data from 5.5.18 to 5.5.19 ([#10839](https://github.com/mdn/yari/issues/10839)) ([1b2b428](https://github.com/mdn/yari/commit/1b2b428493ac52842fa5b90b781ec9a21e209627))
* **deps:** bump @mdn/browser-compat-data from 5.5.19 to 5.5.20 ([#10882](https://github.com/mdn/yari/issues/10882)) ([3c8481a](https://github.com/mdn/yari/commit/3c8481a66ce2b4d6436beef71ec397f152a843e4))
* **deps:** bump @mdn/browser-compat-data from 5.5.20 to 5.5.21 ([#10922](https://github.com/mdn/yari/issues/10922)) ([b7e8db2](https://github.com/mdn/yari/commit/b7e8db2bdc7966ec6782bdaab0781bc2715e3905))
* **deps:** bump @stripe/stripe-js from 3.2.0 to 3.3.0 ([#10878](https://github.com/mdn/yari/issues/10878)) ([0eef466](https://github.com/mdn/yari/commit/0eef466729c63335ac60900ad9c61d16d0ccf31b))
* **deps:** bump @webref/css from 6.12.5 to 6.12.6 ([#10838](https://github.com/mdn/yari/issues/10838)) ([3581fc0](https://github.com/mdn/yari/commit/3581fc0aa29afc7ba7cd7c881584e7e4642314eb))
* **deps:** bump @webref/css from 6.12.6 to 6.12.7 ([#10904](https://github.com/mdn/yari/issues/10904)) ([3ed6a9a](https://github.com/mdn/yari/commit/3ed6a9ab60eab4962155e6ee5a633db2255f8c82))
* **deps:** bump boto3 from 1.34.74 to 1.34.79 in /deployer in the dependencies group ([#10868](https://github.com/mdn/yari/issues/10868)) ([374b2da](https://github.com/mdn/yari/commit/374b2dada24c0d6caf7bb65f61869eadbcf84a4d))
* **deps:** bump ejs from 3.1.9 to 3.1.10 ([#10923](https://github.com/mdn/yari/issues/10923)) ([df0f248](https://github.com/mdn/yari/commit/df0f2485060fa8c0c70be33bd419d270eaf92abb))
* **deps:** bump idna from 3.4 to 3.7 in /deployer ([#10899](https://github.com/mdn/yari/issues/10899)) ([24a14ae](https://github.com/mdn/yari/commit/24a14ae419b8574fc37d513cc9a4f60aed2e092a))
* **deps:** bump idna from 3.4 to 3.7 in /testing/integration ([#10898](https://github.com/mdn/yari/issues/10898)) ([2f3199f](https://github.com/mdn/yari/commit/2f3199fc4188bc6df00d9a4da5c3b65db7f79005))
* **deps:** bump inquirer from 9.2.17 to 9.2.18 ([#10917](https://github.com/mdn/yari/issues/10917)) ([712a881](https://github.com/mdn/yari/commit/712a881b4f5814d284d778dd836dff0882b92163))
* **deps:** bump mdn-data from 2.4.2 to 2.5.0 ([#10883](https://github.com/mdn/yari/issues/10883)) ([ae48b26](https://github.com/mdn/yari/commit/ae48b26edb76dfb61f1e026a5f6252d9994ac69d))
* **deps:** bump node from 18.18 to latest 18 ([#10871](https://github.com/mdn/yari/issues/10871)) ([6f2e9d0](https://github.com/mdn/yari/commit/6f2e9d05dcac81928afe4787257bc5a0f9571a8b))
* **deps:** bump openai from 4.32.0 to 4.32.1 ([#10842](https://github.com/mdn/yari/issues/10842)) ([65b769c](https://github.com/mdn/yari/commit/65b769cf6646f655965e850283c3f6296fda66fb))
* **deps:** bump openai from 4.32.1 to 4.32.2 ([#10855](https://github.com/mdn/yari/issues/10855)) ([42af73a](https://github.com/mdn/yari/commit/42af73ace0f222dbf73d54056144308643aab67f))
* **deps:** bump openai from 4.32.2 to 4.33.0 ([#10867](https://github.com/mdn/yari/issues/10867)) ([1578b72](https://github.com/mdn/yari/commit/1578b7251a33a6c6aeff1afa40abe472e0c59c93))
* **deps:** bump openai from 4.33.0 to 4.33.1 ([#10915](https://github.com/mdn/yari/issues/10915)) ([5a09048](https://github.com/mdn/yari/commit/5a09048d29c705f98834d0d1485c3eda5e178363))
* **deps:** bump openai from 4.33.1 to 4.35.0 ([#10929](https://github.com/mdn/yari/issues/10929)) ([beb13fa](https://github.com/mdn/yari/commit/beb13fac078716106c43191b1e022bfafd6a51e1))
* **deps:** bump pg from 8.11.4 to 8.11.5 ([#10840](https://github.com/mdn/yari/issues/10840)) ([0423309](https://github.com/mdn/yari/commit/04233097cc6046fe5c8fca5c2cc251b9d6ba6269))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10924](https://github.com/mdn/yari/issues/10924)) ([861f9f8](https://github.com/mdn/yari/commit/861f9f8edefdf90d10ab0a9e90d3178a70ec1008))
* **deps:** bump the sentry group with 2 updates ([#10900](https://github.com/mdn/yari/issues/10900)) ([b781deb](https://github.com/mdn/yari/commit/b781deb5a83905e63051e96f06707be70565479b))
* **deps:** bump the sentry group with 2 updates ([#10913](https://github.com/mdn/yari/issues/10913)) ([50a0d4f](https://github.com/mdn/yari/commit/50a0d4f22abfee71536dc6ef9076a753fe1c2112))
* **deps:** bump web-features from 0.6.1 to 0.6.2 ([#10846](https://github.com/mdn/yari/issues/10846)) ([a98d188](https://github.com/mdn/yari/commit/a98d188e7db531c16bc02135c3a33057155b9d86))
* **deps:** bump web-features from 0.6.2 to 0.6.3 ([#10889](https://github.com/mdn/yari/issues/10889)) ([3de72a5](https://github.com/mdn/yari/commit/3de72a569ea3af74c22eb5dda73a0ed8a9628633))
* **deps:** bump web-specs from 3.6.0 to 3.7.0 ([#10841](https://github.com/mdn/yari/issues/10841)) ([f0754e3](https://github.com/mdn/yari/commit/f0754e3ecbc19f890fbd374f5629660314d804b3))
* **deps:** bump web-specs from 3.7.0 to 3.7.1 ([#10896](https://github.com/mdn/yari/issues/10896)) ([58314b1](https://github.com/mdn/yari/commit/58314b1a48fe8053c57be918935aa9e64c99d08f))
* **macros/AvailableInWorkers:** add zh-CN translation ([#10843](https://github.com/mdn/yari/issues/10843)) ([4c89c2a](https://github.com/mdn/yari/commit/4c89c2a8eb533f7f2c962f83e2053b4523ca0475))

## [2.47.0](https://github.com/mdn/yari/compare/v2.46.0...v2.47.0) (2024-04-02)


### Features

* **ai-help:** index text-embedding-3-model embeddings ([#10818](https://github.com/mdn/yari/issues/10818)) ([f7cfaae](https://github.com/mdn/yari/commit/f7cfaae77f9ecbb5d7e1c1dd24eaa41c90c8466c))


### Bug Fixes

* **playground:** allow forms in iframe ([1ffb026](https://github.com/mdn/yari/commit/1ffb0261196752308a48b9f87d32101427d82430))


### Enhancements

* **ai-help:** hash markdown to identify formatting updates ([#10643](https://github.com/mdn/yari/issues/10643)) ([de1aae9](https://github.com/mdn/yari/commit/de1aae979e3107036cdad2e467f765639e747b03))
* **curriculum:** add numbers to modules and fixes ([0f20809](https://github.com/mdn/yari/commit/0f2080913971ea72450b84a2ef237a49bb9e7580))


### Miscellaneous

* **deps-dev:** bump html-validate from 8.18.0 to 8.18.1 ([#10823](https://github.com/mdn/yari/issues/10823)) ([4776146](https://github.com/mdn/yari/commit/47761469ebfa4f219f852654f9d4577526029018))
* **deps-dev:** bump postcss-preset-env from 9.5.2 to 9.5.3 ([#10827](https://github.com/mdn/yari/issues/10827)) ([e49c106](https://github.com/mdn/yari/commit/e49c10699215111b7dd93a499311ccbbb1fd7226))
* **deps-dev:** bump postcss-preset-env from 9.5.3 to 9.5.4 ([#10832](https://github.com/mdn/yari/issues/10832)) ([0e3a9cc](https://github.com/mdn/yari/commit/0e3a9cce7267a0a23dd0c17397bf146846f78d43))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.13 to 2.4.14 ([#10826](https://github.com/mdn/yari/issues/10826)) ([a0de4de](https://github.com/mdn/yari/commit/a0de4de6981f30d81fa4e4d2a46b2de65c2f7d87))
* **deps-dev:** bump the types group with 1 update ([#10814](https://github.com/mdn/yari/issues/10814)) ([f4ebe66](https://github.com/mdn/yari/commit/f4ebe6685e15caf4b80b03b2acb3c4983788ba51))
* **deps-dev:** bump typescript-eslint from 7.4.0 to 7.5.0 ([#10830](https://github.com/mdn/yari/issues/10830)) ([23f3ea0](https://github.com/mdn/yari/commit/23f3ea044a90fd1b021373983f8c5abe140d2342))
* **deps:** bump @mdn/browser-compat-data from 5.5.17 to 5.5.18 ([#10822](https://github.com/mdn/yari/issues/10822)) ([344fe99](https://github.com/mdn/yari/commit/344fe992412d4f057689f0cd7a119fdecc7af7c1))
* **deps:** bump @stripe/stripe-js from 3.1.0 to 3.2.0 ([#10833](https://github.com/mdn/yari/issues/10833)) ([fc896ea](https://github.com/mdn/yari/commit/fc896ea0d3044c6aeee627f83c612b2537715265))
* **deps:** bump inquirer from 9.2.16 to 9.2.17 ([#10821](https://github.com/mdn/yari/issues/10821)) ([cffdbc2](https://github.com/mdn/yari/commit/cffdbc268a79e91026010dd29af81375918ab791))
* **deps:** bump openai from 4.29.2 to 4.30.0 ([#10815](https://github.com/mdn/yari/issues/10815)) ([685cde7](https://github.com/mdn/yari/commit/685cde73e29fb55a764e873f5179dc16e6641fc8))
* **deps:** bump openai from 4.30.0 to 4.31.0 ([#10825](https://github.com/mdn/yari/issues/10825)) ([ac409f3](https://github.com/mdn/yari/commit/ac409f3930b11a22ca190c22e5cc4dc448f47147))
* **deps:** bump openai from 4.31.0 to 4.32.0 ([#10831](https://github.com/mdn/yari/issues/10831)) ([de70b44](https://github.com/mdn/yari/commit/de70b4453f3cfd93556da8215d2cd9d572959dcb))
* **deps:** bump pg from 8.11.3 to 8.11.4 ([#10824](https://github.com/mdn/yari/issues/10824)) ([456d1c6](https://github.com/mdn/yari/commit/456d1c670dab7b32896e5a513e926e46d194010f))
* **deps:** bump the dependencies group in /deployer with 1 update ([#10820](https://github.com/mdn/yari/issues/10820)) ([9703884](https://github.com/mdn/yari/commit/9703884c9c00ec739d7ad66d9eb347efaf24e675))
* **deps:** bump the sentry group with 2 updates ([#10813](https://github.com/mdn/yari/issues/10813)) ([51252ff](https://github.com/mdn/yari/commit/51252ff54b5d292abb0fa2c6de32342b88a456f7))

## [2.46.0](https://github.com/mdn/yari/compare/v2.45.1...v2.46.0) (2024-03-28)


### Features

* **macros/AvailableInWorkers:** support more distinct cases ([#10029](https://github.com/mdn/yari/issues/10029)) ([f38adb3](https://github.com/mdn/yari/commit/f38adb3ac9a6c715059b00a099d81fb67dc974af))


### Bug Fixes

* **ai-help:** limit input to 25k characters ([#10796](https://github.com/mdn/yari/issues/10796)) ([cf2aee6](https://github.com/mdn/yari/commit/cf2aee62b3495e0f605ab6e258aab4a91e8495ca))
* **contributor-spotlight:** show PageNotFound on error ([#9759](https://github.com/mdn/yari/issues/9759)) ([0312f1a](https://github.com/mdn/yari/commit/0312f1aae9c548bcd0ae5a9d58d12e6d6453b87b))
* **curriculum:** remove forbidden hr from ol ([#10786](https://github.com/mdn/yari/issues/10786)) ([32a7a4b](https://github.com/mdn/yari/commit/32a7a4b3c286ebf11c5d15372c52c1b6489c3ec1))
* **kumascript:** add translations() to page info ([#8241](https://github.com/mdn/yari/issues/8241)) ([0807413](https://github.com/mdn/yari/commit/08074138f1c2afd571627e3b94ee14c20ee3442e))
* **macros/cssxref:** correct URL generation for data types and functions ([#8766](https://github.com/mdn/yari/issues/8766)) ([a0813d0](https://github.com/mdn/yari/commit/a0813d00025744136eb8d6c6f2db01d924b0cba7))
* **playground:** remove redundant vertical scroll bar ([#10752](https://github.com/mdn/yari/issues/10752)) ([3f74a19](https://github.com/mdn/yari/commit/3f74a193a82d4a756edc57b9eff2e894c9f5e1a3))


### Enhancements

* **ai-help:** improve off-topic response handling ([#10797](https://github.com/mdn/yari/issues/10797)) ([6fd7a3a](https://github.com/mdn/yari/commit/6fd7a3a374eba388eb3528f258888ddb021fc40d))
* **breadcrumbs:** show current and parent (not root) on mobile + add padding ([#10315](https://github.com/mdn/yari/issues/10315)) ([2276ecb](https://github.com/mdn/yari/commit/2276ecbeab7281d3be749bdc4bd5af6707d4cd61))
* **build:** warn only once about missing BLOG_ROOT ([#10269](https://github.com/mdn/yari/issues/10269)) ([ad94d8a](https://github.com/mdn/yari/commit/ad94d8a7ee92b8ad25ef09f33f9539d15a44a28b))
* **flaws-page:** specify 'yarn build' usage in error message for clarity ([#10785](https://github.com/mdn/yari/issues/10785)) ([a21d702](https://github.com/mdn/yari/commit/a21d7024f3e28922a43336af52bd289903c7a6d6))
* **libs/env:** improve error message for bad .env configs ([#9673](https://github.com/mdn/yari/issues/9673)) ([f26f60c](https://github.com/mdn/yari/commit/f26f60c39a1b0d4615b1ab6c9fd1fd85493dc6ca))
* **tool/fix-flaws:** add progress bar ([#9433](https://github.com/mdn/yari/issues/9433)) ([0e9d1f1](https://github.com/mdn/yari/commit/0e9d1f1e1f158a7bc49dcdc1e9e9f521c71cb04f))


### Miscellaneous

* **deps-dev:** bump @swc/core from 1.4.8 to 1.4.11 ([#10792](https://github.com/mdn/yari/issues/10792)) ([b436474](https://github.com/mdn/yari/commit/b4364746f97b32c259caca73d5e7244aef30167d))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.12 to 2.4.13 ([#10808](https://github.com/mdn/yari/issues/10808)) ([8d60ef9](https://github.com/mdn/yari/commit/8d60ef9edced78fa2bdc32542f1668e07ab36fa8))
* **deps-dev:** bump tailwindcss from 3.4.1 to 3.4.3 ([#10809](https://github.com/mdn/yari/issues/10809)) ([5913e7c](https://github.com/mdn/yari/commit/5913e7c2451c29eec971f72bede798442b05dbad))
* **deps-dev:** bump the types group with 1 update ([#10789](https://github.com/mdn/yari/issues/10789)) ([5722b4e](https://github.com/mdn/yari/commit/5722b4ea401b14d4bb770ca858263eb5fb331230))
* **deps-dev:** bump the types group with 1 update ([#10799](https://github.com/mdn/yari/issues/10799)) ([37655b5](https://github.com/mdn/yari/commit/37655b5f6574b8365944ebe35ced28cc72dfd286))
* **deps-dev:** bump the types group with 1 update ([#10807](https://github.com/mdn/yari/issues/10807)) ([6e4114a](https://github.com/mdn/yari/commit/6e4114a5ca9b0fb5fb595aa4e88ca988cd8744a3))
* **deps-dev:** bump typescript-eslint from 7.3.1 to 7.4.0 ([#10791](https://github.com/mdn/yari/issues/10791)) ([e1e4fbc](https://github.com/mdn/yari/commit/e1e4fbc418501debf9fb4fddc64ac3cd09856f3f))
* **deps-dev:** remove unused tailwindcss dependency ([#10810](https://github.com/mdn/yari/issues/10810)) ([2c95a9a](https://github.com/mdn/yari/commit/2c95a9abeb8a15e67a47242369ce9b3deb6b7b49))
* **deps:** bump @mdn/bcd-utils-api from 0.0.6 to 0.0.7 ([#10793](https://github.com/mdn/yari/issues/10793)) ([7ea45e6](https://github.com/mdn/yari/commit/7ea45e64bf90044eb3e4c9e642eba54181cb805e))
* **deps:** bump @mdn/browser-compat-data from 5.5.16 to 5.5.17 ([#10800](https://github.com/mdn/yari/issues/10800)) ([bdad452](https://github.com/mdn/yari/commit/bdad452a5f43408925ced3734a2cd9da8fd9dcee))
* **deps:** bump @stripe/stripe-js from 3.0.10 to 3.1.0 ([#10794](https://github.com/mdn/yari/issues/10794)) ([fc245ad](https://github.com/mdn/yari/commit/fc245addc92eecee5aa9f73cb4ecc9c9b935b03c))
* **deps:** bump @webref/css from 6.12.4 to 6.12.5 ([#10801](https://github.com/mdn/yari/issues/10801)) ([1352725](https://github.com/mdn/yari/commit/135272583e89dac06f689c1ec0de6786deafcc21))
* **deps:** bump express from 4.19.1 to 4.19.2 ([#10790](https://github.com/mdn/yari/issues/10790)) ([1732e67](https://github.com/mdn/yari/commit/1732e67226a7d2f4721766d5abb0ea3972f54bfc))
* **deps:** bump web-specs from 3.5.0 to 3.6.0 ([#10802](https://github.com/mdn/yari/issues/10802)) ([8e159b6](https://github.com/mdn/yari/commit/8e159b642bd8116d3a6eadcd3943d6c19a5dde9f))
* **macros/JsSidebar:** update Russian locale ([#10735](https://github.com/mdn/yari/issues/10735)) ([cea32ef](https://github.com/mdn/yari/commit/cea32efd34e641bbed30740398ab02c37c654831))
* **macros:** remove deprecated bug/htmlattrdef/xref_cssvisual macros ([#10003](https://github.com/mdn/yari/issues/10003)) ([9a90d17](https://github.com/mdn/yari/commit/9a90d17fdb00fd497972c9f987e15374610737ba))

## [2.45.1](https://github.com/mdn/yari/compare/v2.45.0...v2.45.1) (2024-03-25)


### Bug Fixes

* **macros/LearnSidebar:** update titles for consistency ([#10773](https://github.com/mdn/yari/issues/10773)) ([b488d0f](https://github.com/mdn/yari/commit/b488d0fb5e915abd61fa754050655386822c16ca))
* **playground:** dispatch DOMContentLoaded event manually ([#10770](https://github.com/mdn/yari/issues/10770)) ([2515b3d](https://github.com/mdn/yari/commit/2515b3de75d67bbf32d3de1564efa5734177e6ad))
* **routes:** redirect / =&gt; /en-US/ except for writers ([#10778](https://github.com/mdn/yari/issues/10778)) ([7d694d0](https://github.com/mdn/yari/commit/7d694d018f78f01595446653ec023c7955d43ecb))


### Miscellaneous

* **deps-dev:** bump html-validate from 8.17.1 to 8.18.0 ([#10780](https://github.com/mdn/yari/issues/10780)) ([e59a9fd](https://github.com/mdn/yari/commit/e59a9fddfef666184ba21c1b9b5217b710c8ff32))
* **deps-dev:** bump the types group with 1 update ([#10779](https://github.com/mdn/yari/issues/10779)) ([1e4a564](https://github.com/mdn/yari/commit/1e4a56426b569c5c045609703b0fd71a7361e910))
* **deps:** bump @webref/css from 6.12.3 to 6.12.4 ([#10782](https://github.com/mdn/yari/issues/10782)) ([e12fedd](https://github.com/mdn/yari/commit/e12fedd530cac8f545039317a60af7616db739a6))
* **deps:** bump dependabot/fetch-metadata from 1 to 2 ([#10767](https://github.com/mdn/yari/issues/10767)) ([07ca353](https://github.com/mdn/yari/commit/07ca35352cce92659d5b995bda9d9620a0a53993))
* **deps:** bump the dependencies group in /deployer with 1 update ([#10783](https://github.com/mdn/yari/issues/10783)) ([df2570b](https://github.com/mdn/yari/commit/df2570b2923a89add0483c1677f3cfad97305ffb))
* **deps:** bump the sentry group with 2 updates ([#10768](https://github.com/mdn/yari/issues/10768)) ([e13746d](https://github.com/mdn/yari/commit/e13746d19de57511e18cdd160f27faaf748f64ed))
* **deps:** bump web-features from 0.6.0 to 0.6.1 ([#10781](https://github.com/mdn/yari/issues/10781)) ([d90a926](https://github.com/mdn/yari/commit/d90a9269711b8dcc09bd02dc2f7889033a9ac36b))
* **macros/LearnSidebar:** add Japanese translation retake ([40be4dd](https://github.com/mdn/yari/commit/40be4dd0044bada0dcbe5910297290f7e0d8acec))

## [2.45.0](https://github.com/mdn/yari/compare/v2.44.0...v2.45.0) (2024-03-21)


### Features

* **google-analytics:** migrate to gtag.js with dual tagging ([#10687](https://github.com/mdn/yari/issues/10687)) ([56dbe78](https://github.com/mdn/yari/commit/56dbe78ae713bf7d9082f7b44c8600621afb31c8))
* **telemetry:** measure served placement types ([#10708](https://github.com/mdn/yari/issues/10708)) ([e90e4e3](https://github.com/mdn/yari/commit/e90e4e3356aeb898fcd17cb14458bd93eff2097b))


### Bug Fixes

* **article-footer:** link to translated-content for other locales ([#10743](https://github.com/mdn/yari/issues/10743)) ([fd3f69c](https://github.com/mdn/yari/commit/fd3f69cdbca0b8a46770359b030d263b383f8a33))
* **cli:** add popularities to "yarn start" script ([#10718](https://github.com/mdn/yari/issues/10718)) ([f07a42a](https://github.com/mdn/yari/commit/f07a42af255346160790cc2e881390c1448239da))
* **csp:** add *.analytics.google.com ([#10729](https://github.com/mdn/yari/issues/10729)) ([12dde4f](https://github.com/mdn/yari/commit/12dde4f34e7bec8c4d0f3386035468c9729ae1a6))
* **csp:** allow GA via Tag Manager ([#10715](https://github.com/mdn/yari/issues/10715)) ([e8ec3d3](https://github.com/mdn/yari/commit/e8ec3d3b888950cc4a3d052241f93216a5b5d9f5))
* **curriculum:** don't flag curriclum links ([#10763](https://github.com/mdn/yari/issues/10763)) ([6d989e4](https://github.com/mdn/yari/commit/6d989e4fc551fa0422b3069dce5b56989d46d009))
* **document:** do not break the line of the metadata ([#10129](https://github.com/mdn/yari/issues/10129)) ([789aa15](https://github.com/mdn/yari/commit/789aa1527fb699243105ae1db79b3f5e25be4aa2))
* **google-analytics:** allow analytics.js in CSP ([#10765](https://github.com/mdn/yari/issues/10765)) ([3758c73](https://github.com/mdn/yari/commit/3758c735cbbaeaba1baccc8bce9491a6a3f7e786))
* **icon:** fix the clipboard icon on safari ios ([#10762](https://github.com/mdn/yari/issues/10762)) ([f4b6be2](https://github.com/mdn/yari/commit/f4b6be2ecd2cf7dbd0dfadedfef0a803c2d88892))
* **search:** preserve meaningful dots ([#9951](https://github.com/mdn/yari/issues/9951)) ([d84662e](https://github.com/mdn/yari/commit/d84662ebbfb3ef93233d388e0b25f1ef6060857d))
* **search:** remove "not" from stopwords ([#10644](https://github.com/mdn/yari/issues/10644)) ([8fd03c3](https://github.com/mdn/yari/commit/8fd03c3980780d975ed1a447a96e9aa6e62d6e70))


### Miscellaneous

* **deps-dev:** bump @babel/core from 7.24.0 to 7.24.1 ([#10737](https://github.com/mdn/yari/issues/10737)) ([fa46ea5](https://github.com/mdn/yari/commit/fa46ea5c0ff7a7ab5b8fbc3a6f64ccfc89aed127))
* **deps-dev:** bump @babel/core from 7.24.1 to 7.24.3 ([#10755](https://github.com/mdn/yari/issues/10755)) ([cac817d](https://github.com/mdn/yari/commit/cac817d24449ce143ea978226e760f8fb782168a))
* **deps-dev:** bump @babel/eslint-parser from 7.23.10 to 7.24.1 ([#10741](https://github.com/mdn/yari/issues/10741)) ([a2c331e](https://github.com/mdn/yari/commit/a2c331e73a78e9a03f09b53de87314ff9520f68a))
* **deps-dev:** bump @babel/preset-env from 7.24.0 to 7.24.1 ([#10738](https://github.com/mdn/yari/issues/10738)) ([8086a3b](https://github.com/mdn/yari/commit/8086a3b488f00b342ce850f2c3aa34f578aa70f9))
* **deps-dev:** bump @babel/preset-env from 7.24.1 to 7.24.3 ([#10756](https://github.com/mdn/yari/issues/10756)) ([a7fefec](https://github.com/mdn/yari/commit/a7fefec1f9dfc3c6be87c5636ce0247fd4d07f4b))
* **deps-dev:** bump @testing-library/react from 14.2.1 to 14.2.2 ([#10745](https://github.com/mdn/yari/issues/10745)) ([a97b9aa](https://github.com/mdn/yari/commit/a97b9aa5fc874bfec8fa12b99425aa96f2012b5b))
* **deps-dev:** bump eslint-plugin-react from 7.34.0 to 7.34.1 ([#10727](https://github.com/mdn/yari/issues/10727)) ([c8cdf92](https://github.com/mdn/yari/commit/c8cdf925657ff696cc13066bcd09b61f37b4643e))
* **deps-dev:** bump html-validate from 8.15.0 to 8.16.0 ([#10726](https://github.com/mdn/yari/issues/10726)) ([c8ec945](https://github.com/mdn/yari/commit/c8ec94512c31f0657279ecd8eceeaa5f5afa35b5))
* **deps-dev:** bump html-validate from 8.16.0 to 8.17.0 ([#10742](https://github.com/mdn/yari/issues/10742)) ([9276802](https://github.com/mdn/yari/commit/92768027117bbae3c111a2265cba18bf84c488ba))
* **deps-dev:** bump html-validate from 8.17.0 to 8.17.1 ([#10759](https://github.com/mdn/yari/issues/10759)) ([266bf47](https://github.com/mdn/yari/commit/266bf47fe29fa0bf4f11080c2b7e905d75136e99))
* **deps-dev:** bump postcss from 8.4.35 to 8.4.36 ([#10724](https://github.com/mdn/yari/issues/10724)) ([d22a72d](https://github.com/mdn/yari/commit/d22a72d53a2ed20795cbea14a1dad0975c101961))
* **deps-dev:** bump postcss from 8.4.36 to 8.4.37 ([#10746](https://github.com/mdn/yari/issues/10746)) ([da4baa3](https://github.com/mdn/yari/commit/da4baa33727624bfd9241dd5e25cb152d11a4155))
* **deps-dev:** bump postcss from 8.4.37 to 8.4.38 ([#10754](https://github.com/mdn/yari/issues/10754)) ([32ccbdf](https://github.com/mdn/yari/commit/32ccbdfdcc9fa5eaf3a4dafa338678b7cb716262))
* **deps-dev:** bump postcss-preset-env from 9.5.1 to 9.5.2 ([#10723](https://github.com/mdn/yari/issues/10723)) ([f476c1f](https://github.com/mdn/yari/commit/f476c1f0d7749804ef39b9f92f66118b1bf327df))
* **deps-dev:** bump the dependencies group in /testing/integration with 1 update ([#10720](https://github.com/mdn/yari/issues/10720)) ([a951216](https://github.com/mdn/yari/commit/a95121638920d893a3bf75289e6d7bfd8b333026))
* **deps-dev:** bump the types group with 1 update ([#10736](https://github.com/mdn/yari/issues/10736)) ([d3b6df9](https://github.com/mdn/yari/commit/d3b6df9b9429dbfd10719de5c446c35ae479a64f))
* **deps-dev:** bump typescript from 5.4.2 to 5.4.3 ([#10758](https://github.com/mdn/yari/issues/10758)) ([26056db](https://github.com/mdn/yari/commit/26056db20ec73b5a1960ace6d8e006dfa0b0a122))
* **deps-dev:** bump typescript from 5.4.2 to 5.4.3 in /client/pwa ([#10761](https://github.com/mdn/yari/issues/10761)) ([08848b8](https://github.com/mdn/yari/commit/08848b8d450e6088567e4fb1456f597744360d44))
* **deps-dev:** bump typescript-eslint from 7.2.0 to 7.3.1 ([#10740](https://github.com/mdn/yari/issues/10740)) ([a157c60](https://github.com/mdn/yari/commit/a157c60c40c64d11f22ebfcd23df56271ddc59e1))
* **deps-dev:** bump webpack from 5.90.3 to 5.91.0 ([#10753](https://github.com/mdn/yari/issues/10753)) ([44701a8](https://github.com/mdn/yari/commit/44701a8af4a409802d1a6141e37a6cf91398147f))
* **deps-dev:** bump webpack from 5.90.3 to 5.91.0 in /client/pwa ([#10760](https://github.com/mdn/yari/issues/10760)) ([f47ec4b](https://github.com/mdn/yari/commit/f47ec4b2ecad23b6ec985ba8d7799d3000fdf700))
* **deps-dev:** bump webpack-dev-server from 5.0.3 to 5.0.4 ([#10747](https://github.com/mdn/yari/issues/10747)) ([6b2a258](https://github.com/mdn/yari/commit/6b2a258a479240d62a60ec5521f74eb796ec9ce8))
* **deps:** bump @mdn/bcd-utils-api from 0.0.5 to 0.0.6 ([#10739](https://github.com/mdn/yari/issues/10739)) ([2bca6b2](https://github.com/mdn/yari/commit/2bca6b241cdc1395b766e4f4482d26233cc60bb3))
* **deps:** bump @mdn/browser-compat-data from 5.5.15 to 5.5.16 ([#10725](https://github.com/mdn/yari/issues/10725)) ([74adc46](https://github.com/mdn/yari/commit/74adc46d7bca936162a75d8902a8da1769daaedb))
* **deps:** bump dexie from 3.2.6 to 3.2.7 ([#10749](https://github.com/mdn/yari/issues/10749)) ([0e37d09](https://github.com/mdn/yari/commit/0e37d0993009aa8859067e6dcc996efc4be631da))
* **deps:** bump dexie from 3.2.6 to 3.2.7 in /client/pwa ([#10750](https://github.com/mdn/yari/issues/10750)) ([54336bc](https://github.com/mdn/yari/commit/54336bc475c7a1f1fc15d52362fce284dd0e562f))
* **deps:** bump express from 4.18.3 to 4.19.1 ([#10757](https://github.com/mdn/yari/issues/10757)) ([dacd958](https://github.com/mdn/yari/commit/dacd958a7400309e0e64c1e93f36167c4d839780))
* **deps:** bump node from 18.17 to 18.18 ([#10154](https://github.com/mdn/yari/issues/10154)) ([45ef76f](https://github.com/mdn/yari/commit/45ef76fc67fecfc33a067ebee296ba9cb6f92462))
* **deps:** bump openai from 4.29.0 to 4.29.1 ([#10722](https://github.com/mdn/yari/issues/10722)) ([94f1d93](https://github.com/mdn/yari/commit/94f1d9374b8dab7b500b3f281cf7d3bc1c18edae))
* **deps:** bump openai from 4.29.1 to 4.29.2 ([#10748](https://github.com/mdn/yari/issues/10748)) ([0a075d8](https://github.com/mdn/yari/commit/0a075d876c76ce62043f2d1c657f98e1d4cd78ad))
* **deps:** bump pytest-rerunfailures from 13.0 to 14.0 in /testing/integration ([#10721](https://github.com/mdn/yari/issues/10721)) ([41c24bc](https://github.com/mdn/yari/commit/41c24bc6f3be3b4edb02b2a3d01592821194cdb5))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10728](https://github.com/mdn/yari/issues/10728)) ([a34cd8f](https://github.com/mdn/yari/commit/a34cd8f0ae48d24d2993c671725ddb800f8b004d))
* **macros/HTTPSidebar:** improve Spanish locale ([#10710](https://github.com/mdn/yari/issues/10710)) ([8ac8c6f](https://github.com/mdn/yari/commit/8ac8c6f2d26e58ddc5bb5c419b97a84e619dff52))

## [2.44.0](https://github.com/mdn/yari/compare/v2.43.0...v2.44.0) (2024-03-15)


### Features

* **blog:** remove playground queue ([#10666](https://github.com/mdn/yari/issues/10666)) ([b432d38](https://github.com/mdn/yari/commit/b432d380d4a13bd85001e7cb574b6b1376937247))


### Bug Fixes

* **ai-help:** show stopped message once + restore search animation ([#10632](https://github.com/mdn/yari/issues/10632)) ([e24a7cc](https://github.com/mdn/yari/commit/e24a7cc367be3321138ab5e3b591b685085f2570))
* **article-footer:** add missing space ([#10671](https://github.com/mdn/yari/issues/10671)) ([5acdfb1](https://github.com/mdn/yari/commit/5acdfb17a69584b2e8b9d4a932b7a0bc83bd9df5))
* **article-footer:** reduce illustration size ([#10678](https://github.com/mdn/yari/issues/10678)) ([7b815ba](https://github.com/mdn/yari/commit/7b815babcf438ea28f0e379323354f8bb8bed49b))
* **article-footer:** show red heart emoji in Chrome/Edge ([#10677](https://github.com/mdn/yari/issues/10677)) ([e12a0c4](https://github.com/mdn/yari/commit/e12a0c45c393c1a1bab5b99ab5510e63bf784665))
* **bcd:** fix tooltip for removed features ([#10684](https://github.com/mdn/yari/issues/10684)) ([49c84bb](https://github.com/mdn/yari/commit/49c84bb2861262582effdba246c076d94e0b64c8))
* **flaws:** don't report link to missing translation as broken if en-US fallback exists ([#9408](https://github.com/mdn/yari/issues/9408)) ([f9756d1](https://github.com/mdn/yari/commit/f9756d11a5cffe1b90054f94ffe52872ff771eb6))
* **telemetry:** measure link/button clicks properly ([#10707](https://github.com/mdn/yari/issues/10707)) ([2c27a78](https://github.com/mdn/yari/commit/2c27a78bcfbc0ba1d818c9928328770eae32fabd))


### Miscellaneous

* **deps-dev:** bump @swc/core from 1.4.2 to 1.4.5 ([#10657](https://github.com/mdn/yari/issues/10657)) ([5531c0e](https://github.com/mdn/yari/commit/5531c0e033e06909e0d3009c64cd3730dba7a99d))
* **deps-dev:** bump @swc/core from 1.4.5 to 1.4.6 ([#10669](https://github.com/mdn/yari/issues/10669)) ([5b53388](https://github.com/mdn/yari/commit/5b533887a4822070b21092f01a58132ffd608e93))
* **deps-dev:** bump @swc/core from 1.4.6 to 1.4.7 ([#10696](https://github.com/mdn/yari/issues/10696)) ([9d1a3a7](https://github.com/mdn/yari/commit/9d1a3a74182a0f844d674fe8783f1c2512b30077))
* **deps-dev:** bump @swc/core from 1.4.7 to 1.4.8 ([#10703](https://github.com/mdn/yari/issues/10703)) ([74322c9](https://github.com/mdn/yari/commit/74322c930bd5e86558944717cc714d8264c37662))
* **deps-dev:** bump eslint-webpack-plugin from 4.0.1 to 4.1.0 ([#10705](https://github.com/mdn/yari/issues/10705)) ([dde0182](https://github.com/mdn/yari/commit/dde0182e93e536b8891b53f16f5d418dc0b6e882))
* **deps-dev:** bump html-validate from 8.12.0 to 8.13.0 ([#10656](https://github.com/mdn/yari/issues/10656)) ([ef2273a](https://github.com/mdn/yari/commit/ef2273a50604d58ad5b688f1312e4ad05d001d69))
* **deps-dev:** bump html-validate from 8.13.0 to 8.15.0 ([#10674](https://github.com/mdn/yari/issues/10674)) ([3e69431](https://github.com/mdn/yari/commit/3e6943102f9eed07dc05284f2515b8ac870b5f40))
* **deps-dev:** bump postcss-preset-env from 9.4.0 to 9.5.0 ([#10661](https://github.com/mdn/yari/issues/10661)) ([ed0d873](https://github.com/mdn/yari/commit/ed0d873696204693725ccb6295882b8b1eb8d9ba))
* **deps-dev:** bump postcss-preset-env from 9.5.0 to 9.5.1 ([#10706](https://github.com/mdn/yari/issues/10706)) ([73dd5ed](https://github.com/mdn/yari/commit/73dd5edeaae31e776a8813429f4b0d8ef8d361d5))
* **deps-dev:** bump sass from 1.71.1 to 1.72.0 ([#10700](https://github.com/mdn/yari/issues/10700)) ([30069d5](https://github.com/mdn/yari/commit/30069d50b396530e306dcd6fde1ea09d94ed4104))
* **deps-dev:** bump the types group with 1 update ([#10655](https://github.com/mdn/yari/issues/10655)) ([556ff0a](https://github.com/mdn/yari/commit/556ff0a6f8739b4b095648d80a7a5b553658683b))
* **deps-dev:** bump the types group with 1 update ([#10681](https://github.com/mdn/yari/issues/10681)) ([02256fa](https://github.com/mdn/yari/commit/02256fa8284b3e8913a0afc64b54c6c8ac4c0c3d))
* **deps-dev:** bump the types group with 1 update ([#10688](https://github.com/mdn/yari/issues/10688)) ([48d9d7b](https://github.com/mdn/yari/commit/48d9d7be19315f76a43f888d7f595dfacffd5f98))
* **deps-dev:** bump the types group with 1 update ([#10711](https://github.com/mdn/yari/issues/10711)) ([10a8162](https://github.com/mdn/yari/commit/10a81625674c47660a2a59c614509edb90106b4c))
* **deps-dev:** bump the types group with 2 updates ([#10660](https://github.com/mdn/yari/issues/10660)) ([69b2c05](https://github.com/mdn/yari/commit/69b2c05006a2d8a192ed07c7d876614692eaba48))
* **deps-dev:** bump typescript from 5.3.3 to 5.4.2 ([#10662](https://github.com/mdn/yari/issues/10662)) ([f960988](https://github.com/mdn/yari/commit/f96098826747f1b01ce101c7dc6efee29d092295))
* **deps-dev:** bump typescript from 5.3.3 to 5.4.2 in /client/pwa ([#10665](https://github.com/mdn/yari/issues/10665)) ([f14bc4a](https://github.com/mdn/yari/commit/f14bc4afca37b7273a307b8cc318d41e8c00d878))
* **deps-dev:** bump typescript-eslint from 7.1.1 to 7.2.0 ([#10682](https://github.com/mdn/yari/issues/10682)) ([6a175fc](https://github.com/mdn/yari/commit/6a175fcad7398849b8c29e8bb0346b4c03baee5c))
* **deps-dev:** bump webpack-dev-server from 5.0.2 to 5.0.3 ([#10692](https://github.com/mdn/yari/issues/10692)) ([f60c855](https://github.com/mdn/yari/commit/f60c855779967a3128243582618e78c31fc3d2fe))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.37 to 2.7.40 in /client/pwa ([#10667](https://github.com/mdn/yari/issues/10667)) ([4fafd98](https://github.com/mdn/yari/commit/4fafd981d094b959f2bf19f188b2e085ef8d8f04))
* **deps:** bump @mdn/browser-compat-data from 5.5.13 to 5.5.14 ([#10664](https://github.com/mdn/yari/issues/10664)) ([6e2f93b](https://github.com/mdn/yari/commit/6e2f93b1df61dac10f70d48560b6e1e332ae6336))
* **deps:** bump @mdn/browser-compat-data from 5.5.14 to 5.5.15 ([#10693](https://github.com/mdn/yari/issues/10693)) ([2ec1187](https://github.com/mdn/yari/commit/2ec1187c4176b9b6d2a73cc7de25b76008587a4b))
* **deps:** bump @stripe/stripe-js from 3.0.7 to 3.0.8 ([#10683](https://github.com/mdn/yari/issues/10683)) ([1f6ba5d](https://github.com/mdn/yari/commit/1f6ba5d040189efcdf1bdca0fdeac96773f8b79f))
* **deps:** bump @stripe/stripe-js from 3.0.8 to 3.0.10 ([#10712](https://github.com/mdn/yari/issues/10712)) ([fa65fed](https://github.com/mdn/yari/commit/fa65fedb73374b87bfac78e988b9544b7a511d24))
* **deps:** bump @webref/css from 6.12.1 to 6.12.2 ([#10663](https://github.com/mdn/yari/issues/10663)) ([b2117d5](https://github.com/mdn/yari/commit/b2117d53ab8020e266d66a942c22c8beacadba03))
* **deps:** bump @webref/css from 6.12.2 to 6.12.3 ([#10689](https://github.com/mdn/yari/issues/10689)) ([6ccccb7](https://github.com/mdn/yari/commit/6ccccb7f1d77052151ce9ab42faeb12b0c3c8fe0))
* **deps:** bump follow-redirects from 1.15.4 to 1.15.6 ([#10713](https://github.com/mdn/yari/issues/10713)) ([24a2bf9](https://github.com/mdn/yari/commit/24a2bf93e784039123ae542249703e35583e48ea))
* **deps:** bump inquirer from 9.2.15 to 9.2.16 ([#10695](https://github.com/mdn/yari/issues/10695)) ([482e706](https://github.com/mdn/yari/commit/482e7065151e41c0f2ca13fd4e016269f2c90e8e))
* **deps:** bump open from 10.0.4 to 10.1.0 ([#10675](https://github.com/mdn/yari/issues/10675)) ([541d1e5](https://github.com/mdn/yari/commit/541d1e5044bb8987504b493f173fc53d4605ce82))
* **deps:** bump openai from 4.28.4 to 4.29.0 ([#10701](https://github.com/mdn/yari/issues/10701)) ([4a987a7](https://github.com/mdn/yari/commit/4a987a7ec7f83b7209069dddab17672cab2cc79a))
* **deps:** bump sse.js from 2.3.0 to 2.4.1 ([#10704](https://github.com/mdn/yari/issues/10704)) ([d6cedf8](https://github.com/mdn/yari/commit/d6cedf8673fd0de550a2a586055f6a44d51f2928))
* **deps:** bump the dependencies group in /deployer with 3 updates ([#10672](https://github.com/mdn/yari/issues/10672)) ([96023a7](https://github.com/mdn/yari/commit/96023a70f3f996d23ee4813de9e5cd67a96cac06))
* **deps:** bump the dependencies group in /testing/integration with 1 update ([#10676](https://github.com/mdn/yari/issues/10676)) ([75041dc](https://github.com/mdn/yari/commit/75041dccf5ecb8eacb83302abcab3ccab998fa35))
* **deps:** bump the sentry group with 2 updates ([#10673](https://github.com/mdn/yari/issues/10673)) ([e9f50b5](https://github.com/mdn/yari/commit/e9f50b5b43fc7b3a6687adcf9fe45db51e8c9c7e))
* **deps:** bump the sentry group with 2 updates ([#10680](https://github.com/mdn/yari/issues/10680)) ([3214666](https://github.com/mdn/yari/commit/32146664261eec754b4a140693e530704fc8b4b7))
* **deps:** bump the sentry group with 2 updates ([#10699](https://github.com/mdn/yari/issues/10699)) ([1d587dd](https://github.com/mdn/yari/commit/1d587dd1b1b826395c5a1b36e6f46ab5e6dbef33))
* **deps:** bump web-features from 0.5.1 to 0.6.0 ([#10702](https://github.com/mdn/yari/issues/10702)) ([0346cb2](https://github.com/mdn/yari/commit/0346cb2dac4576de13d4ef5f568159312f71c6cf))
* **deps:** bump web-specs from 3.4.0 to 3.5.0 ([#10694](https://github.com/mdn/yari/issues/10694)) ([af1f8cb](https://github.com/mdn/yari/commit/af1f8cb87fcf1f9446febcabb26ec22a80b55aa9))
* **macros/EmbedLiveSample:** deprecate screenshot URL parameter ([#10697](https://github.com/mdn/yari/issues/10697)) ([2a24620](https://github.com/mdn/yari/commit/2a246201b0b198b349ebf5635b702fa309557836))
* **macros:** Deprecate no_tag_omission macro ([#10686](https://github.com/mdn/yari/issues/10686)) ([bea5317](https://github.com/mdn/yari/commit/bea53179ba249b5f28e325db8ba2aec194f45fce))
* **telemetry:** measure theme switcher clicks ([#10698](https://github.com/mdn/yari/issues/10698)) ([c584cb6](https://github.com/mdn/yari/commit/c584cb61bf05e8855a72be52767277a42c9bba56))
* **telemetry:** remove and migrate GA measurements to Glean ([#10527](https://github.com/mdn/yari/issues/10527)) ([fc4da56](https://github.com/mdn/yari/commit/fc4da56ffd9e616174cfda3313d8c38f82431d62))

## [2.43.0](https://github.com/mdn/yari/compare/v2.42.1...v2.43.0) (2024-03-05)


### Features

* **article-footer:** redesign footer + add feedback buttons ([#10625](https://github.com/mdn/yari/issues/10625)) ([40659a8](https://github.com/mdn/yari/commit/40659a8359af372c0e1af4e2c40da4d0979afc06))
* **latest-news:** fetch metadata from Blog articles + update list ([#10614](https://github.com/mdn/yari/issues/10614)) ([734c37c](https://github.com/mdn/yari/commit/734c37c0834713f0cfd62d98d282a7c37522b68f))


### Bug Fixes

* **cloud-function:** redirect blog/curriculum/play without locale ([#10654](https://github.com/mdn/yari/issues/10654)) ([2fe9d54](https://github.com/mdn/yari/commit/2fe9d540a0c4cd7b78047770d6195fb30fff0a91))
* **featured-articles:** improve how Blog articles are shown ([#10624](https://github.com/mdn/yari/issues/10624)) ([4900d37](https://github.com/mdn/yari/commit/4900d37495b30cb0d2adb99dded61a88f30c2c3b))
* **logo:** set width to width of largest logo ([#10652](https://github.com/mdn/yari/issues/10652)) ([e606646](https://github.com/mdn/yari/commit/e60664601ea55cd61a94ee4ad5db304b2df0f49d))
* **recent-contributions:** break long words instead of overflowing ([#10503](https://github.com/mdn/yari/issues/10503)) ([9ec8963](https://github.com/mdn/yari/commit/9ec8963de4277cb98ff8633c29687c411cbf5db2))
* **types:** pass types through memoize properly ([#10567](https://github.com/mdn/yari/issues/10567)) ([ed9cbf3](https://github.com/mdn/yari/commit/ed9cbf3e0b2b3dd017b266ac04dd9c540388f42c))


### Miscellaneous

* **deps-dev:** bump the types group with 1 update ([#10648](https://github.com/mdn/yari/issues/10648)) ([a6293c3](https://github.com/mdn/yari/commit/a6293c3ee4ac66334f9dda5b124b02130517839d))
* **deps-dev:** bump typescript-eslint from 7.1.0 to 7.1.1 ([#10649](https://github.com/mdn/yari/issues/10649)) ([cc74431](https://github.com/mdn/yari/commit/cc74431283efead765156e2453a306c0329341d6))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.36 to 2.7.37 in /client/pwa ([#10646](https://github.com/mdn/yari/issues/10646)) ([b218c21](https://github.com/mdn/yari/commit/b218c2192ab6d06dc1db4cca7e3b65444bb4da4e))
* **deps:** bump @stripe/stripe-js from 3.0.6 to 3.0.7 ([#10651](https://github.com/mdn/yari/issues/10651)) ([0071314](https://github.com/mdn/yari/commit/00713146c396aad3c9187044def1abbb17760fe2))
* **deps:** bump dexie from 3.2.5 to 3.2.6 ([#10650](https://github.com/mdn/yari/issues/10650)) ([8a6f76d](https://github.com/mdn/yari/commit/8a6f76d294167f8cc72893bad5d62bbd67bc4f1d))
* **deps:** bump dexie from 3.2.5 to 3.2.6 in /client/pwa ([#10645](https://github.com/mdn/yari/issues/10645)) ([17e353f](https://github.com/mdn/yari/commit/17e353ffcfe180153e1de1644f5b7d49527ce6e1))

## [2.42.1](https://github.com/mdn/yari/compare/v2.42.0...v2.42.1) (2024-03-04)


### Bug Fixes

* **build/matches:** remove unnecessary type imports ([#10634](https://github.com/mdn/yari/issues/10634)) ([7a31bf6](https://github.com/mdn/yari/commit/7a31bf6297f0f7ea309f831ef34318abb80b287c))


### Miscellaneous

* **deps-dev:** bump @playwright/test from 1.42.0 to 1.42.1 ([#10641](https://github.com/mdn/yari/issues/10641)) ([83a4b83](https://github.com/mdn/yari/commit/83a4b83c89e7a50bbe51695c5f4f63003e50974a))
* **deps-dev:** bump eslint-plugin-react from 7.33.2 to 7.34.0 ([#10639](https://github.com/mdn/yari/issues/10639)) ([ae23d61](https://github.com/mdn/yari/commit/ae23d61db80f0b41069755e6c47d42bdb4063981))
* **deps-dev:** bump html-validate from 8.11.1 to 8.12.0 ([#10640](https://github.com/mdn/yari/issues/10640)) ([fc9bcec](https://github.com/mdn/yari/commit/fc9bcece20e5878cb2190a03304de1d69e4e6c3e))
* **deps:** bump @mdn/browser-compat-data from 5.5.12 to 5.5.13 ([#10642](https://github.com/mdn/yari/issues/10642)) ([bce0c1f](https://github.com/mdn/yari/commit/bce0c1fde52e6b17ac8ccb922d3bdabeedc861d9))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10637](https://github.com/mdn/yari/issues/10637)) ([2493ab5](https://github.com/mdn/yari/commit/2493ab5129a07d91c9d73c842be6d77dc2aa0223))
* **deps:** bump the dependencies group in /testing/integration with 1 update ([#10635](https://github.com/mdn/yari/issues/10635)) ([be0f9eb](https://github.com/mdn/yari/commit/be0f9eb2cfb06623bbdb51a79247089a23527fef))
* **deps:** bump the sentry group with 2 updates ([#10636](https://github.com/mdn/yari/issues/10636)) ([8b8d421](https://github.com/mdn/yari/commit/8b8d421d5778d4d87344ebdb0d38560772180d98))
* **macro:** Add ko DOMAttributeMethods ([9658fca](https://github.com/mdn/yari/commit/9658fcaba5bd7a7ecae28eb5129d9171c70e9d16))
* **macros/DOMAttributeMethods:** add ko locale ([#10502](https://github.com/mdn/yari/issues/10502)) ([9658fca](https://github.com/mdn/yari/commit/9658fcaba5bd7a7ecae28eb5129d9171c70e9d16))

## [2.42.0](https://github.com/mdn/yari/compare/v2.41.0...v2.42.0) (2024-03-01)


### Features

* **ai-help:** index short_title ([#10579](https://github.com/mdn/yari/issues/10579)) ([6939552](https://github.com/mdn/yari/commit/69395528f0943a99cc0fd033407b72830fb58f4f))
* **ai-help:** show canned answer without sources for off-topic questions ([#10575](https://github.com/mdn/yari/issues/10575)) ([fcd236a](https://github.com/mdn/yari/commit/fcd236a8565e506ae255483984315b81950d738d))


### Bug Fixes

* **ai-help:** hide "Stop answering" before we respond ([#10530](https://github.com/mdn/yari/issues/10530)) ([ad5f5a4](https://github.com/mdn/yari/commit/ad5f5a44dc0ce4285bb6c0471f89fa5b566235a2))
* **ai-help:** refetch quota after an ai error ([#10615](https://github.com/mdn/yari/issues/10615)) ([aa6b141](https://github.com/mdn/yari/commit/aa6b141a34e0542ee458ed0aeffcc3c434801188))
* **ai-help:** remove decorative images from a11y tree ([#10520](https://github.com/mdn/yari/issues/10520)) ([575420c](https://github.com/mdn/yari/commit/575420cf6100a94e3263d9834652a255660d9d1a))
* **build:** check for bad_src flaws in markdown files ([#8133](https://github.com/mdn/yari/issues/8133)) ([a76cc0e](https://github.com/mdn/yari/commit/a76cc0e2c43463b5bed3d48d0d0af94a9bbabc47))
* **modal:** make close button visible ([#10604](https://github.com/mdn/yari/issues/10604)) ([2e06a1a](https://github.com/mdn/yari/commit/2e06a1ad8adc5d97dc1d8b264ad06bd3f3cdcd36))


### Enhancements

* **ai-help:** disable top banner if quota banner is visible ([#10532](https://github.com/mdn/yari/issues/10532)) ([0b03586](https://github.com/mdn/yari/commit/0b03586af5d87eb86f2301c6309ed01c7c970250))
* **ai-help:** improve stopped state ([#10580](https://github.com/mdn/yari/issues/10580)) ([8c988be](https://github.com/mdn/yari/commit/8c988be94b8e89d26c0a847a3f98d443b7ab0421))
* **build/spas:** allow yarn dev without internet if DEV_MODE is enabled ([#10533](https://github.com/mdn/yari/issues/10533)) ([78a9500](https://github.com/mdn/yari/commit/78a95005b171b67dca006a51c2e54c245d281a95))


### Miscellaneous

* **deps-dev:** bump @babel/core from 7.23.9 to 7.24.0 ([#10621](https://github.com/mdn/yari/issues/10621)) ([514592d](https://github.com/mdn/yari/commit/514592d2cf4381811bee58abc095a8026ff55c10))
* **deps-dev:** bump @babel/preset-env from 7.23.9 to 7.24.0 ([#10619](https://github.com/mdn/yari/issues/10619)) ([0fc068f](https://github.com/mdn/yari/commit/0fc068f84de542231ff50a1f1b28feff6f9e1a0a))
* **deps-dev:** bump postcss-loader from 8.1.0 to 8.1.1 ([#10620](https://github.com/mdn/yari/issues/10620)) ([266d4d8](https://github.com/mdn/yari/commit/266d4d82ddd1a8f5214d081c6fa763f46d3b75d7))
* **deps-dev:** bump the types group with 1 update ([#10627](https://github.com/mdn/yari/issues/10627)) ([27ea44f](https://github.com/mdn/yari/commit/27ea44fbad8e30194d8e36c04bbf01bb265fb68e))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.35 to 2.7.36 in /client/pwa ([#10623](https://github.com/mdn/yari/issues/10623)) ([aa34dab](https://github.com/mdn/yari/commit/aa34dabf46529798152e5c7869097d6fea0372a7))
* **deps:** bump @webref/css from 6.12.0 to 6.12.1 ([#10622](https://github.com/mdn/yari/issues/10622)) ([4f68cf5](https://github.com/mdn/yari/commit/4f68cf545249e3800a3d8e05644fb4be441eb895))
* **deps:** bump express from 4.18.2 to 4.18.3 ([#10628](https://github.com/mdn/yari/issues/10628)) ([368c2c4](https://github.com/mdn/yari/commit/368c2c40d229e5c6cd2261633e6cfadb7495f101))
* **deps:** bump openai from 4.28.0 to 4.28.4 ([#10618](https://github.com/mdn/yari/issues/10618)) ([2873cd9](https://github.com/mdn/yari/commit/2873cd9e83052b587a4dc430781a2374517e21bd))
* **deps:** bump sse.js from 2.2.0 to 2.3.0 ([#10631](https://github.com/mdn/yari/issues/10631)) ([4b89823](https://github.com/mdn/yari/commit/4b898230f7a66296c51da3b697de04264614ff49))
* **deps:** bump the sentry group with 2 updates ([#10626](https://github.com/mdn/yari/issues/10626)) ([5bd14de](https://github.com/mdn/yari/commit/5bd14de55ea0e3b95ae7505e81e83570ed9dbd06))
* **deps:** bump web-specs from 3.3.1 to 3.4.0 ([#10629](https://github.com/mdn/yari/issues/10629)) ([e9a2722](https://github.com/mdn/yari/commit/e9a272284bc04227be3566e8af0ad0b44af70f1e))
* **featured-articles:** update links for 2024 Q1 ([#10613](https://github.com/mdn/yari/issues/10613)) ([4725d59](https://github.com/mdn/yari/commit/4725d59fe89060595b83f4554d37da3ef24e3977))
* **footer:** replace Twitter with X logo ([#10438](https://github.com/mdn/yari/issues/10438)) ([a940648](https://github.com/mdn/yari/commit/a94064884b5027b43035450ab6bacd8232d29fbc))
* **macros/CSSRef:** add Containment guides ([#10611](https://github.com/mdn/yari/issues/10611)) ([c207fcc](https://github.com/mdn/yari/commit/c207fcce4016beaa40f612871ab1458de0499db3))

## [2.41.0](https://github.com/mdn/yari/compare/v2.40.0...v2.41.0) (2024-02-28)


### Features

* **macros/MDNSidebar:** add Feature status page ([#10409](https://github.com/mdn/yari/issues/10409)) ([a3f8d7e](https://github.com/mdn/yari/commit/a3f8d7e373b203f646f67776d81c34febec05cd7))


### Bug Fixes

* **curriculum:** fix feedback changes ([#10610](https://github.com/mdn/yari/issues/10610)) ([5cd436c](https://github.com/mdn/yari/commit/5cd436c9a1b7465d2e9dc60994c500fb070be352))


### Miscellaneous

* **deps-dev:** bump @playwright/test from 1.41.2 to 1.42.0 ([#10607](https://github.com/mdn/yari/issues/10607)) ([2392be0](https://github.com/mdn/yari/commit/2392be0e1328db6f6dfad9746f23cef857d241a1))
* **deps-dev:** bump mini-css-extract-plugin from 2.8.0 to 2.8.1 ([#10606](https://github.com/mdn/yari/issues/10606)) ([967fdc5](https://github.com/mdn/yari/commit/967fdc5772b8acdb006fdff00f5bbd29e4c6a319))
* **deps:** bump mdn-data from 2.4.1 to 2.4.2 ([#10605](https://github.com/mdn/yari/issues/10605)) ([39ea592](https://github.com/mdn/yari/commit/39ea5924a4f1abe4f420f02aab38a3676d2c1f62))
* **macros/PreviousMenuNext:** add zh translation ([#10603](https://github.com/mdn/yari/issues/10603)) ([1751cc1](https://github.com/mdn/yari/commit/1751cc1aa75b859fd668c32b5dca35d85d323878))

## [2.40.0](https://github.com/mdn/yari/compare/v2.39.5...v2.40.0) (2024-02-27)


### Features

* **curriculum:** integrate MDN Curriculum ([#10433](https://github.com/mdn/yari/issues/10433)) ([5fd4800](https://github.com/mdn/yari/commit/5fd48005e3d9cac2ff0cb821eb69242fffcc5ce4))


### Bug Fixes

* **ai-help:** improve generation error message ([#10424](https://github.com/mdn/yari/issues/10424)) ([f1c13d8](https://github.com/mdn/yari/commit/f1c13d8afd87f3741ce53df101be27d79700799e))
* **build:** add CURRICULUM_ROOT to prod ([b189a17](https://github.com/mdn/yari/commit/b189a17a1b049a2bd87233a530fad24d51674c34))
* **curriculum:** add CURRICULUM_ROOT ([#10602](https://github.com/mdn/yari/issues/10602)) ([b189a17](https://github.com/mdn/yari/commit/b189a17a1b049a2bd87233a530fad24d51674c34))


### Miscellaneous

* **deps-dev:** bump html-validate from 8.11.0 to 8.11.1 ([#10599](https://github.com/mdn/yari/issues/10599)) ([3032272](https://github.com/mdn/yari/commit/30322723f1ef0a72462ee395aa5cecdfc8d04dc2))
* **deps-dev:** bump the types group with 1 update ([#10596](https://github.com/mdn/yari/issues/10596)) ([67f06c6](https://github.com/mdn/yari/commit/67f06c6abcbf70afa486db5909627102e1143485))
* **deps-dev:** bump typescript-eslint from 7.0.2 to 7.1.0 ([#10598](https://github.com/mdn/yari/issues/10598)) ([ec31aab](https://github.com/mdn/yari/commit/ec31aab383104378441a4a5c21b294bd589888e5))
* **deps:** bump @mdn/browser-compat-data from 5.5.11 to 5.5.12 ([#10597](https://github.com/mdn/yari/issues/10597)) ([7678024](https://github.com/mdn/yari/commit/7678024a37cc93a3eaa74188e19df7d52b2db4e6))
* **deps:** bump @stripe/stripe-js from 3.0.5 to 3.0.6 ([#10600](https://github.com/mdn/yari/issues/10600)) ([715be74](https://github.com/mdn/yari/commit/715be74b7abe5cf19abb09f96d1a981b75dc0703))
* **deps:** bump the sentry group with 2 updates ([#10595](https://github.com/mdn/yari/issues/10595)) ([a2a1f1b](https://github.com/mdn/yari/commit/a2a1f1b1ebbe6e25d4601603c1abe4dceb15b879))

## [2.39.5](https://github.com/mdn/yari/compare/v2.39.4...v2.39.5) (2024-02-26)


### Miscellaneous

* **deps-dev:** bump @typescript-eslint/* from 5.62.0 to 7.0.2 ([#10592](https://github.com/mdn/yari/issues/10592)) ([e9e1932](https://github.com/mdn/yari/commit/e9e19321f3e999feb0c23fe0ef015131b75abf68))
* **deps-dev:** bump eslint from 8.56.0 to 8.57.0 ([#10588](https://github.com/mdn/yari/issues/10588)) ([6e46748](https://github.com/mdn/yari/commit/6e46748bab07a0b39f8b686640203a4f0c369738))
* **deps-dev:** bump eslint-plugin-jsx-a11y from 6.7.1 to 6.8.0 ([#9929](https://github.com/mdn/yari/issues/9929)) ([367f373](https://github.com/mdn/yari/commit/367f37392a2cab4d32f013a8d5b59b2df5f8579d))
* **deps-dev:** bump fork-ts-checker-webpack-plugin from 6.5.0 to 9.0.2 ([#10591](https://github.com/mdn/yari/issues/10591)) ([0117ac1](https://github.com/mdn/yari/commit/0117ac173c4c32155ad168c45b0a50306259af20))
* **deps-dev:** bump html-validate from 8.10.0 to 8.11.0 ([#10584](https://github.com/mdn/yari/issues/10584)) ([5cd05b4](https://github.com/mdn/yari/commit/5cd05b4237d4d063fb4877502cdd2c9c28b6fd9a))
* **deps-dev:** bump html-validate from 8.9.1 to 8.10.0 ([#10569](https://github.com/mdn/yari/issues/10569)) ([daa4ef2](https://github.com/mdn/yari/commit/daa4ef28b9f5546c482d1cc0efbfe25c0a142045))
* **deps-dev:** bump peggy from 3.0.2 to 4.0.0 ([#10516](https://github.com/mdn/yari/issues/10516)) ([bad77c6](https://github.com/mdn/yari/commit/bad77c63eb99fc5fb2461e35bf1b70e6eab24ce7))
* **deps-dev:** bump peggy from 4.0.0 to 4.0.2 ([#10594](https://github.com/mdn/yari/issues/10594)) ([349a46a](https://github.com/mdn/yari/commit/349a46a26c79d41b3f27ad6cb53c22b5b9356a68))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.11 to 2.4.12 ([#10578](https://github.com/mdn/yari/issues/10578)) ([9a7fc22](https://github.com/mdn/yari/commit/9a7fc22252c8b1d784d04e0dff618d8ec46b13c1))
* **deps-dev:** bump the types group with 1 update ([#10577](https://github.com/mdn/yari/issues/10577)) ([950a0b1](https://github.com/mdn/yari/commit/950a0b182dfe05affdb5d7d92da6875492f49eb1))
* **deps-dev:** bump typescript from 5.1.6 to 5.3.3 ([#10147](https://github.com/mdn/yari/issues/10147)) ([640513a](https://github.com/mdn/yari/commit/640513a2ce14bf4ef72dea707941b16dcdc4bcae))
* **deps-dev:** bump webpack-dev-server from 4.15.1 to 5.0.2 ([#10543](https://github.com/mdn/yari/issues/10543)) ([4c8bbf7](https://github.com/mdn/yari/commit/4c8bbf78e7e399fb3cc0546a31fa10fb0170b813))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.34 to 2.7.35 in /client/pwa ([#10583](https://github.com/mdn/yari/issues/10583)) ([2ec94d5](https://github.com/mdn/yari/commit/2ec94d5782fa175100ee17423d574e3ff4a8ed58))
* **deps:** bump @mozilla/glean from 2.0.5 to 4.0.0 ([#10383](https://github.com/mdn/yari/issues/10383)) ([8f04cd7](https://github.com/mdn/yari/commit/8f04cd78ec22c4e0266d77e5ba2b9075f72ce116))
* **deps:** bump @stripe/stripe-js from 2.4.0 to 3.0.5 ([#10570](https://github.com/mdn/yari/issues/10570)) ([c76d886](https://github.com/mdn/yari/commit/c76d886719d515611ef597016f2e4b03cf30d96e))
* **deps:** bump @webref/css from 6.11.2 to 6.12.0 ([#10585](https://github.com/mdn/yari/issues/10585)) ([5fb4e32](https://github.com/mdn/yari/commit/5fb4e32fff73e2f80236b34f98633cab01576dc7))
* **deps:** bump mdn-data from 2.4.0 to 2.4.1 ([#10586](https://github.com/mdn/yari/issues/10586)) ([0e6ef4c](https://github.com/mdn/yari/commit/0e6ef4c8032f5e8eb9904adc34a03a3df36a9328))
* **deps:** bump open from 10.0.3 to 10.0.4 ([#10587](https://github.com/mdn/yari/issues/10587)) ([39a28c4](https://github.com/mdn/yari/commit/39a28c418ee8a3ff30b5f22c270d2a358e621733))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10581](https://github.com/mdn/yari/issues/10581)) ([4a2fffe](https://github.com/mdn/yari/commit/4a2fffe67b008b248bfb72f1aefa889609e031a2))
* **deps:** bump the dependencies group in /testing/integration with 1 update ([#10582](https://github.com/mdn/yari/issues/10582)) ([81c193c](https://github.com/mdn/yari/commit/81c193c433b914ef1ff28eed915a19eacfe59994))
* **deps:** bump the sentry group with 2 updates ([#10576](https://github.com/mdn/yari/issues/10576)) ([bb90578](https://github.com/mdn/yari/commit/bb90578608ef0a1f207fae98202be40c285ef3ca))
* **deps:** bump web-specs from 3.3.0 to 3.3.1 ([#10590](https://github.com/mdn/yari/issues/10590)) ([5f35595](https://github.com/mdn/yari/commit/5f35595bb7d4ba0f632b84237e4c24258b4ee058))
* **macros/Firefox_for_developers:** remove the parameter and add zh-CN translation ([#10034](https://github.com/mdn/yari/issues/10034)) ([c8c3908](https://github.com/mdn/yari/commit/c8c39081c3d7cbd98e4c12e66e11d3d6a4fef1f9))
* **macros:** mark DOMAttributeMethods as deprecated ([#10529](https://github.com/mdn/yari/issues/10529)) ([006eb85](https://github.com/mdn/yari/commit/006eb85729f34721eea92e5f2146f83dd5c37438))

## [2.39.4](https://github.com/mdn/yari/compare/v2.39.3...v2.39.4) (2024-02-21)


### Bug Fixes

* **ai-help:** send correct context when editing question ([#10511](https://github.com/mdn/yari/issues/10511)) ([c49c125](https://github.com/mdn/yari/commit/c49c125e3cd217595095d5a2c755a6535ead43b7))
* **bcd:** re-surface "see bug xxxxx" notes ([#10549](https://github.com/mdn/yari/issues/10549)) ([6da4660](https://github.com/mdn/yari/commit/6da4660634350f39e3adfa0afcf15e1fcf838bc1))
* locale missing page - no data due to missing await ([#10550](https://github.com/mdn/yari/issues/10550)) ([d022ba5](https://github.com/mdn/yari/commit/d022ba56efbbacdc302996991e2c50ed0cb077d9))


### Miscellaneous

* **ai-help:** update Usage Guidance copy ([#10531](https://github.com/mdn/yari/issues/10531)) ([475fe4e](https://github.com/mdn/yari/commit/475fe4e26ec5d4e65243bbc84dff10d753f51c04))
* **build:** remove the translation_of metadata ([#10037](https://github.com/mdn/yari/issues/10037)) ([e457ab8](https://github.com/mdn/yari/commit/e457ab8bee5c90d743d226e7a713f51d4b2cf9b4))
* **deps-dev:** bump @swc/core from 1.4.1 to 1.4.2 ([#10547](https://github.com/mdn/yari/issues/10547)) ([ee212ec](https://github.com/mdn/yari/commit/ee212ecc1f48aed98a2ba5fd292765b84f67ab04))
* **deps-dev:** bump browserslist from 4.22.3 to 4.23.0 ([#10526](https://github.com/mdn/yari/issues/10526)) ([7bf19e8](https://github.com/mdn/yari/commit/7bf19e80d7f5150be919b5e529cdfe5fcd41c19c))
* **deps-dev:** bump eslint-plugin-jest from 27.8.0 to 27.9.0 ([#10544](https://github.com/mdn/yari/issues/10544)) ([5e74f17](https://github.com/mdn/yari/commit/5e74f17be451042495b705a73f3ed0e19e0d41d3))
* **deps-dev:** bump postcss-preset-env from 9.3.0 to 9.4.0 ([#10555](https://github.com/mdn/yari/issues/10555)) ([aa8384d](https://github.com/mdn/yari/commit/aa8384d6c48eb19e3d321abcb05ec38db5f458a8))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.10 to 2.4.11 ([#10534](https://github.com/mdn/yari/issues/10534)) ([e14678d](https://github.com/mdn/yari/commit/e14678d3b32a7c22bde1f2d1a8a294077a6c3644))
* **deps-dev:** bump react-router-dom from 6.22.0 to 6.22.1 ([#10546](https://github.com/mdn/yari/issues/10546)) ([5aa121f](https://github.com/mdn/yari/commit/5aa121fa363d14d09ee1b079acf8aa73b704c470))
* **deps-dev:** bump sass from 1.70.0 to 1.71.0 ([#10536](https://github.com/mdn/yari/issues/10536)) ([b41eac2](https://github.com/mdn/yari/commit/b41eac27929ade4cd85a76a873f24944a005cdb0))
* **deps-dev:** bump sass from 1.71.0 to 1.71.1 ([#10565](https://github.com/mdn/yari/issues/10565)) ([74c1448](https://github.com/mdn/yari/commit/74c1448abe481aea8ca40b1559c00e8e5410e07c))
* **deps-dev:** bump sass-loader from 14.1.0 to 14.1.1 ([#10558](https://github.com/mdn/yari/issues/10558)) ([20075de](https://github.com/mdn/yari/commit/20075de977828a2dc4d9a822bef4af6d91f4c924))
* **deps-dev:** bump swr from 2.2.4 to 2.2.5 ([#10538](https://github.com/mdn/yari/issues/10538)) ([4cc6e36](https://github.com/mdn/yari/commit/4cc6e3688b8ec80e91bc9d15be01c65523e96164))
* **deps-dev:** bump the types group with 1 update ([#10542](https://github.com/mdn/yari/issues/10542)) ([6b95d7c](https://github.com/mdn/yari/commit/6b95d7ce3980ae332d75da3058b9f275f5e187f6))
* **deps-dev:** bump the types group with 1 update ([#10552](https://github.com/mdn/yari/issues/10552)) ([f553b79](https://github.com/mdn/yari/commit/f553b79b3645c620ae69cad6b0ad8b61a2bc6b84))
* **deps-dev:** bump webpack from 5.90.1 to 5.90.2 ([#10537](https://github.com/mdn/yari/issues/10537)) ([c976a8c](https://github.com/mdn/yari/commit/c976a8c6a46adfee78c42b6a960d157d4f3f7b08))
* **deps-dev:** bump webpack from 5.90.1 to 5.90.2 in /client/pwa ([#10539](https://github.com/mdn/yari/issues/10539)) ([b485006](https://github.com/mdn/yari/commit/b485006bdae9dcddb7fbef4feac33b74d16063e9))
* **deps-dev:** bump webpack from 5.90.2 to 5.90.3 ([#10553](https://github.com/mdn/yari/issues/10553)) ([52b9751](https://github.com/mdn/yari/commit/52b97510c87e23d611611e3e7e6d0d002b5435e2))
* **deps-dev:** bump webpack from 5.90.2 to 5.90.3 in /client/pwa ([#10551](https://github.com/mdn/yari/issues/10551)) ([c326deb](https://github.com/mdn/yari/commit/c326debb90ad94e768ff4bd4dbc491cf36f9cc99))
* **deps:** bump @codemirror/lang-javascript from 6.2.1 to 6.2.2 ([#10563](https://github.com/mdn/yari/issues/10563)) ([7052044](https://github.com/mdn/yari/commit/7052044cbcd0b3cbcd40003776327277ebc3a287))
* **deps:** bump @codemirror/state from 6.4.0 to 6.4.1 ([#10559](https://github.com/mdn/yari/issues/10559)) ([5a8debb](https://github.com/mdn/yari/commit/5a8debb77a0eb010a040ba726a0181dd88f4544b))
* **deps:** bump @mdn/browser-compat-data from 5.5.10 to 5.5.11 ([#10566](https://github.com/mdn/yari/issues/10566)) ([ab04c11](https://github.com/mdn/yari/commit/ab04c1104bd988f3a8a86bcfbd8b09e85254f929))
* **deps:** bump @webref/css from 6.11.1 to 6.11.2 ([#10525](https://github.com/mdn/yari/issues/10525)) ([0759aff](https://github.com/mdn/yari/commit/0759aff7075500244df4a2dc335c9a0797d0325f))
* **deps:** bump cryptography from 42.0.0 to 42.0.2 in /deployer ([#10540](https://github.com/mdn/yari/issues/10540)) ([dbd7f1c](https://github.com/mdn/yari/commit/dbd7f1ccf8cba54510a5288465b799771c789aea))
* **deps:** bump cryptography from 42.0.2 to 42.0.4 in /deployer ([#10568](https://github.com/mdn/yari/issues/10568)) ([da1b839](https://github.com/mdn/yari/commit/da1b8398dd624400c6e72c30e199afaa053ada34))
* **deps:** bump dotenv from 16.4.4 to 16.4.5 ([#10554](https://github.com/mdn/yari/issues/10554)) ([e42b736](https://github.com/mdn/yari/commit/e42b73663541d7ee707eebcd8bb8567f0556e9b3))
* **deps:** bump inquirer from 9.2.14 to 9.2.15 ([#10556](https://github.com/mdn/yari/issues/10556)) ([cc69204](https://github.com/mdn/yari/commit/cc692045f5533ade6974da4f86cd1b8dc2b637b6))
* **deps:** bump the dependencies group in /deployer with 3 updates ([#10541](https://github.com/mdn/yari/issues/10541)) ([50d18a1](https://github.com/mdn/yari/commit/50d18a10fe2c8eb0901df1950fe385056929f030))
* **deps:** bump the dependencies group in /testing/integration with 2 updates ([#10548](https://github.com/mdn/yari/issues/10548)) ([2f4a09d](https://github.com/mdn/yari/commit/2f4a09d0021817207f1dc3a1dea368267ab49d28))
* **deps:** bump the sentry group with 2 updates ([#10523](https://github.com/mdn/yari/issues/10523)) ([5edaf3c](https://github.com/mdn/yari/commit/5edaf3c2ae90085c343aca7917e6632630415bbb))
* **deps:** bump the sentry group with 2 updates ([#10561](https://github.com/mdn/yari/issues/10561)) ([a8be690](https://github.com/mdn/yari/commit/a8be690e6f6802d8fcae9c336fdc4ee026d7e858))
* **deps:** bump web-specs from 3.0.0 to 3.1.0 ([#10524](https://github.com/mdn/yari/issues/10524)) ([5aee08a](https://github.com/mdn/yari/commit/5aee08ae17675693180f4a0c0803c7d173e682ef))
* **deps:** bump web-specs from 3.1.0 to 3.3.0 ([#10557](https://github.com/mdn/yari/issues/10557)) ([d4cd051](https://github.com/mdn/yari/commit/d4cd0514c8f8a25f7df11f7e0ca91c52a4006c16))

## [2.39.3](https://github.com/mdn/yari/compare/v2.39.2...v2.39.3) (2024-02-14)


### Bug Fixes

* **macros/CSS_Ref:** fix special cases ([#10241](https://github.com/mdn/yari/issues/10241)) ([3cc3204](https://github.com/mdn/yari/commit/3cc32040d7ee25f8ab2dc4702fdf3e5362722455))


### Miscellaneous

* **deps-dev:** bump @swc/core from 1.4.0 to 1.4.1 ([#10508](https://github.com/mdn/yari/issues/10508)) ([52e49e2](https://github.com/mdn/yari/commit/52e49e27c26c0c63d3ba8f40215eb6e5790d9fbc))
* **deps-dev:** bump diff from 5.1.0 to 5.2.0 ([#10509](https://github.com/mdn/yari/issues/10509)) ([7937e60](https://github.com/mdn/yari/commit/7937e604466f5ef83ca2fca77e0c604b47d767de))
* **deps-dev:** bump eslint-plugin-jest from 27.6.3 to 27.8.0 ([#10513](https://github.com/mdn/yari/issues/10513)) ([f56840a](https://github.com/mdn/yari/commit/f56840ad4c6a8a41615a68618372f0c14fb85c9c))
* **deps-dev:** bump husky from 9.0.10 to 9.0.11 ([#10518](https://github.com/mdn/yari/issues/10518)) ([02d1832](https://github.com/mdn/yari/commit/02d1832d8e43456f6d949b7aa961a63a2a093087))
* **deps:** bump dotenv from 16.4.1 to 16.4.2 ([#10499](https://github.com/mdn/yari/issues/10499)) ([e3e3f72](https://github.com/mdn/yari/commit/e3e3f72952ca793478cb173a1c32792f28781178))
* **deps:** bump dotenv from 16.4.2 to 16.4.3 ([#10510](https://github.com/mdn/yari/issues/10510)) ([7a76dab](https://github.com/mdn/yari/commit/7a76dabf0984c0ffa48954b9c4a5629f4bb07a4d))
* **deps:** bump dotenv from 16.4.3 to 16.4.4 ([#10515](https://github.com/mdn/yari/issues/10515)) ([1493eb6](https://github.com/mdn/yari/commit/1493eb68dac74f83bfa297c9c9f1f1c9f3e11ae0))
* **deps:** bump openai from 4.27.0 to 4.28.0 ([#10505](https://github.com/mdn/yari/issues/10505)) ([7fc08f4](https://github.com/mdn/yari/commit/7fc08f4a130403f0a2d2ad1e6ec70d836ddce936))
* **deps:** bump pgvector from 0.1.7 to 0.1.8 ([#10498](https://github.com/mdn/yari/issues/10498)) ([bb646a5](https://github.com/mdn/yari/commit/bb646a578a5c706e835bab7dcfaaa73ab557fad9))
* **deps:** bump pytest from 7.4.4 to 8.0.0 in /testing/integration ([#10500](https://github.com/mdn/yari/issues/10500)) ([524b202](https://github.com/mdn/yari/commit/524b2023d8c88f09596ac9d362c95a2b48a23a9c))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10501](https://github.com/mdn/yari/issues/10501)) ([06cd562](https://github.com/mdn/yari/commit/06cd562a408dbfa8b0f45e096fd6f6ee9579b336))
* **deps:** bump the sentry group with 2 updates ([#10512](https://github.com/mdn/yari/issues/10512)) ([46820bc](https://github.com/mdn/yari/commit/46820bcdbca00e4005ea80982876744ead07895d))
* **deps:** bump web-specs from 2.79.0 to 3.0.0 ([#10478](https://github.com/mdn/yari/issues/10478)) ([ce83ddc](https://github.com/mdn/yari/commit/ce83ddcd242989ae79a8acc8fa39dec56cd2bd0e))
* **macros:** Mark 'unimplemented_inline' as deprecated ([#10486](https://github.com/mdn/yari/issues/10486)) ([9d136b0](https://github.com/mdn/yari/commit/9d136b07dceb4418fefd621a79235858d422e61a))

## [2.39.2](https://github.com/mdn/yari/compare/v2.39.1...v2.39.2) (2024-02-09)


### Bug Fixes

* **baseline:** blocklist some bcd keys from input-event ([#10493](https://github.com/mdn/yari/issues/10493)) ([c2a9ffc](https://github.com/mdn/yari/commit/c2a9ffc81b0265a2d58f8c8fbd62f01e94c987d5))


### Miscellaneous

* **ai-help:** remove old index script ([#10484](https://github.com/mdn/yari/issues/10484)) ([bacf525](https://github.com/mdn/yari/commit/bacf52544c1529b5f640837a740038c8011ccd6b))
* **deps-dev:** bump postcss from 8.4.34 to 8.4.35 ([#10481](https://github.com/mdn/yari/issues/10481)) ([1140572](https://github.com/mdn/yari/commit/1140572b0228774efeac6bac5b4b75531ddd3800))
* **deps-dev:** bump the types group with 1 update ([#10480](https://github.com/mdn/yari/issues/10480)) ([8b573ed](https://github.com/mdn/yari/commit/8b573edc92c78c45333b533f67b281a5d3ccb3e0))
* **deps:** bump @mdn/browser-compat-data from 5.5.9 to 5.5.10 ([#10489](https://github.com/mdn/yari/issues/10489)) ([4cab20b](https://github.com/mdn/yari/commit/4cab20b642906a289d7c6fba19bd8a2219c63a5e))
* **deps:** bump @webref/css from 6.11.0 to 6.11.1 ([#10491](https://github.com/mdn/yari/issues/10491)) ([e047988](https://github.com/mdn/yari/commit/e047988aa60c515ff18ad47d10e02b2c5ab76136))
* **deps:** bump dexie from 3.2.4 to 3.2.5 ([#10490](https://github.com/mdn/yari/issues/10490)) ([a38c494](https://github.com/mdn/yari/commit/a38c4944308962ea18256e18a69a63b80a27a6eb))
* **deps:** bump dexie from 3.2.4 to 3.2.5 in /client/pwa ([#10488](https://github.com/mdn/yari/issues/10488)) ([5253e44](https://github.com/mdn/yari/commit/5253e44ec8c4282480e09b00aa69cefaeb656592))
* **deps:** bump openai from 4.26.1 to 4.27.0 ([#10492](https://github.com/mdn/yari/issues/10492)) ([2ef9ba3](https://github.com/mdn/yari/commit/2ef9ba302eb7da6c273f3a84ebeaf383fd75aa59))

## [2.39.1](https://github.com/mdn/yari/compare/v2.39.0...v2.39.1) (2024-02-07)


### Bug Fixes

* **baseline:** add custom elements group to blocklist ([#10479](https://github.com/mdn/yari/issues/10479)) ([7991c74](https://github.com/mdn/yari/commit/7991c746feb1ea965b36ddbf6dc5855f767b8974))
* **release-please:** disable include-component-in-tag ([#10417](https://github.com/mdn/yari/issues/10417)) ([22e2aae](https://github.com/mdn/yari/commit/22e2aae7e329609109668b37d1aa455626aa7a07))
* **release-please:** specify last-release-sha ([#10419](https://github.com/mdn/yari/issues/10419)) ([215e4ed](https://github.com/mdn/yari/commit/215e4eda3f05e8e96808ecfa359dc88b10c5c7a3))
* **workflows:** cache `@vscode/ripgrep` bin ([#10456](https://github.com/mdn/yari/issues/10456)) ([4a54637](https://github.com/mdn/yari/commit/4a54637a9f0ecfa4c943f309571f163e44b8f32d))
* **workflows:** cache `@vscode/ripgrep` bin in test job ([#10471](https://github.com/mdn/yari/issues/10471)) ([5a0cec4](https://github.com/mdn/yari/commit/5a0cec440911fd873a1be08f60bf3a94dbca87f6))


### Miscellaneous

* **deps-dev:** bump @babel/eslint-parser from 7.23.9 to 7.23.10 ([#10436](https://github.com/mdn/yari/issues/10436)) ([6f900cd](https://github.com/mdn/yari/commit/6f900cdfb3d5613bd4eee89e4d0f13fac6e94de2))
* **deps-dev:** bump @playwright/test from 1.41.1 to 1.41.2 ([#10446](https://github.com/mdn/yari/issues/10446)) ([6195f40](https://github.com/mdn/yari/commit/6195f406b6ed4a534b950ee445c83f263dd5aee0))
* **deps-dev:** bump @swc/core from 1.3.107 to 1.4.0 ([#10453](https://github.com/mdn/yari/issues/10453)) ([bb360ed](https://github.com/mdn/yari/commit/bb360ed78507c1870c6f9fc30b718f7790a71d21))
* **deps-dev:** bump @testing-library/react from 14.1.2 to 14.2.0 ([#10429](https://github.com/mdn/yari/issues/10429)) ([77c7c2c](https://github.com/mdn/yari/commit/77c7c2cf64e964aa8fae08e14c77ec9eed2d1ed2))
* **deps-dev:** bump @testing-library/react from 14.2.0 to 14.2.1 ([#10441](https://github.com/mdn/yari/issues/10441)) ([91a1411](https://github.com/mdn/yari/commit/91a141150a7f4a725e3f1ae7fb70e8c013ac7a79))
* **deps-dev:** bump css-loader from 6.9.1 to 6.10.0 ([#10426](https://github.com/mdn/yari/issues/10426)) ([01c70c8](https://github.com/mdn/yari/commit/01c70c898f9ac5cbd68c5d9df1b4c498510574f3))
* **deps-dev:** bump dependencies of react-dev-utils ([#10461](https://github.com/mdn/yari/issues/10461)) ([4458db7](https://github.com/mdn/yari/commit/4458db795dd54facbc01b0ced6fcb5b511e83d8e))
* **deps-dev:** bump eslint-plugin-unicorn from 50.0.1 to 51.0.0 ([#10469](https://github.com/mdn/yari/issues/10469)) ([b123234](https://github.com/mdn/yari/commit/b1232340c226d7587e0e5badedd5465fe2d5a57d))
* **deps-dev:** bump eslint-plugin-unicorn from 51.0.0 to 51.0.1 ([#10477](https://github.com/mdn/yari/issues/10477)) ([9024655](https://github.com/mdn/yari/commit/9024655d87520b9aa45069fd329a3debf2d8eb1d))
* **deps-dev:** bump husky from 9.0.6 to 9.0.7 ([#10422](https://github.com/mdn/yari/issues/10422)) ([7bbda7d](https://github.com/mdn/yari/commit/7bbda7d38d9a2872be8ddb8708b2b999372d4ee9))
* **deps-dev:** bump husky from 9.0.7 to 9.0.10 ([#10445](https://github.com/mdn/yari/issues/10445)) ([f347bfc](https://github.com/mdn/yari/commit/f347bfc33bd48795b0e3760c3937b084189c1809))
* **deps-dev:** bump mini-css-extract-plugin from 2.7.7 to 2.8.0 ([#10447](https://github.com/mdn/yari/issues/10447)) ([01f9593](https://github.com/mdn/yari/commit/01f95931097ff88890d248fc6fca55a4f586b246))
* **deps-dev:** bump postcss from 8.4.33 to 8.4.34 ([#10467](https://github.com/mdn/yari/issues/10467)) ([4a662bb](https://github.com/mdn/yari/commit/4a662bbc1844bdf651d3fb93bd4dd6b05be3af3a))
* **deps-dev:** bump postcss-loader from 8.0.0 to 8.1.0 ([#10431](https://github.com/mdn/yari/issues/10431)) ([62f0adb](https://github.com/mdn/yari/commit/62f0adb3afe3038fbcb13232e3b58f8e0208d3dc))
* **deps-dev:** bump prettier from 3.2.4 to 3.2.5 ([#10455](https://github.com/mdn/yari/issues/10455)) ([67fdc91](https://github.com/mdn/yari/commit/67fdc91b248923662df9a36c00c6ce30de928dc7))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.9 to 2.4.10 ([#10427](https://github.com/mdn/yari/issues/10427)) ([58dcdf0](https://github.com/mdn/yari/commit/58dcdf0bddab403dbdd8d0383533484d873434b6))
* **deps-dev:** bump react-router-dom from 6.21.3 to 6.22.0 ([#10444](https://github.com/mdn/yari/issues/10444)) ([31b94c6](https://github.com/mdn/yari/commit/31b94c6cf039439ecf0deb4306c4c5eadb72d311))
* **deps-dev:** bump sass-loader from 14.0.0 to 14.1.0 ([#10428](https://github.com/mdn/yari/issues/10428)) ([ab2dbf6](https://github.com/mdn/yari/commit/ab2dbf69bc0f48294d0c1716d020e9270c401e45))
* **deps-dev:** bump semver from 7.5.4 to 7.6.0 ([#10468](https://github.com/mdn/yari/issues/10468)) ([ce512f7](https://github.com/mdn/yari/commit/ce512f7762f8757de3a60b8f566a82de2ccaf9f2))
* **deps-dev:** bump the types group with 1 update ([#10435](https://github.com/mdn/yari/issues/10435)) ([d88a713](https://github.com/mdn/yari/commit/d88a7139e033bc7909d4f35f1b56417c49f537fe))
* **deps-dev:** bump the types group with 1 update ([#10440](https://github.com/mdn/yari/issues/10440)) ([8915582](https://github.com/mdn/yari/commit/89155828cfa519aa6e424780b546122b551554dd))
* **deps-dev:** bump the types group with 1 update ([#10458](https://github.com/mdn/yari/issues/10458)) ([f0e7510](https://github.com/mdn/yari/commit/f0e7510ff30029e613f518b5bc25587782350177))
* **deps-dev:** bump the types group with 1 update ([#10465](https://github.com/mdn/yari/issues/10465)) ([a94587d](https://github.com/mdn/yari/commit/a94587deaf827bd06be63d7216e08885c35efebc))
* **deps-dev:** bump webpack from 5.90.0 to 5.90.1 ([#10442](https://github.com/mdn/yari/issues/10442)) ([f5cb5ea](https://github.com/mdn/yari/commit/f5cb5eab5a08c981743bc4bc4d52407c7efe22ba))
* **deps-dev:** bump webpack from 5.90.0 to 5.90.1 in /client/pwa ([#10448](https://github.com/mdn/yari/issues/10448)) ([7476828](https://github.com/mdn/yari/commit/7476828393d6a085bc87b1708c954d5ceed04634))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.33 to 2.7.34 in /client/pwa ([#10420](https://github.com/mdn/yari/issues/10420)) ([4f84e9a](https://github.com/mdn/yari/commit/4f84e9af605a2ad03bb34eecccaf2635e02a8a1c))
* **deps:** bump @mdn/browser-compat-data from 5.5.8 to 5.5.9 ([#10430](https://github.com/mdn/yari/issues/10430)) ([6c262f5](https://github.com/mdn/yari/commit/6c262f5574599addc1db45e24e70777e250e7884))
* **deps:** bump @webref/css from 6.10.3 to 6.10.4 ([#10423](https://github.com/mdn/yari/issues/10423)) ([4a663e1](https://github.com/mdn/yari/commit/4a663e173d419dd509dd24335f998a713586f472))
* **deps:** bump @webref/css from 6.10.4 to 6.11.0 ([#10432](https://github.com/mdn/yari/issues/10432)) ([db014f7](https://github.com/mdn/yari/commit/db014f71b16a2cb29aa6937b4d2dda3427a54b1f))
* **deps:** bump actions/cache from 3 to 4 ([#10470](https://github.com/mdn/yari/issues/10470)) ([7389cc9](https://github.com/mdn/yari/commit/7389cc9d195fb5794b7f144189b4b1b94d7b6686))
* **deps:** bump aws-actions/configure-aws-credentials from 4.0.1 to 4.0.2 ([#10475](https://github.com/mdn/yari/issues/10475)) ([e4b1549](https://github.com/mdn/yari/commit/e4b1549b3f23ebb82a65555ca58e45c583f2256b))
* **deps:** bump cryptography from 41.0.6 to 42.0.0 in /deployer ([#10459](https://github.com/mdn/yari/issues/10459)) ([0e6bcdd](https://github.com/mdn/yari/commit/0e6bcdda0c55c440b5c7ee8ef493d4bed37a4561))
* **deps:** bump fast-xml-parser from 4.1.3 to 4.3.4 ([#10460](https://github.com/mdn/yari/issues/10460)) ([610e106](https://github.com/mdn/yari/commit/610e106d981d781e776dc5502d59d7b2bd4566df))
* **deps:** bump follow-redirects from 1.15.2 to 1.15.5 in /cloud-function ([#10464](https://github.com/mdn/yari/issues/10464)) ([8540bac](https://github.com/mdn/yari/commit/8540bacbb06ab0f6259cb5ea35d757926f5ac9e8))
* **deps:** bump inquirer from 9.2.13 to 9.2.14 ([#10452](https://github.com/mdn/yari/issues/10452)) ([7cc2d4c](https://github.com/mdn/yari/commit/7cc2d4cd8a0b3dcbf4bba765d8307492eccbc393))
* **deps:** bump is-svg v4 from 4.3.2 to 4.4.0 ([#10473](https://github.com/mdn/yari/issues/10473)) ([b5d8087](https://github.com/mdn/yari/commit/b5d80878520434e30b0ffcd058aea5e44bac2818))
* **deps:** bump mdast-util-phrasing from 4.0.0 to 4.1.0 ([#10437](https://github.com/mdn/yari/issues/10437)) ([3dc7055](https://github.com/mdn/yari/commit/3dc7055d95947ab99b1d8100f90ff5e20ea7732e))
* **deps:** bump openai from 4.26.0 to 4.26.1 ([#10454](https://github.com/mdn/yari/issues/10454)) ([a4138bd](https://github.com/mdn/yari/commit/a4138bdf682523e619e445ee6ffa624b81ce3a2d))
* **deps:** bump semver v5 + v7 in /cloud-function ([#10474](https://github.com/mdn/yari/issues/10474)) ([a8e78ac](https://github.com/mdn/yari/commit/a8e78ac7ba3fe3d87eff849dde2ce2821585bb31))
* **deps:** bump semver v5 from 5.7.1 to 5.7.2 ([#10472](https://github.com/mdn/yari/issues/10472)) ([5553816](https://github.com/mdn/yari/commit/555381642c82bba9fbfd54ae242712b7307ff24a))
* **deps:** bump the dependencies group in /deployer with 1 update ([#10449](https://github.com/mdn/yari/issues/10449)) ([40e256d](https://github.com/mdn/yari/commit/40e256d4c068992294da6543a7486735012f6866))
* **deps:** bump the dependencies group in /testing/integration with 1 update ([#10450](https://github.com/mdn/yari/issues/10450)) ([3d2e7ad](https://github.com/mdn/yari/commit/3d2e7ad4debcc05e98793b665ea55b3bfd34604d))
* **deps:** bump the sentry group with 2 updates ([#10425](https://github.com/mdn/yari/issues/10425)) ([35adc26](https://github.com/mdn/yari/commit/35adc260ea472427eb028f7568629754aa7c5cb8))
* **deps:** bump the sentry group with 2 updates ([#10476](https://github.com/mdn/yari/issues/10476)) ([76ffc20](https://github.com/mdn/yari/commit/76ffc20b31b0e9519c066b7cf68e61d7c711897e))
* **deps:** bump web-specs from 2.77.0 to 2.78.0 ([#10421](https://github.com/mdn/yari/issues/10421)) ([bc7c5f6](https://github.com/mdn/yari/commit/bc7c5f69b27a01913644d38863e4db3575f80b70))
* **deps:** bump web-specs from 2.78.0 to 2.79.0 ([#10466](https://github.com/mdn/yari/issues/10466)) ([542ad82](https://github.com/mdn/yari/commit/542ad82ce46fcd7563611ea02041e37f0776bdf3))
* **deps:** resolve http-cache-semantics to &gt;=4.1.1 ([#10462](https://github.com/mdn/yari/issues/10462)) ([85f7368](https://github.com/mdn/yari/commit/85f7368eea5d68e00bc8108a6606af6296d01f7f))
* **deps:** resolve semver-regex to ^3.1.4 ([#10463](https://github.com/mdn/yari/issues/10463)) ([62eb5f5](https://github.com/mdn/yari/commit/62eb5f5db35b731e7b73a6a92240bd456066fb0d))

## [2.39.0](https://github.com/mdn/yari/compare/yari-v2.38.4...yari-v2.39.0) (2024-01-30)


### Features

* **ai-help:** index content as markdown ([#10330](https://github.com/mdn/yari/issues/10330)) ([337d0b1](https://github.com/mdn/yari/commit/337d0b154b476e17d73a0e0a866f645add31bd37))
* **build:** add Macro render report ([#10372](https://github.com/mdn/yari/issues/10372)) ([6ce14ab](https://github.com/mdn/yari/commit/6ce14aba7ffe037acab128af812cd153fe560d1b))
* **macro/MDNSidebar:** rewrite macro + add missing pages ([#10329](https://github.com/mdn/yari/issues/10329)) ([35d448e](https://github.com/mdn/yari/commit/35d448e9c90a0eb8dee4f79472f3dca825a318e0))
* **scripts:** use pg instead of supabase ([#10337](https://github.com/mdn/yari/issues/10337)) ([5ce3a65](https://github.com/mdn/yari/commit/5ce3a65e320b6005973be804c597283b2ff002f2))


### Bug Fixes

* **ai-help:** don't allow empty questions ([#10344](https://github.com/mdn/yari/issues/10344)) ([6cd6d4a](https://github.com/mdn/yari/commit/6cd6d4ad4e1879df199df6b6066da2b1479b96d5))
* **ai-help:** example header highlighting ([#10366](https://github.com/mdn/yari/issues/10366)) ([bb5ef9a](https://github.com/mdn/yari/commit/bb5ef9a4e89c630c25e9d0e0fc15534f1129ea6d))
* **bcd:** link to pages in same locale ([#10373](https://github.com/mdn/yari/issues/10373)) ([4ac6fdf](https://github.com/mdn/yari/commit/4ac6fdf6316e54119c2c90623305a58271604a39))
* **macros/CSSSyntax:** cache parsed webref data ([#10225](https://github.com/mdn/yari/issues/10225)) ([078fa86](https://github.com/mdn/yari/commit/078fa8620ca65c7aba6b67d81a8f50de6d9854d1))
* **plus:** scroll to anchor hook ([#10364](https://github.com/mdn/yari/issues/10364)) ([20db7d1](https://github.com/mdn/yari/commit/20db7d137a70f92b6d826eec306d873521b5e175))
* **release-please:** fix config structure ([#10412](https://github.com/mdn/yari/issues/10412)) ([ac63c63](https://github.com/mdn/yari/commit/ac63c63e9970bb099470e369e6775546111a6f10))
* **release-please:** move bootstrap-sha to config ([#10415](https://github.com/mdn/yari/issues/10415)) ([105d9f3](https://github.com/mdn/yari/commit/105d9f3c2f59f84679e084a863372fe0bc3db46c))
* **release-please:** move release-type/changelog-sections to config file ([#10411](https://github.com/mdn/yari/issues/10411)) ([ea3a849](https://github.com/mdn/yari/commit/ea3a84900fa58e664048cc8b10d78a5d8c2d18a0))
* **release-please:** specify last release ([#10416](https://github.com/mdn/yari/issues/10416)) ([e92d309](https://github.com/mdn/yari/commit/e92d309da051be77792dd0f66b7792946771fce0))
* **release-please:** specify last-release-sha ([#10413](https://github.com/mdn/yari/issues/10413)) ([f8dc664](https://github.com/mdn/yari/commit/f8dc6644fa5310f821352fbe5dfbc7ae696bdd25))
* **release-please:** use bootstrap-sha instead of last-release-sha ([#10414](https://github.com/mdn/yari/issues/10414)) ([1d86b6c](https://github.com/mdn/yari/commit/1d86b6cbe55254aa36a100cbf7f10d69ed514074))


### Miscellaneous

* **deps-dev:** bump @babel/core from 7.23.7 to 7.23.9 ([#10396](https://github.com/mdn/yari/issues/10396)) ([5cb1e98](https://github.com/mdn/yari/commit/5cb1e98bfc16539dd7fca02ec1503d16cf9f366c))
* **deps-dev:** bump @babel/eslint-parser from 7.23.3 to 7.23.9 ([#10394](https://github.com/mdn/yari/issues/10394)) ([29b1d16](https://github.com/mdn/yari/commit/29b1d16a6d8c038d9bf44604c0e3e2961a0746ab))
* **deps-dev:** bump @babel/preset-env from 7.23.8 to 7.23.9 ([#10390](https://github.com/mdn/yari/issues/10390)) ([afc1c1c](https://github.com/mdn/yari/commit/afc1c1c144715053bb6ba72e5377cc315a7546fc))
* **deps-dev:** bump @swc/core from 1.3.105 to 1.3.106 ([#10379](https://github.com/mdn/yari/issues/10379)) ([1e54143](https://github.com/mdn/yari/commit/1e54143912b057bbc4b95376bb73f90ee1565887))
* **deps-dev:** bump @swc/core from 1.3.106 to 1.3.107 ([#10406](https://github.com/mdn/yari/issues/10406)) ([e48be08](https://github.com/mdn/yari/commit/e48be086a2b3093e6324d70ab7c4d9bcd028ea2a))
* **deps-dev:** bump black from 23.12.1 to 24.1.1 in /deployer ([#10402](https://github.com/mdn/yari/issues/10402)) ([d8f0ed2](https://github.com/mdn/yari/commit/d8f0ed21b7904c7ba727d413a2642f982f28a7de))
* **deps-dev:** bump black from 23.12.1 to 24.1.1 in /testing/integration ([#10405](https://github.com/mdn/yari/issues/10405)) ([18992be](https://github.com/mdn/yari/commit/18992bee14820e0d18c7c1b9829f6a4880869199))
* **deps-dev:** bump browserslist from 4.22.2 to 4.22.3 ([#10403](https://github.com/mdn/yari/issues/10403)) ([6da95a8](https://github.com/mdn/yari/commit/6da95a8f246366800bd882cf67631b2d05acfc2a))
* **deps-dev:** bump flake8 from 6.1.0 to 7.0.0 in /testing/integration ([#10279](https://github.com/mdn/yari/issues/10279)) ([9838d6c](https://github.com/mdn/yari/commit/9838d6ca60bd72e0c32cff9f5ffa3546de3fc3d4))
* **deps-dev:** bump husky from 8.0.3 to 9.0.6 ([#10391](https://github.com/mdn/yari/issues/10391)) ([a9292ce](https://github.com/mdn/yari/commit/a9292ce818e96b8e3fe93102984f171f6208df03))
* **deps-dev:** bump pytest from 7.4.4 to 8.0.0 in /deployer ([#10401](https://github.com/mdn/yari/issues/10401)) ([4c8065b](https://github.com/mdn/yari/commit/4c8065be6a4d65a5ae843e3f73a5712bf539fb83))
* **deps-dev:** bump source-map-loader from 4.0.2 to 5.0.0 ([#10328](https://github.com/mdn/yari/issues/10328)) ([7df9c6d](https://github.com/mdn/yari/commit/7df9c6d49a34d9074e3c5b6f0cba379801a59169))
* **deps-dev:** bump webpack from 5.89.0 to 5.90.0 ([#10384](https://github.com/mdn/yari/issues/10384)) ([6370f06](https://github.com/mdn/yari/commit/6370f06303fa4d4235b851c52c20a901657d1107))
* **deps-dev:** bump webpack from 5.89.0 to 5.90.0 in /client/pwa ([#10377](https://github.com/mdn/yari/issues/10377)) ([c4b1804](https://github.com/mdn/yari/commit/c4b180423909f780d2d9d2434e54cdc912446d9c))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.32 to 2.7.33 in /client/pwa ([#10399](https://github.com/mdn/yari/issues/10399)) ([54a2131](https://github.com/mdn/yari/commit/54a213196f88bd213ef104e63c74b6f4ccd252ef))
* **deps:** bump @codemirror/lang-html from 6.4.7 to 6.4.8 ([#10367](https://github.com/mdn/yari/issues/10367)) ([5d88e37](https://github.com/mdn/yari/commit/5d88e37965f51bd0355e761161ecb9a9091a21f1))
* **deps:** bump @codemirror/state from 6.3.3 to 6.4.0 ([#10244](https://github.com/mdn/yari/issues/10244)) ([1ddda23](https://github.com/mdn/yari/commit/1ddda23ada96976e23157141ecda95f586a35125))
* **deps:** bump @fast-csv/parse from 4.3.6 to 5.0.0 ([#10320](https://github.com/mdn/yari/issues/10320)) ([04ec2ae](https://github.com/mdn/yari/commit/04ec2ae9a9f6cfeecdc66136399de1a1178b2fa5))
* **deps:** bump @mdn/browser-compat-data from 5.5.7 to 5.5.8 ([#10395](https://github.com/mdn/yari/issues/10395)) ([0b032f1](https://github.com/mdn/yari/commit/0b032f1b6bce86b087d048913c64e5f33f79be87))
* **deps:** bump @stripe/stripe-js from 2.3.0 to 2.4.0 ([#10368](https://github.com/mdn/yari/issues/10368)) ([c280d08](https://github.com/mdn/yari/commit/c280d08d311477bbadf34d4fa14ddefd974bc8b1))
* **deps:** bump @webref/css from 6.10.2 to 6.10.3 ([#10381](https://github.com/mdn/yari/issues/10381)) ([ea944c6](https://github.com/mdn/yari/commit/ea944c6b48e0ec2522999ffa04e0bf8d4cc950c1))
* **deps:** bump actions/cache from 3 to 4 ([#10339](https://github.com/mdn/yari/issues/10339)) ([698495f](https://github.com/mdn/yari/commit/698495f063cea3373f96144157bcecf8b9438de5))
* **deps:** bump actions/labeler from 4.3.0 to 5.0.0 ([#10130](https://github.com/mdn/yari/issues/10130)) ([0e93b7e](https://github.com/mdn/yari/commit/0e93b7e8427fe8848ed8accc26ad94cc0f7d79a2))
* **deps:** bump dotenv from 16.3.2 to 16.4.0 ([#10376](https://github.com/mdn/yari/issues/10376)) ([5d11e87](https://github.com/mdn/yari/commit/5d11e87b971867f85f7a125c16bb197f71ddb9ff))
* **deps:** bump dotenv from 16.4.0 to 16.4.1 ([#10380](https://github.com/mdn/yari/issues/10380)) ([b912c14](https://github.com/mdn/yari/commit/b912c14674c9512681bf9aa6891c32eb3cea33f5))
* **deps:** bump google-github-actions/release-please-action from 3 to 4 ([#10122](https://github.com/mdn/yari/issues/10122)) ([c9f1522](https://github.com/mdn/yari/commit/c9f15220c62aee979a39e446890f8426263b5198))
* **deps:** bump inquirer from 9.2.12 to 9.2.13 ([#10404](https://github.com/mdn/yari/issues/10404)) ([fb2275f](https://github.com/mdn/yari/commit/fb2275fd6df3c43bc6cb2c49e55c52cb37f80dfd))
* **deps:** bump loglevel from 1.8.1 to 1.9.1 ([#10389](https://github.com/mdn/yari/issues/10389)) ([471c5ca](https://github.com/mdn/yari/commit/471c5caca659dbd53f8339834961ad8dbdcfa828))
* **deps:** bump lru-cache from 10.1.0 to 10.2.0 ([#10392](https://github.com/mdn/yari/issues/10392)) ([d433d64](https://github.com/mdn/yari/commit/d433d647e26f1a79c99c75372042cdd7d5857aba))
* **deps:** bump mdn-data from 2.3.5 to 2.4.0 ([#10369](https://github.com/mdn/yari/issues/10369)) ([9bce11b](https://github.com/mdn/yari/commit/9bce11b6c50db97bde9afb87b34454c58dd3067a))
* **deps:** bump open from 9.1.0 to 10.0.3 ([#10285](https://github.com/mdn/yari/issues/10285)) ([8b18d51](https://github.com/mdn/yari/commit/8b18d515d0785fd1949d7797457476b654d65175))
* **deps:** bump openai from 4.25.0 to 4.26.0 ([#10397](https://github.com/mdn/yari/issues/10397)) ([082492b](https://github.com/mdn/yari/commit/082492b66d3f81019f6ca65039273710eb06b8bf))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10400](https://github.com/mdn/yari/issues/10400)) ([40f4b21](https://github.com/mdn/yari/commit/40f4b21d6403bf04d11ddf5fe86527989a9415b9))
* **deps:** bump the sentry group with 2 updates ([#10375](https://github.com/mdn/yari/issues/10375)) ([229b574](https://github.com/mdn/yari/commit/229b574f6ccb893957806d53bbf2a1b587e8a902))
* **deps:** bump the sentry group with 2 updates ([#10378](https://github.com/mdn/yari/issues/10378)) ([c3a4ed7](https://github.com/mdn/yari/commit/c3a4ed71c624d23fb540464901c96e6fd05da71e))
* **deps:** bump the sentry group with 2 updates ([#10388](https://github.com/mdn/yari/issues/10388)) ([fd50495](https://github.com/mdn/yari/commit/fd5049509319fae83e9361aa05f56e3f4bb46711))
* **deps:** bump web-specs from 2.76.0 to 2.77.0 ([#10393](https://github.com/mdn/yari/issues/10393)) ([1b91378](https://github.com/mdn/yari/commit/1b913780596f9d59177fb27f1df66680f5c7b2bf))
* **macros/CSSRef:** add media queries printing guide ([#10386](https://github.com/mdn/yari/issues/10386)) ([7034c60](https://github.com/mdn/yari/commit/7034c60ce418ec0e3bb2650621a61eb98453be67))
* **macros/CSSSyntax:** add zh-CN translation ([#10275](https://github.com/mdn/yari/issues/10275)) ([402a365](https://github.com/mdn/yari/commit/402a3659aeebce6ed90d90c0e602a76191256715))
* **macros/secureContext_inline:** replace notecard with badge ([#10214](https://github.com/mdn/yari/issues/10214)) ([285b449](https://github.com/mdn/yari/commit/285b4493ee836a7393e8f90627959a4e7e4bdca8))
* **workflows:** use default runners ([#10387](https://github.com/mdn/yari/issues/10387)) ([82a01fa](https://github.com/mdn/yari/commit/82a01fa410e4244b3908b23d88d9fd0ea1d22d54))

## [2.38.4](https://github.com/mdn/yari/compare/v2.38.3...v2.38.4) (2024-01-22)


### Bug Fixes

* **baseline:** hide status from async-clipboard subfeatures ([#10345](https://github.com/mdn/yari/issues/10345)) ([f1eb599](https://github.com/mdn/yari/commit/f1eb599f4bf5332ac312f4b7a234f4067e9c6aac))
* **history:** show outline on focus-visible ([#10343](https://github.com/mdn/yari/issues/10343)) ([c658fd6](https://github.com/mdn/yari/commit/c658fd6198846f9c9d902fcfc1d0a25e8f1d12cb))
* **playground:** only show for js,css,html ([#10338](https://github.com/mdn/yari/issues/10338)) ([f7144aa](https://github.com/mdn/yari/commit/f7144aab81709f31e05558978c5c8dbff68f572b))


### Miscellaneous

* **deps-dev:** bump @playwright/test from 1.40.1 to 1.41.0 ([#10331](https://github.com/mdn/yari/issues/10331)) ([5af3a5b](https://github.com/mdn/yari/commit/5af3a5be05191082d9c71685d79a7ee2e57a1e6a))
* **deps-dev:** bump @playwright/test from 1.41.0 to 1.41.1 ([#10361](https://github.com/mdn/yari/issues/10361)) ([e07a25c](https://github.com/mdn/yari/commit/e07a25c3f1afd4169facd163dda464acb8d80fde))
* **deps-dev:** bump @swc/core from 1.3.103 to 1.3.104 ([#10334](https://github.com/mdn/yari/issues/10334)) ([d91fe5b](https://github.com/mdn/yari/commit/d91fe5ba3874f3b8cce640046d1aa7e197a42226))
* **deps-dev:** bump @swc/core from 1.3.104 to 1.3.105 ([#10358](https://github.com/mdn/yari/issues/10358)) ([18f095c](https://github.com/mdn/yari/commit/18f095c195929a04ad9339d1da8a8b2f91b9d95f))
* **deps-dev:** bump css-loader from 6.9.0 to 6.9.1 ([#10347](https://github.com/mdn/yari/issues/10347)) ([9e7d950](https://github.com/mdn/yari/commit/9e7d95005e407acc6164262fc8693f4a1eeba250))
* **deps-dev:** bump css-minimizer-webpack-plugin from 5.0.1 to 6.0.0 ([#10340](https://github.com/mdn/yari/issues/10340)) ([9772d1b](https://github.com/mdn/yari/commit/9772d1b0d92b9e4453be5351903be0da073a18ae))
* **deps-dev:** bump eslint-plugin-unicorn from 49.0.0 to 50.0.1 ([#10217](https://github.com/mdn/yari/issues/10217)) ([ab19458](https://github.com/mdn/yari/commit/ab1945880be6b2ded7dd884f120654c8eb5dab4b))
* **deps-dev:** bump flake8 from 6.1.0 to 7.0.0 in /deployer ([#10325](https://github.com/mdn/yari/issues/10325)) ([4939357](https://github.com/mdn/yari/commit/49393574bbcd6746cc6fa4d9c0457caa7a9f66d7))
* **deps-dev:** bump jsdom from 23.2.0 to 24.0.0 ([#10357](https://github.com/mdn/yari/issues/10357)) ([fe5a032](https://github.com/mdn/yari/commit/fe5a032e0c4edc908aa60f9243119ad856a9c130))
* **deps-dev:** bump postcss-loader from 7.3.4 to 8.0.0 ([#10332](https://github.com/mdn/yari/issues/10332)) ([7553f38](https://github.com/mdn/yari/commit/7553f38e3ca015ecb4c5b48372f3186f0cf25acd))
* **deps-dev:** bump prettier from 3.1.1 to 3.2.4 ([#10333](https://github.com/mdn/yari/issues/10333)) ([f6bf57d](https://github.com/mdn/yari/commit/f6bf57d6778824177aacd8cbce0e67b042d0e56b))
* **deps-dev:** bump react-router-dom from 6.21.2 to 6.21.3 ([#10349](https://github.com/mdn/yari/issues/10349)) ([bdc9602](https://github.com/mdn/yari/commit/bdc960246b4e2768be676b2676797791fc5bf5f6))
* **deps-dev:** bump sass from 1.69.7 to 1.70.0 ([#10341](https://github.com/mdn/yari/issues/10341)) ([e7a7528](https://github.com/mdn/yari/commit/e7a75282a5fb7968085a46f217882c7df3eeaaf3))
* **deps-dev:** bump sass-loader from 13.3.3 to 14.0.0 ([#10327](https://github.com/mdn/yari/issues/10327)) ([2123098](https://github.com/mdn/yari/commit/2123098c1b7e86d7821780cf43b6cc18b1eb8528))
* **deps-dev:** bump style-dictionary from 3.9.1 to 3.9.2 ([#10342](https://github.com/mdn/yari/issues/10342)) ([7bb1681](https://github.com/mdn/yari/commit/7bb168180156b8c9f55575de7a8829a82de915dc))
* **deps-dev:** bump ts-jest from 29.1.1 to 29.1.2 ([#10354](https://github.com/mdn/yari/issues/10354)) ([374d73c](https://github.com/mdn/yari/commit/374d73caddf76704e0c12f3f377fcd18de7a10a0))
* **deps:** bump @mdn/browser-compat-data from 5.5.6 to 5.5.7 ([#10360](https://github.com/mdn/yari/issues/10360)) ([78b6215](https://github.com/mdn/yari/commit/78b62153acb7148dd0ff2ffc6b4c61c57e173c76))
* **deps:** bump dotenv from 16.3.1 to 16.3.2 ([#10356](https://github.com/mdn/yari/issues/10356)) ([0fa6b6c](https://github.com/mdn/yari/commit/0fa6b6c8bf1bc214b1a75e8d65b7399ff107058d))
* **deps:** bump file-type from 18.7.0 to 19.0.0 ([#10282](https://github.com/mdn/yari/issues/10282)) ([bb838e6](https://github.com/mdn/yari/commit/bb838e6f99a471c04fb2623245bb4978dcaceff7))
* **deps:** bump mdn-data from 2.3.4 to 2.3.5 ([#10355](https://github.com/mdn/yari/issues/10355)) ([98c014d](https://github.com/mdn/yari/commit/98c014dfce75175fbaf6162ae3561ce96b01ae48))
* **deps:** bump openai from 4.24.7 to 4.25.0 ([#10359](https://github.com/mdn/yari/issues/10359)) ([d55b32f](https://github.com/mdn/yari/commit/d55b32fc01511aeadf68bec17528af2ee9c8862a))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10362](https://github.com/mdn/yari/issues/10362)) ([2caccc2](https://github.com/mdn/yari/commit/2caccc2ddbdd8208e27bff318aab3c33bae1c45a))
* **deps:** bump the sentry group with 2 updates ([#10353](https://github.com/mdn/yari/issues/10353)) ([8cd6012](https://github.com/mdn/yari/commit/8cd6012b18ca8f3f5637737da2692bc02576ead2))
* **macros/CSSRef:** update zh-CN translation ([#10229](https://github.com/mdn/yari/issues/10229)) ([44178d6](https://github.com/mdn/yari/commit/44178d6ed3486be24a8eba570365919483139389))

## [2.38.3](https://github.com/mdn/yari/compare/v2.38.2...v2.38.3) (2024-01-15)


### Bug Fixes

* **macro:** update CSSRef macro ([#10303](https://github.com/mdn/yari/issues/10303)) ([5572142](https://github.com/mdn/yari/commit/5572142be83bffd3dffc7d81704ed0d86ec5cb4d))
* **pong:** gcp sends gb cc rather than uk ([#10286](https://github.com/mdn/yari/issues/10286)) ([d65f8d0](https://github.com/mdn/yari/commit/d65f8d0dfc8b1431f4452741aca0a6945a7b1285))


### Miscellaneous

* **deps-dev:** bump @babel/core from 7.23.6 to 7.23.7 ([#10255](https://github.com/mdn/yari/issues/10255)) ([06b8410](https://github.com/mdn/yari/commit/06b841016bb2df1f2d804ef1abcd21227d2a59dc))
* **deps-dev:** bump @babel/preset-env from 7.23.6 to 7.23.7 ([#10254](https://github.com/mdn/yari/issues/10254)) ([9867a4a](https://github.com/mdn/yari/commit/9867a4adc35d30b827b0cbfdddca89ceaac0b1aa))
* **deps-dev:** bump @babel/preset-env from 7.23.7 to 7.23.8 ([#10292](https://github.com/mdn/yari/issues/10292)) ([54c242d](https://github.com/mdn/yari/commit/54c242d59a2b253a8e758f3476568b6ded95fa67))
* **deps-dev:** bump @supabase/supabase-js from 2.39.1 to 2.39.2 ([#10258](https://github.com/mdn/yari/issues/10258)) ([f8770d0](https://github.com/mdn/yari/commit/f8770d0c2c294703544b199984a6904797c3162c))
* **deps-dev:** bump @supabase/supabase-js from 2.39.2 to 2.39.3 ([#10311](https://github.com/mdn/yari/issues/10311)) ([3a1906f](https://github.com/mdn/yari/commit/3a1906f6d6f45c649d568b1d86516c5f72aeb8a3))
* **deps-dev:** bump @swc/core from 1.3.101 to 1.3.102 ([#10253](https://github.com/mdn/yari/issues/10253)) ([0eff5c1](https://github.com/mdn/yari/commit/0eff5c11ee15c9dff042116471a4981b17d998bb))
* **deps-dev:** bump @swc/core from 1.3.102 to 1.3.103 ([#10319](https://github.com/mdn/yari/issues/10319)) ([c0fc334](https://github.com/mdn/yari/commit/c0fc33409ef304ba6d29f4159dd538970e8bb272))
* **deps-dev:** bump css-loader from 6.8.1 to 6.9.0 ([#10296](https://github.com/mdn/yari/issues/10296)) ([c7d6903](https://github.com/mdn/yari/commit/c7d6903416b317feacc47ba90980a3c9f97e4d04))
* **deps-dev:** bump eslint-plugin-jest from 27.6.0 to 27.6.1 ([#10260](https://github.com/mdn/yari/issues/10260)) ([bda844f](https://github.com/mdn/yari/commit/bda844f7dd745f7e3ac15736c3c884fc26507464))
* **deps-dev:** bump eslint-plugin-jest from 27.6.1 to 27.6.2 ([#10301](https://github.com/mdn/yari/issues/10301)) ([89b21af](https://github.com/mdn/yari/commit/89b21af95f3a3fd0f5caf2bb899f358b8b8143b2))
* **deps-dev:** bump eslint-plugin-jest from 27.6.2 to 27.6.3 ([#10323](https://github.com/mdn/yari/issues/10323)) ([a6a3df4](https://github.com/mdn/yari/commit/a6a3df49178b8f6a07c2fae94e434fe521dddd04))
* **deps-dev:** bump eslint-plugin-n from 16.4.0 to 16.5.0 ([#10208](https://github.com/mdn/yari/issues/10208)) ([71f358a](https://github.com/mdn/yari/commit/71f358a0cf7a88beff95eb2d58f393fb1a31b150))
* **deps-dev:** bump eslint-plugin-n from 16.5.0 to 16.6.0 ([#10249](https://github.com/mdn/yari/issues/10249)) ([0be3709](https://github.com/mdn/yari/commit/0be3709708aab3079f37fc314fb9b70c9b4b1b3d))
* **deps-dev:** bump eslint-plugin-n from 16.6.0 to 16.6.1 ([#10259](https://github.com/mdn/yari/issues/10259)) ([7e9342e](https://github.com/mdn/yari/commit/7e9342eb7f87c7e9e4a7dfb51efad07db40a81c0))
* **deps-dev:** bump eslint-plugin-n from 16.6.1 to 16.6.2 ([#10288](https://github.com/mdn/yari/issues/10288)) ([e0ee14f](https://github.com/mdn/yari/commit/e0ee14f2f42f4a62c70cc723bb8cb6e0de201ec7))
* **deps-dev:** bump html-validate from 8.7.4 to 8.8.0 ([#10233](https://github.com/mdn/yari/issues/10233)) ([6c11359](https://github.com/mdn/yari/commit/6c11359f5b70a42e09544ef4f543943865f0e544))
* **deps-dev:** bump html-validate from 8.8.0 to 8.9.0 ([#10284](https://github.com/mdn/yari/issues/10284)) ([b2057f3](https://github.com/mdn/yari/commit/b2057f3163891905b72d5539c39161a3aff1177e))
* **deps-dev:** bump html-validate from 8.9.0 to 8.9.1 ([#10298](https://github.com/mdn/yari/issues/10298)) ([86b99a0](https://github.com/mdn/yari/commit/86b99a03989fb431719b3d526deb603d6e5aa97e))
* **deps-dev:** bump html-webpack-plugin from 5.5.4 to 5.6.0 ([#10209](https://github.com/mdn/yari/issues/10209)) ([432a25e](https://github.com/mdn/yari/commit/432a25e3724f1ea8dbde6ee942ce322ca38b60a2))
* **deps-dev:** bump jsdom from 23.0.1 to 23.2.0 ([#10281](https://github.com/mdn/yari/issues/10281)) ([b9a5e06](https://github.com/mdn/yari/commit/b9a5e063dce902ebd67eeda54bbdb01e9421329f))
* **deps-dev:** bump mdast-util-to-hast from 13.0.2 to 13.1.0 ([#10309](https://github.com/mdn/yari/issues/10309)) ([5376a56](https://github.com/mdn/yari/commit/5376a5683ea632fe5f33bcb247d34240b3e56f71))
* **deps-dev:** bump mini-css-extract-plugin from 2.7.6 to 2.7.7 ([#10306](https://github.com/mdn/yari/issues/10306)) ([488392a](https://github.com/mdn/yari/commit/488392a7b9746bee56194c7c756c49859464925b))
* **deps-dev:** bump postcss from 8.4.32 to 8.4.33 ([#10272](https://github.com/mdn/yari/issues/10272)) ([6b54c60](https://github.com/mdn/yari/commit/6b54c603da801cd0abbef4cbdf475084aa146960))
* **deps-dev:** bump postcss-loader from 7.3.3 to 7.3.4 ([#10237](https://github.com/mdn/yari/issues/10237)) ([86775e7](https://github.com/mdn/yari/commit/86775e708bdc973dc4dac79253e32a728b9440db))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.7 to 2.4.8 ([#10236](https://github.com/mdn/yari/issues/10236)) ([a545511](https://github.com/mdn/yari/commit/a545511b8c4b101ab6690166cd35bfbef75d8f2e))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.8 to 2.4.9 ([#10271](https://github.com/mdn/yari/issues/10271)) ([938b380](https://github.com/mdn/yari/commit/938b380028647835b1be07fa675a043282877a1e))
* **deps-dev:** bump react-router-dom from 6.21.0 to 6.21.1 ([#10222](https://github.com/mdn/yari/issues/10222)) ([18942b9](https://github.com/mdn/yari/commit/18942b9905ab306e8c3616f6672ff1d9009a13ba))
* **deps-dev:** bump react-router-dom from 6.21.1 to 6.21.2 ([#10314](https://github.com/mdn/yari/issues/10314)) ([3a864b9](https://github.com/mdn/yari/commit/3a864b9b5b33557385cf0e3e4770eee37cca6062))
* **deps-dev:** bump sass from 1.69.5 to 1.69.6 ([#10248](https://github.com/mdn/yari/issues/10248)) ([9903439](https://github.com/mdn/yari/commit/9903439804fcb38ffc24f0585830d1e5f69cebd6))
* **deps-dev:** bump sass from 1.69.6 to 1.69.7 ([#10265](https://github.com/mdn/yari/issues/10265)) ([9872434](https://github.com/mdn/yari/commit/98724341b689690466949fa07b4d79c95af6c2be))
* **deps-dev:** bump sass-loader from 13.3.2 to 13.3.3 ([#10230](https://github.com/mdn/yari/issues/10230)) ([9093877](https://github.com/mdn/yari/commit/909387748943476aa5d7a24bbfa2120be2ec5a1d))
* **deps-dev:** bump source-map-loader from 4.0.1 to 4.0.2 ([#10240](https://github.com/mdn/yari/issues/10240)) ([9be8081](https://github.com/mdn/yari/commit/9be808105ee84ae73d4c73efcb63e6708a953a12))
* **deps-dev:** bump style-loader from 3.3.3 to 3.3.4 ([#10295](https://github.com/mdn/yari/issues/10295)) ([8df8249](https://github.com/mdn/yari/commit/8df8249d61a5143a052b3ea7d95135f4915d108b))
* **deps-dev:** bump tailwindcss from 3.3.7 to 3.4.0 ([#10212](https://github.com/mdn/yari/issues/10212)) ([8222708](https://github.com/mdn/yari/commit/82227080b4296ba62191a7fae425e2c41c4436a2))
* **deps-dev:** bump tailwindcss from 3.4.0 to 3.4.1 ([#10283](https://github.com/mdn/yari/issues/10283)) ([8532390](https://github.com/mdn/yari/commit/8532390ac8761e67505550df69c5574080d08967))
* **deps-dev:** bump terser-webpack-plugin from 5.3.9 to 5.3.10 ([#10245](https://github.com/mdn/yari/issues/10245)) ([fb4bc6f](https://github.com/mdn/yari/commit/fb4bc6f2bec9287b97a0b04f806cfc1affc278c8))
* **deps-dev:** bump the types group with 1 update ([#10242](https://github.com/mdn/yari/issues/10242)) ([bc94d85](https://github.com/mdn/yari/commit/bc94d85a654be47567fae8a61ce9f2c9c3e33602))
* **deps-dev:** bump the types group with 1 update ([#10280](https://github.com/mdn/yari/issues/10280)) ([b7c4ddd](https://github.com/mdn/yari/commit/b7c4ddd4ff0e388e922f887a7b9c8143ad7c3002))
* **deps-dev:** bump the types group with 1 update ([#10316](https://github.com/mdn/yari/issues/10316)) ([8fc1359](https://github.com/mdn/yari/commit/8fc1359aa1d75a99bca947825d3db22aaec6dbc5))
* **deps:** bump @mdn/browser-compat-data from 5.5.0 to 5.5.1 ([#10211](https://github.com/mdn/yari/issues/10211)) ([7bf2d1b](https://github.com/mdn/yari/commit/7bf2d1b9ea097bdafae49436d54a9302c881f298))
* **deps:** bump @mdn/browser-compat-data from 5.5.1 to 5.5.2 ([#10227](https://github.com/mdn/yari/issues/10227)) ([563d3e6](https://github.com/mdn/yari/commit/563d3e6d7b30f7adcc5868bb8edfa4d414d64a73))
* **deps:** bump @mdn/browser-compat-data from 5.5.2 to 5.5.3 ([#10252](https://github.com/mdn/yari/issues/10252)) ([1b7234f](https://github.com/mdn/yari/commit/1b7234fbb1cbc2a9c746c9428aeafcc0c4506a73))
* **deps:** bump @mdn/browser-compat-data from 5.5.3 to 5.5.4 ([#10263](https://github.com/mdn/yari/issues/10263)) ([4ef40c6](https://github.com/mdn/yari/commit/4ef40c6cc8de6d1bb46d88033220ca40c1ad99e4))
* **deps:** bump @mdn/browser-compat-data from 5.5.4 to 5.5.5 ([#10300](https://github.com/mdn/yari/issues/10300)) ([1c07e74](https://github.com/mdn/yari/commit/1c07e74aea2a41651023e046320104c4fc50c1f9))
* **deps:** bump @mdn/browser-compat-data from 5.5.5 to 5.5.6 ([#10322](https://github.com/mdn/yari/issues/10322)) ([1584887](https://github.com/mdn/yari/commit/158488748d43b8532e95c77c39c50b2530a5660f))
* **deps:** bump @stripe/stripe-js from 2.2.1 to 2.2.2 ([#10200](https://github.com/mdn/yari/issues/10200)) ([417f3b4](https://github.com/mdn/yari/commit/417f3b41c1b988e449efdddf2de6d7f35e3a1df6))
* **deps:** bump @stripe/stripe-js from 2.2.2 to 2.3.0 ([#10290](https://github.com/mdn/yari/issues/10290)) ([681b0ee](https://github.com/mdn/yari/commit/681b0ee7f24b70cedc54543fab5d62991947e368))
* **deps:** bump @webref/css from 6.10.0 to 6.10.1 ([#10220](https://github.com/mdn/yari/issues/10220)) ([a8347b6](https://github.com/mdn/yari/commit/a8347b6557cd7683824e0621e4a2e542fcf9a3d7))
* **deps:** bump @webref/css from 6.10.1 to 6.10.2 ([#10302](https://github.com/mdn/yari/issues/10302)) ([6536270](https://github.com/mdn/yari/commit/653627037e2562ce50bb3de6b374aad2081fb152))
* **deps:** bump follow-redirects from 1.15.2 to 1.15.4 ([#10293](https://github.com/mdn/yari/issues/10293)) ([1a79c0c](https://github.com/mdn/yari/commit/1a79c0c3c5f934f7dec91ad51d36c1a61f55744f))
* **deps:** bump image-size from 1.0.2 to 1.1.0 ([#10247](https://github.com/mdn/yari/issues/10247)) ([863f4d4](https://github.com/mdn/yari/commit/863f4d4043e7a457373bde2fc37b65dbd384d29e))
* **deps:** bump image-size from 1.1.0 to 1.1.1 ([#10264](https://github.com/mdn/yari/issues/10264)) ([7a2bc60](https://github.com/mdn/yari/commit/7a2bc60f3eca9f463bcd962bc0afdc5d0316d8dc))
* **deps:** bump mdn-data from 2.3.0 to 2.3.2 ([#10246](https://github.com/mdn/yari/issues/10246)) ([fb40fef](https://github.com/mdn/yari/commit/fb40fef0fc64a9a9a89a648c9342f136684fa09e))
* **deps:** bump mdn-data from 2.3.2 to 2.3.3 ([#10289](https://github.com/mdn/yari/issues/10289)) ([9249b86](https://github.com/mdn/yari/commit/9249b86f10c24cf0fc8f5f28339c046f1060a598))
* **deps:** bump mdn-data from 2.3.3 to 2.3.4 ([#10318](https://github.com/mdn/yari/issues/10318)) ([459754c](https://github.com/mdn/yari/commit/459754c2a657c00d17fc65429586a44571d3ac86))
* **deps:** bump openai from 4.23.0 to 4.24.0 ([#10210](https://github.com/mdn/yari/issues/10210)) ([c16b73d](https://github.com/mdn/yari/commit/c16b73d068ff9f7adf325e294a8eec4045bd726c))
* **deps:** bump openai from 4.24.0 to 4.24.1 ([#10219](https://github.com/mdn/yari/issues/10219)) ([6e695c0](https://github.com/mdn/yari/commit/6e695c09f072715ff65c07475517e7d2cdfdb6c3))
* **deps:** bump openai from 4.24.1 to 4.24.2 ([#10291](https://github.com/mdn/yari/issues/10291)) ([5fac284](https://github.com/mdn/yari/commit/5fac2847957028563c58156caabe647ef31846e4))
* **deps:** bump openai from 4.24.2 to 4.24.3 ([#10308](https://github.com/mdn/yari/issues/10308)) ([e54751c](https://github.com/mdn/yari/commit/e54751c2f4d4c9fcedad54906924f577314c248d))
* **deps:** bump openai from 4.24.3 to 4.24.4 ([#10313](https://github.com/mdn/yari/issues/10313)) ([227fb65](https://github.com/mdn/yari/commit/227fb6539dfd8db11e24c0ad49dd952338e873ab))
* **deps:** bump openai from 4.24.4 to 4.24.7 ([#10321](https://github.com/mdn/yari/issues/10321)) ([06d75db](https://github.com/mdn/yari/commit/06d75db54b073d40b3b9ad650284a498b93b1301))
* **deps:** bump remark-rehype from 11.0.0 to 11.1.0 ([#10307](https://github.com/mdn/yari/issues/10307)) ([3318c7f](https://github.com/mdn/yari/commit/3318c7fc13886e5afbbcb79bc4f9d44b5ecfec45))
* **deps:** bump sse.js from 2.1.0 to 2.2.0 ([#10299](https://github.com/mdn/yari/issues/10299)) ([8da9563](https://github.com/mdn/yari/commit/8da956377d6b64520d8ddd4e39f03b969fcbff07))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10228](https://github.com/mdn/yari/issues/10228)) ([29cc085](https://github.com/mdn/yari/commit/29cc0855e786d6c52ccb940ffffff0de97429701))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10278](https://github.com/mdn/yari/issues/10278)) ([7f13c4e](https://github.com/mdn/yari/commit/7f13c4e7a77bb9303fc8f72c6b606f4a5506825b))
* **deps:** bump the dependencies group in /testing/integration with 2 updates ([#10250](https://github.com/mdn/yari/issues/10250)) ([14c71fd](https://github.com/mdn/yari/commit/14c71fd1d61dc0c0cc9411c987dd98f87a757d28))
* **deps:** bump the sentry group with 2 updates ([#10207](https://github.com/mdn/yari/issues/10207)) ([11c81e7](https://github.com/mdn/yari/commit/11c81e75e726d8a87c183a12e07dcaadc29b5d9f))
* **deps:** bump the sentry group with 2 updates ([#10216](https://github.com/mdn/yari/issues/10216)) ([5d59c6b](https://github.com/mdn/yari/commit/5d59c6b3e367e0c3b2058d0294d825a5066d588d))
* **deps:** bump the sentry group with 2 updates ([#10218](https://github.com/mdn/yari/issues/10218)) ([4203e42](https://github.com/mdn/yari/commit/4203e426658b7c1934056f47781d9f00661c9c87))
* **deps:** bump the sentry group with 2 updates ([#10270](https://github.com/mdn/yari/issues/10270)) ([c9e12cf](https://github.com/mdn/yari/commit/c9e12cf5b95fb9ef3601f52b70fd5ea72508ccc1))
* **deps:** bump the sentry group with 2 updates ([#10305](https://github.com/mdn/yari/issues/10305)) ([64ac276](https://github.com/mdn/yari/commit/64ac276449262aa9813c3954e016b30278091267))
* **deps:** bump web-features from 0.5.0 to 0.5.1 ([#10294](https://github.com/mdn/yari/issues/10294)) ([a62cb27](https://github.com/mdn/yari/commit/a62cb2739821feb129f0d5b6f0c76edeaf3c680f))
* **deps:** bump web-specs from 2.75.1 to 2.76.0 ([#10232](https://github.com/mdn/yari/issues/10232)) ([3f56dde](https://github.com/mdn/yari/commit/3f56dde92c0999b35cfd43e02ad40d2805ac69a1))

## [2.38.2](https://github.com/mdn/yari/compare/v2.38.1...v2.38.2) (2023-12-19)


### Bug Fixes

* **ai-help:** avoid plainHTML for other locales ([#10206](https://github.com/mdn/yari/issues/10206)) ([fa38994](https://github.com/mdn/yari/commit/fa38994b16af3ece7523ac0e6e58b10884d95072))
* **ai-help:** use GPT-3.5 for free users ([#10205](https://github.com/mdn/yari/issues/10205)) ([23b78d9](https://github.com/mdn/yari/commit/23b78d9a001bb5a50e318cb1c02a3ff695392ebc))


### Miscellaneous

* **deps-dev:** bump @supabase/supabase-js from 2.39.0 to 2.39.1 ([#10201](https://github.com/mdn/yari/issues/10201)) ([cbe98fe](https://github.com/mdn/yari/commit/cbe98fe00720a7f01004ccbd2ba32c5cc6ff5216))
* **deps-dev:** bump @swc/core from 1.3.100 to 1.3.101 ([#10196](https://github.com/mdn/yari/issues/10196)) ([24e5d79](https://github.com/mdn/yari/commit/24e5d79c44fcd27d11000d4994161e3fd597a837))
* **deps-dev:** bump eslint from 8.55.0 to 8.56.0 ([#10195](https://github.com/mdn/yari/issues/10195)) ([f41d7a6](https://github.com/mdn/yari/commit/f41d7a608a61db9fd79e80791ee7de732f9bc203))
* **deps-dev:** bump eslint-plugin-import from 2.29.0 to 2.29.1 ([#10189](https://github.com/mdn/yari/issues/10189)) ([e7ed9fc](https://github.com/mdn/yari/commit/e7ed9fc91f22653f82a9edcb52350b776d1c47a8))
* **deps-dev:** bump tailwindcss from 3.3.6 to 3.3.7 ([#10202](https://github.com/mdn/yari/issues/10202)) ([9345064](https://github.com/mdn/yari/commit/9345064f6ad374d6002b5ced25b6a99f71a766b5))
* **deps-dev:** bump the dependencies group in /testing/integration with 1 update ([#10198](https://github.com/mdn/yari/issues/10198)) ([f91600b](https://github.com/mdn/yari/commit/f91600bfcb262a4b63d1fb2d143a3428d712cf3e))
* **deps-dev:** bump the types group with 1 update ([#10192](https://github.com/mdn/yari/issues/10192)) ([e48f570](https://github.com/mdn/yari/commit/e48f5700a9a787a174ec5dc758c47f4d4389a725))
* **deps:** bump @mdn/browser-compat-data from 5.4.5 to 5.5.0 ([#10193](https://github.com/mdn/yari/issues/10193)) ([ad64d39](https://github.com/mdn/yari/commit/ad64d391d36f4ae1cbbd13bea1e517d17800b803))
* **deps:** bump openai from 4.21.0 to 4.22.0 ([#10190](https://github.com/mdn/yari/issues/10190)) ([e81dedc](https://github.com/mdn/yari/commit/e81dedc1819e9cad504b761e45e1ee94c413f7a8))
* **deps:** bump openai from 4.22.0 to 4.23.0 ([#10194](https://github.com/mdn/yari/issues/10194)) ([0bc0169](https://github.com/mdn/yari/commit/0bc0169b4d6ab4b4ed563b80977595cbcacfda30))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10197](https://github.com/mdn/yari/issues/10197)) ([4913773](https://github.com/mdn/yari/commit/4913773d169151afaca73bf4cb66123c250c7fe5))
* **deps:** bump the sentry group with 2 updates ([#10188](https://github.com/mdn/yari/issues/10188)) ([2863745](https://github.com/mdn/yari/commit/2863745a8db5727b29e618f790f166d0850866ca))
* **deps:** bump web-features from 0.5.0-alpha.2 to 0.5.0 ([#10204](https://github.com/mdn/yari/issues/10204)) ([cae6fb7](https://github.com/mdn/yari/commit/cae6fb72b9b1e3989d2b37c602ab1149bd997b74))

## [2.38.1](https://github.com/mdn/yari/compare/v2.38.0...v2.38.1) (2023-12-14)


### Bug Fixes

* **macros/CSSSupport:** support nested @webref/css values ([#10183](https://github.com/mdn/yari/issues/10183)) ([b783aa9](https://github.com/mdn/yari/commit/b783aa99d3d503ab3e5da979078acd5e92e807c5))


### Miscellaneous

* **deps-dev:** bump prettier from 3.0.3 to 3.1.1 ([#10165](https://github.com/mdn/yari/issues/10165)) ([5c3841a](https://github.com/mdn/yari/commit/5c3841a5b6517a58dbf95ed2a8ca1f5f30a46538))
* **deps-dev:** bump react-router-dom from 6.20.1 to 6.21.0 ([#10182](https://github.com/mdn/yari/issues/10182)) ([1b9286d](https://github.com/mdn/yari/commit/1b9286df28b9385f602c38310c4efe4304bded35))
* **deps:** bump the sentry group with 2 updates ([#10180](https://github.com/mdn/yari/issues/10180)) ([8eda044](https://github.com/mdn/yari/commit/8eda044995f91c1a95fb001338f0126a5bd59ec9))
* **pong:** set forwardedip/useragent on click/view requests ([#10185](https://github.com/mdn/yari/issues/10185)) ([323197b](https://github.com/mdn/yari/commit/323197bfd1c179d9954f9fc9068be1d580cf9dde))

## [2.38.0](https://github.com/mdn/yari/compare/v2.37.1...v2.38.0) (2023-12-14)


### Features

* **ai-help:** release 2.0 ([#10155](https://github.com/mdn/yari/issues/10155)) ([427b2fc](https://github.com/mdn/yari/commit/427b2fc9915a692f331eb7b44ed2dc8f7824fadb))


### Bug Fixes

* **baseline:** update icons, add text to feedback link ([#10172](https://github.com/mdn/yari/issues/10172)) ([7b79d32](https://github.com/mdn/yari/commit/7b79d32d484bae3c8510537841d069b75a448d9d))


### Miscellaneous

* **deps-dev:** bump @babel/core from 7.23.5 to 7.23.6 ([#10169](https://github.com/mdn/yari/issues/10169)) ([faf1bf3](https://github.com/mdn/yari/commit/faf1bf34951779cb7c2c42c101f0d32c644ab2a4))
* **deps-dev:** bump @babel/preset-env from 7.23.5 to 7.23.6 ([#10171](https://github.com/mdn/yari/issues/10171)) ([ee298fb](https://github.com/mdn/yari/commit/ee298fb94ecd7f39434d37ddc0f9891b97a5a2a5))
* **deps-dev:** bump eslint-plugin-n from 16.3.1 to 16.4.0 ([#10160](https://github.com/mdn/yari/issues/10160)) ([45cdb04](https://github.com/mdn/yari/commit/45cdb04e1df8a7894d6b24e4d576ff9eac445b9d))
* **deps-dev:** bump html-validate from 8.7.3 to 8.7.4 ([#10162](https://github.com/mdn/yari/issues/10162)) ([f98383a](https://github.com/mdn/yari/commit/f98383a83bbc8a5712996251a0217d2f12bb2f61))
* **deps-dev:** bump stylelint-order from 6.0.3 to 6.0.4 ([#10163](https://github.com/mdn/yari/issues/10163)) ([6f3f6d8](https://github.com/mdn/yari/commit/6f3f6d8cb243e1189eb986ef5e2932fd81bcaedc))
* **deps-dev:** bump stylelint-scss from 5.3.1 to 5.3.2 ([#10166](https://github.com/mdn/yari/issues/10166)) ([596fbe3](https://github.com/mdn/yari/commit/596fbe3dd923e5d8b211b32aeca49474e94aba35))
* **deps-dev:** bump the types group with 1 update ([#10159](https://github.com/mdn/yari/issues/10159)) ([395b9e6](https://github.com/mdn/yari/commit/395b9e672457e6007770d06e81228aa1328d25f8))
* **deps-dev:** bump the types group with 1 update ([#10174](https://github.com/mdn/yari/issues/10174)) ([6c724d8](https://github.com/mdn/yari/commit/6c724d87efc4723c6e2846afca26325060820c90))
* **deps-dev:** bump ts-node from 10.9.1 to 10.9.2 ([#10161](https://github.com/mdn/yari/issues/10161)) ([bca6385](https://github.com/mdn/yari/commit/bca6385af7824ad110e8d8f497ecb3b1bca36b50))
* **deps:** bump @mdn/browser-compat-data from 5.4.4 to 5.4.5 ([#10164](https://github.com/mdn/yari/issues/10164)) ([c96758e](https://github.com/mdn/yari/commit/c96758eb6be506dac792ed8b4a9ca727717a5ae5))
* **deps:** bump @stripe/stripe-js from 2.2.0 to 2.2.1 ([#10170](https://github.com/mdn/yari/issues/10170)) ([a24ad91](https://github.com/mdn/yari/commit/a24ad915af8a88bcd843cde4167d4d7c07563fb3))
* **deps:** bump google-github-actions/setup-gcloud from 1 to 2 ([#10167](https://github.com/mdn/yari/issues/10167)) ([4043270](https://github.com/mdn/yari/commit/4043270e7ad804b0e3b927c4f61f538e1183d296))
* **deps:** bump openai from 4.20.1 to 4.21.0 ([#10176](https://github.com/mdn/yari/issues/10176)) ([cb4e277](https://github.com/mdn/yari/commit/cb4e27780566b9e511c876905318b459f777f755))
* **deps:** bump sse.js from 1.0.0 to 2.1.0 ([#10150](https://github.com/mdn/yari/issues/10150)) ([1f87eef](https://github.com/mdn/yari/commit/1f87eef364430503cd8e7632561b0ec4d3b01e84))
* **deps:** bump the dependencies group in /deployer with 1 update ([#10158](https://github.com/mdn/yari/issues/10158)) ([a0e23db](https://github.com/mdn/yari/commit/a0e23db72b8b8da6411e5790c2dd3b4909e874a6))
* **deps:** bump web-features from 0.5.0-alpha.1 to 0.5.0-alpha.2 ([#10175](https://github.com/mdn/yari/issues/10175)) ([7d924d3](https://github.com/mdn/yari/commit/7d924d3bb724a6ff8be7e59f38f2e7ec567364fc))
* **settings:** update Newsletter/Offline copy ([#10177](https://github.com/mdn/yari/issues/10177)) ([5dd7ea1](https://github.com/mdn/yari/commit/5dd7ea1b43cab6223e345eb043351538c2420257))

## [2.37.1](https://github.com/mdn/yari/compare/v2.37.0...v2.37.1) (2023-12-08)


### Bug Fixes

* **auth-container:** always show login/signup in row ([#10125](https://github.com/mdn/yari/issues/10125)) ([233bed6](https://github.com/mdn/yari/commit/233bed6bc9bfb633d73d6519d121d08b748b7be2))
* **css:** remove unused minmax function ([#10138](https://github.com/mdn/yari/issues/10138)) ([d8e84b5](https://github.com/mdn/yari/commit/d8e84b5bb069a3781800a1f6769a33ff3581e2b0))
* **workflows:** use Node.js version from .nvmrc file ([#10153](https://github.com/mdn/yari/issues/10153)) ([97405ae](https://github.com/mdn/yari/commit/97405ae42d0151faea6b6bfc73af1fc55fbebe5f))


### Miscellaneous

* **deps-dev:** bump html-webpack-plugin from 5.5.3 to 5.5.4 ([#10149](https://github.com/mdn/yari/issues/10149)) ([abaa08d](https://github.com/mdn/yari/commit/abaa08dd85b4d17633e110fd00faa9f8c4387f91))
* **deps-dev:** bump style-dictionary from 3.9.0 to 3.9.1 ([#10151](https://github.com/mdn/yari/issues/10151)) ([012c696](https://github.com/mdn/yari/commit/012c6965fd5e6f349a5a4b7cdbcf36e5c76241b4))
* **deps-dev:** bump the types group with 1 update ([#10141](https://github.com/mdn/yari/issues/10141)) ([3f6a506](https://github.com/mdn/yari/commit/3f6a506cf24ed72ceca016295a74013e90d9891c))
* **deps-dev:** bump typescript from 5.3.2 to 5.3.3 in /client/pwa ([#10148](https://github.com/mdn/yari/issues/10148)) ([4de571e](https://github.com/mdn/yari/commit/4de571eacd725a585196eddacfdc87bfd0f9fe0f))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.31 to 2.7.32 in /client/pwa ([#10135](https://github.com/mdn/yari/issues/10135)) ([1c0a83b](https://github.com/mdn/yari/commit/1c0a83b2f83e6ba27406c2070b3aa780e441f87e))
* **deps:** bump @codemirror/state from 6.3.2 to 6.3.3 ([#10142](https://github.com/mdn/yari/issues/10142)) ([88dd100](https://github.com/mdn/yari/commit/88dd100a5b570a5a62dac476b9da6dc23c8210c9))
* **deps:** bump @webref/css from 6.9.2 to 6.10.0 ([#10146](https://github.com/mdn/yari/issues/10146)) ([480edc5](https://github.com/mdn/yari/commit/480edc598def290a7f12de6a812e07f01b026ade))
* **deps:** bump actions/setup-python from 4 to 5 ([#10144](https://github.com/mdn/yari/issues/10144)) ([b19c7da](https://github.com/mdn/yari/commit/b19c7dacc4b8da4fe18162d192b3ddbfccc2d286))
* **deps:** bump the sentry group with 2 updates ([#10145](https://github.com/mdn/yari/issues/10145)) ([379b281](https://github.com/mdn/yari/commit/379b2818b9360b971c800682d352978b63329b94))

## [2.37.0](https://github.com/mdn/yari/compare/v2.36.1...v2.37.0) (2023-12-05)


### Features

* **baseline:** update widget to reflect new definition ([#10128](https://github.com/mdn/yari/issues/10128)) ([8372e0b](https://github.com/mdn/yari/commit/8372e0b94c7de22ebfe467890c64e445bd84c3f3))

## [2.36.1](https://github.com/mdn/yari/compare/v2.36.0...v2.36.1) (2023-12-05)


### Bug Fixes

* **baseline:** bcd link not localized ([#10124](https://github.com/mdn/yari/issues/10124)) ([0761a86](https://github.com/mdn/yari/commit/0761a86627c713c15fea4b3df19f2ca61c2c46e4))
* **macros/EmbedLiveSample:** un-deprecate the 6th parameter (allowed features) ([#10106](https://github.com/mdn/yari/issues/10106)) ([012f5e4](https://github.com/mdn/yari/commit/012f5e433a6d3e0b81261cf53d351915eb5107b8))
* **macros/GamesSidebar:** update WebVR -&gt; WebXR in string map ([#10126](https://github.com/mdn/yari/issues/10126)) ([0670f6a](https://github.com/mdn/yari/commit/0670f6a7677bb1ceaeaa69a4d8c48472af3717cc))


### Miscellaneous

* **advertising:** update form link ([#10109](https://github.com/mdn/yari/issues/10109)) ([02af588](https://github.com/mdn/yari/commit/02af588c5865a075369d81141b8eb9ad7b58482c))
* **deps-dev:** bump browserslist from 4.22.1 to 4.22.2 ([#10115](https://github.com/mdn/yari/issues/10115)) ([8221634](https://github.com/mdn/yari/commit/82216341c2e38b6b03ec78df5cf74ef3cff699fa))
* **deps-dev:** bump eslint from 8.54.0 to 8.55.0 ([#10116](https://github.com/mdn/yari/issues/10116)) ([8ab0321](https://github.com/mdn/yari/commit/8ab0321bfefb70db132bb31cfc877284cba6ffc6))
* **deps-dev:** bump postcss from 8.4.31 to 8.4.32 ([#10119](https://github.com/mdn/yari/issues/10119)) ([051dcaf](https://github.com/mdn/yari/commit/051dcaf80cbe6ddb4007d2c4633fe95d7fbdb6b0))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.6 to 2.4.7 ([#10117](https://github.com/mdn/yari/issues/10117)) ([6780a5a](https://github.com/mdn/yari/commit/6780a5a524739548be1d227e74b80452d53f9253))
* **deps-dev:** bump react-router-dom from 6.20.0 to 6.20.1 ([#10120](https://github.com/mdn/yari/issues/10120)) ([6e6ab9e](https://github.com/mdn/yari/commit/6e6ab9e2dbd3d4201132180e9ec35d50cfee169b))
* **deps-dev:** bump tailwindcss from 3.3.5 to 3.3.6 ([#10133](https://github.com/mdn/yari/issues/10133)) ([bfb7e6e](https://github.com/mdn/yari/commit/bfb7e6eb84eb0a59cc696ca7e7e22eab155eeebc))
* **deps-dev:** bump the types group with 1 update ([#10113](https://github.com/mdn/yari/issues/10113)) ([68116f9](https://github.com/mdn/yari/commit/68116f940edd5a01667087e54f8a2d1ebc8c4511))
* **deps-dev:** bump the types group with 1 update ([#10132](https://github.com/mdn/yari/issues/10132)) ([8eca5fe](https://github.com/mdn/yari/commit/8eca5fe429249906d6250327a4eb86c92b44e769))
* **deps:** bump @mdn/browser-compat-data from 5.4.2 to 5.4.3 ([#10121](https://github.com/mdn/yari/issues/10121)) ([42d1752](https://github.com/mdn/yari/commit/42d17520d2fee32059bc3516ce4ddd5ab0e6a344))
* **deps:** bump @mdn/browser-compat-data from 5.4.3 to 5.4.4 ([#10134](https://github.com/mdn/yari/issues/10134)) ([18d9592](https://github.com/mdn/yari/commit/18d95921979099f2b67b4d5fd8da84165426fbbc))
* **deps:** bump @webref/css from 6.7.1 to 6.9.2 ([#10110](https://github.com/mdn/yari/issues/10110)) ([300e93e](https://github.com/mdn/yari/commit/300e93eb908684dfbcb4e3354bc8b2558eacf046))
* **deps:** bump the dependencies group in /deployer with 1 update ([#10118](https://github.com/mdn/yari/issues/10118)) ([fd6147c](https://github.com/mdn/yari/commit/fd6147c71d1263b36ef2e37412668d994c166409))
* **deps:** bump the sentry group with 2 updates ([#10131](https://github.com/mdn/yari/issues/10131)) ([21e2b32](https://github.com/mdn/yari/commit/21e2b32ded390b2a9001d825e0fe52485f57a3ae))
* **deps:** bump web-specs from 2.74.1 to 2.75.1 ([#10108](https://github.com/mdn/yari/issues/10108)) ([a72963c](https://github.com/mdn/yari/commit/a72963cd842b55fa3a9f1a8d38424796f43dba8d))
* **macros/CSSRef:** update "Using CSS math functions" slug ([#10112](https://github.com/mdn/yari/issues/10112)) ([d417c47](https://github.com/mdn/yari/commit/d417c478ab8832ec91698205182b9a98e155ff7e))
* **macros/LearnSidebar:** update zh-CN translation ([#10100](https://github.com/mdn/yari/issues/10100)) ([8a3f78a](https://github.com/mdn/yari/commit/8a3f78aa0eb7d283f04508caafdfe020c3cee0f0))
* **placement:** switch to BSA ([#10011](https://github.com/mdn/yari/issues/10011)) ([ea98829](https://github.com/mdn/yari/commit/ea98829430afe16a445b49ce2ef937afd869a8af))
* **web-features:** pin package version ([#10123](https://github.com/mdn/yari/issues/10123)) ([aab3559](https://github.com/mdn/yari/commit/aab3559f1610d500890f711f14bb562f5c1ccb38))

## [2.36.0](https://github.com/mdn/yari/compare/v2.35.1...v2.36.0) (2023-11-30)


### Features

* **menu:** highlight active items ([#9940](https://github.com/mdn/yari/issues/9940)) ([ecc9f54](https://github.com/mdn/yari/commit/ecc9f54f5efaacb0d635003c2546771289311edb))


### Enhancements

* **kumascript:** make `smartLink()`'s content parameter optional ([#9847](https://github.com/mdn/yari/issues/9847)) ([3ebd396](https://github.com/mdn/yari/commit/3ebd396e41b914bd6fc73384fc146ec4dcf3a910))


### Miscellaneous

* **ai-help:** include question number in metrics ([#10096](https://github.com/mdn/yari/issues/10096)) ([9657ea9](https://github.com/mdn/yari/commit/9657ea919fbbe1445147cae3d1902d24ce4413c1))
* **blog:** enable LFS for mdn-studio ([#10027](https://github.com/mdn/yari/issues/10027)) ([25a50d7](https://github.com/mdn/yari/commit/25a50d7bed6294352c7054e33be68f407b223869))
* **deps-dev:** bump @babel/core from 7.23.3 to 7.23.5 ([#10092](https://github.com/mdn/yari/issues/10092)) ([54e8da9](https://github.com/mdn/yari/commit/54e8da9c86f5472bd6609a643fcac857afd40726))
* **deps-dev:** bump @babel/preset-env from 7.23.3 to 7.23.5 ([#10091](https://github.com/mdn/yari/issues/10091)) ([398c21f](https://github.com/mdn/yari/commit/398c21faeccb7aac7feb60469ea1bcbe1ba0f769))
* **deps-dev:** bump @playwright/test from 1.40.0 to 1.40.1 ([#10094](https://github.com/mdn/yari/issues/10094)) ([b77edeb](https://github.com/mdn/yari/commit/b77edeb9697c6b64a3093d1eceef626d1fab5a73))
* **deps-dev:** bump @supabase/supabase-js from 2.38.4 to 2.38.5 ([#10055](https://github.com/mdn/yari/issues/10055)) ([53298c4](https://github.com/mdn/yari/commit/53298c441bcb10170913378b56e833f0649c15af))
* **deps-dev:** bump @supabase/supabase-js from 2.38.5 to 2.39.0 ([#10086](https://github.com/mdn/yari/issues/10086)) ([3e0f4d2](https://github.com/mdn/yari/commit/3e0f4d2ccb8db951d8b7acb079f94ad7e7b804b4))
* **deps-dev:** bump @swc/core from 1.3.96 to 1.3.99 ([#10061](https://github.com/mdn/yari/issues/10061)) ([d4b5451](https://github.com/mdn/yari/commit/d4b54515e93c0736f47eaca9f3d7f66cc9ec4f2e))
* **deps-dev:** bump @swc/core from 1.3.99 to 1.3.100 ([#10103](https://github.com/mdn/yari/issues/10103)) ([36011cd](https://github.com/mdn/yari/commit/36011cd05261ecb803f97bbe93aec2291cc9c5da))
* **deps-dev:** bump html-validate from 8.7.2 to 8.7.3 ([#10076](https://github.com/mdn/yari/issues/10076)) ([223e2a0](https://github.com/mdn/yari/commit/223e2a0c9b8a4162868352588d805af6f25167a7))
* **deps-dev:** bump jsdom from 22.1.0 to 23.0.1 ([#10102](https://github.com/mdn/yari/issues/10102)) ([b68ada2](https://github.com/mdn/yari/commit/b68ada212153e357a60070ba928a25fef4a52f2b))
* **deps-dev:** bump react-router-dom from 6.19.0 to 6.20.0 ([#10073](https://github.com/mdn/yari/issues/10073)) ([37b108f](https://github.com/mdn/yari/commit/37b108fff67987e442ba7958874590ecff275172))
* **deps-dev:** bump stylelint-prettier from 4.0.2 to 4.1.0 ([#10078](https://github.com/mdn/yari/issues/10078)) ([c28219e](https://github.com/mdn/yari/commit/c28219eaa96a4fceaba5c96661307b0de91032a4))
* **deps-dev:** bump the types group with 1 update ([#10085](https://github.com/mdn/yari/issues/10085)) ([7d58067](https://github.com/mdn/yari/commit/7d580672e71593d37d4239b75f269dd68ab89290))
* **deps-dev:** bump the types group with 3 updates ([#10067](https://github.com/mdn/yari/issues/10067)) ([93692ba](https://github.com/mdn/yari/commit/93692ba2a2778808e6ae306421d8b3ff973035f8))
* **deps-dev:** bump the types group with 4 updates ([#10054](https://github.com/mdn/yari/issues/10054)) ([46f0e37](https://github.com/mdn/yari/commit/46f0e371f57b8644a25822399505bbf1010c6b56))
* **deps-dev:** bump typescript from 5.2.2 to 5.3.2 in /client/pwa ([#10062](https://github.com/mdn/yari/issues/10062)) ([7c040a5](https://github.com/mdn/yari/commit/7c040a5a8f0c11731f21f30260b5dcc998323657))
* **deps:** bump @codemirror/lang-html from 6.4.6 to 6.4.7 ([#10087](https://github.com/mdn/yari/issues/10087)) ([982b73e](https://github.com/mdn/yari/commit/982b73e086271c26c3a244f6ef548af58af6e681))
* **deps:** bump @codemirror/state from 6.3.1 to 6.3.2 ([#10080](https://github.com/mdn/yari/issues/10080)) ([69f8fef](https://github.com/mdn/yari/commit/69f8fef361417c6f3f49c5b98d252a1ca31a0c60))
* **deps:** bump @mdn/bcd-utils-api from 0.0.4 to 0.0.5 ([#10059](https://github.com/mdn/yari/issues/10059)) ([4dbf2b8](https://github.com/mdn/yari/commit/4dbf2b8c6608087a4b96f19eb11ba120ff5701cc))
* **deps:** bump @mdn/browser-compat-data from 5.4.0 to 5.4.1 ([#10079](https://github.com/mdn/yari/issues/10079)) ([94b1f18](https://github.com/mdn/yari/commit/94b1f1839db37fba0c8607dc44e4e1b86e7a9c4f))
* **deps:** bump @mdn/browser-compat-data from 5.4.1 to 5.4.2 ([#10093](https://github.com/mdn/yari/issues/10093)) ([03eae2a](https://github.com/mdn/yari/commit/03eae2a9d51b66cbb1f8bcf7e2c3f1128e45d7fa))
* **deps:** bump @stripe/stripe-js from 2.1.11 to 2.2.0 ([#10058](https://github.com/mdn/yari/issues/10058)) ([1496846](https://github.com/mdn/yari/commit/149684667f6aa03f3e7041786d7db3f9868774dd))
* **deps:** bump @vscode/ripgrep from 1.15.7 to 1.15.9 ([#10068](https://github.com/mdn/yari/issues/10068)) ([75c9292](https://github.com/mdn/yari/commit/75c929221e38bc7fffb5750cf8d831ec18119b6e))
* **deps:** bump cryptography from 41.0.4 to 41.0.6 in /deployer ([#10090](https://github.com/mdn/yari/issues/10090)) ([d05e632](https://github.com/mdn/yari/commit/d05e6322a7945b3c30014995fec0436beddb5c3f))
* **deps:** bump fs-extra from 11.1.1 to 11.2.0 ([#10089](https://github.com/mdn/yari/issues/10089)) ([fc18c48](https://github.com/mdn/yari/commit/fc18c48b7221f42dfd3d703b3aa5bdcbbb99610f))
* **deps:** bump google-github-actions/auth from 1 to 2 ([#10095](https://github.com/mdn/yari/issues/10095)) ([bb60acd](https://github.com/mdn/yari/commit/bb60acd31e49862607db4721b4ca4c538e4569dc))
* **deps:** bump lru-cache from 10.0.3 to 10.1.0 ([#10071](https://github.com/mdn/yari/issues/10071)) ([c301c5a](https://github.com/mdn/yari/commit/c301c5a90fdd23633a4db0cb7e43314bff16c6a8))
* **deps:** bump openai from 4.19.0 to 4.19.1 ([#10060](https://github.com/mdn/yari/issues/10060)) ([3b95674](https://github.com/mdn/yari/commit/3b95674f6b9930cadabb4d8dfb6ded55ffe6818d))
* **deps:** bump openai from 4.19.1 to 4.20.0 ([#10070](https://github.com/mdn/yari/issues/10070)) ([84ab0d9](https://github.com/mdn/yari/commit/84ab0d97b976483825f5374e5d28c4daa86f5b50))
* **deps:** bump openai from 4.20.0 to 4.20.1 ([#10088](https://github.com/mdn/yari/issues/10088)) ([17f560b](https://github.com/mdn/yari/commit/17f560b92d6ee81975a082b7b78e5c9785c22767))
* **deps:** bump pytest-rerunfailures from 12.0 to 13.0 in /testing/integration ([#10083](https://github.com/mdn/yari/issues/10083)) ([c778f2c](https://github.com/mdn/yari/commit/c778f2c0e406cb89528d1c36ba7786d00f5a807d))
* **deps:** bump the dependencies group in /deployer with 1 update ([#10082](https://github.com/mdn/yari/issues/10082)) ([aded53c](https://github.com/mdn/yari/commit/aded53c3928b94417f8ea8bda055a52ae513ff27))
* **deps:** bump the sentry group with 2 updates ([#10053](https://github.com/mdn/yari/issues/10053)) ([62331b1](https://github.com/mdn/yari/commit/62331b182016534f9c1c5f3c006b108e5cdfc242))
* **deps:** bump the sentry group with 2 updates ([#10066](https://github.com/mdn/yari/issues/10066)) ([4b1fb81](https://github.com/mdn/yari/commit/4b1fb81f71149d07fe9f901f0d9deef0e1fe30a8))
* **deps:** bump the sentry group with 2 updates ([#10084](https://github.com/mdn/yari/issues/10084)) ([87fdb66](https://github.com/mdn/yari/commit/87fdb66f8d861cd5162758a7976b107113f8c177))
* **deps:** bump the sentry group with 2 updates ([#10101](https://github.com/mdn/yari/issues/10101)) ([3c314d8](https://github.com/mdn/yari/commit/3c314d8f3515d70902ff0ccae40e8c4fbad3584c))
* **deps:** bump web-specs from 2.74.0 to 2.74.1 ([#10075](https://github.com/mdn/yari/issues/10075)) ([3061bc5](https://github.com/mdn/yari/commit/3061bc554749f88b653ab137153c1b38ae9ab426))
* **macros/LearnSidebar:** add Games Developing section ([#10064](https://github.com/mdn/yari/issues/10064)) ([d4739d3](https://github.com/mdn/yari/commit/d4739d34f3175aeb2cda6f43db0ed90bc6652f3e))
* **macros/LearnSidebar:** capitalize Node.js ([#10065](https://github.com/mdn/yari/issues/10065)) ([51712c2](https://github.com/mdn/yari/commit/51712c29658beabb315a143d5085cff7e9bd0b65))
* **macros/SVGRef:** update zh-CN translation ([#10069](https://github.com/mdn/yari/issues/10069)) ([2fa5aa0](https://github.com/mdn/yari/commit/2fa5aa0c324f22ffce9c5d04c3542345a76ba884))

## [2.35.1](https://github.com/mdn/yari/compare/v2.35.0...v2.35.1) (2023-11-20)


### Miscellaneous

* **deps-dev:** bump @playwright/test from 1.39.0 to 1.40.0 ([#10043](https://github.com/mdn/yari/issues/10043)) ([11ce3aa](https://github.com/mdn/yari/commit/11ce3aaff8a9e74fc5b94891950a8afed80f9dd7))
* **deps-dev:** bump @testing-library/react from 14.1.0 to 14.1.2 ([#10045](https://github.com/mdn/yari/issues/10045)) ([9f2c925](https://github.com/mdn/yari/commit/9f2c92570e450d8cfb55a72e3a9ba28d3e9b4cc4))
* **deps-dev:** bump eslint from 8.53.0 to 8.54.0 ([#10047](https://github.com/mdn/yari/issues/10047)) ([a572fdf](https://github.com/mdn/yari/commit/a572fdf3a159c32e6d1a0411fe0a0c597b9edf32))
* **deps-dev:** bump html-validate from 8.7.0 to 8.7.1 ([#10017](https://github.com/mdn/yari/issues/10017)) ([c6baf8b](https://github.com/mdn/yari/commit/c6baf8ba8b0eb31e0b1325c978d7209391020e43))
* **deps-dev:** bump html-validate from 8.7.1 to 8.7.2 ([#10046](https://github.com/mdn/yari/issues/10046)) ([4686f0b](https://github.com/mdn/yari/commit/4686f0bf94384d1cdda11cd6fa3fe8b06fa88e88))
* **deps-dev:** bump react-router-dom from 6.18.0 to 6.19.0 ([#10041](https://github.com/mdn/yari/issues/10041)) ([38e6d4a](https://github.com/mdn/yari/commit/38e6d4a80deca95cbe0fa372e79e27a0167f99d4))
* **deps-dev:** bump the dependencies group in /testing/integration with 1 update ([#10013](https://github.com/mdn/yari/issues/10013)) ([45820f4](https://github.com/mdn/yari/commit/45820f4ef72f42023a183afc37fc8bebf223818e))
* **deps-dev:** bump ts-loader from 9.5.0 to 9.5.1 ([#10031](https://github.com/mdn/yari/issues/10031)) ([5f86c8f](https://github.com/mdn/yari/commit/5f86c8fc1ec9f0ebd7242abd2b6a0d61a47c9c1a))
* **deps-dev:** bump ts-loader from 9.5.0 to 9.5.1 in /client/pwa ([#10030](https://github.com/mdn/yari/issues/10030)) ([9a1e3ad](https://github.com/mdn/yari/commit/9a1e3adbc53b68ca6e7ff2bb3ff57b944afcc31a))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.30 to 2.7.31 in /client/pwa ([#10038](https://github.com/mdn/yari/issues/10038)) ([21226a7](https://github.com/mdn/yari/commit/21226a735c13d0e682bb877fe636883bc3751524))
* **deps:** bump @mdn/browser-compat-data from 5.3.30 to 5.3.31 ([#10032](https://github.com/mdn/yari/issues/10032)) ([5abb914](https://github.com/mdn/yari/commit/5abb914ae42a952371e410fb291bd06c5c31a571))
* **deps:** bump @mdn/browser-compat-data from 5.3.31 to 5.4.0 ([#10049](https://github.com/mdn/yari/issues/10049)) ([5d8270b](https://github.com/mdn/yari/commit/5d8270baa046d001f918380cfb6f32978285ef5d))
* **deps:** bump @vscode/ripgrep from 1.15.6 to 1.15.7 ([#10042](https://github.com/mdn/yari/issues/10042)) ([5affc92](https://github.com/mdn/yari/commit/5affc926f90a3d1b61b48a4e049125def9f06107))
* **deps:** bump @webref/css from 6.0.0 to 6.7.1 ([#9731](https://github.com/mdn/yari/issues/9731)) ([4a50067](https://github.com/mdn/yari/commit/4a50067efea6b5bb45e1077d2d292dae32322378))
* **deps:** bump file-type from 18.6.0 to 18.7.0 ([#10014](https://github.com/mdn/yari/issues/10014)) ([26275e2](https://github.com/mdn/yari/commit/26275e2668f66460daa05e004bc60f5d5b712563))
* **deps:** bump lru-cache from 10.0.1 to 10.0.2 ([#10015](https://github.com/mdn/yari/issues/10015)) ([0afd35c](https://github.com/mdn/yari/commit/0afd35c3faddda3cbfcb9449366925dab0e7ab6c))
* **deps:** bump lru-cache from 10.0.2 to 10.0.3 ([#10048](https://github.com/mdn/yari/issues/10048)) ([e218e00](https://github.com/mdn/yari/commit/e218e006adc897af67d9d2cdb9eb5af43568c9f7))
* **deps:** bump openai from 4.17.3 to 4.17.4 ([#10018](https://github.com/mdn/yari/issues/10018)) ([7f707d8](https://github.com/mdn/yari/commit/7f707d85b1df5dc1c9aa9cf12a43422c7638cfde))
* **deps:** bump openai from 4.17.4 to 4.17.5 ([#10025](https://github.com/mdn/yari/issues/10025)) ([fd2af62](https://github.com/mdn/yari/commit/fd2af62b839dda0ff26e112e14c82688cf35d80e))
* **deps:** bump openai from 4.17.5 to 4.18.0 ([#10033](https://github.com/mdn/yari/issues/10033)) ([fa87b01](https://github.com/mdn/yari/commit/fa87b014f61ad5b93e0e078c7ed27c5ef97dcb8e))
* **deps:** bump openai from 4.18.0 to 4.19.0 ([#10035](https://github.com/mdn/yari/issues/10035)) ([48dbc83](https://github.com/mdn/yari/commit/48dbc833d3578a162952c3c8d9dd86a6c9f14e64))
* **deps:** bump react-markdown from 9.0.0 to 9.0.1 ([#10024](https://github.com/mdn/yari/issues/10024)) ([35532d9](https://github.com/mdn/yari/commit/35532d9a6d320fcf10e38903cfb553c4794d248d))
* **deps:** bump the dependencies group in /deployer with 1 update ([#10050](https://github.com/mdn/yari/issues/10050)) ([606520e](https://github.com/mdn/yari/commit/606520e3b3b4952daed5490e0c27ad6545d80404))
* **deps:** bump the dependencies group in /deployer with 2 updates ([#10012](https://github.com/mdn/yari/issues/10012)) ([55e1c7f](https://github.com/mdn/yari/commit/55e1c7f47874ff8c00e2a1b5a5fbe5fe6609a33f))
* **deps:** bump the sentry group with 2 updates ([#10022](https://github.com/mdn/yari/issues/10022)) ([821327f](https://github.com/mdn/yari/commit/821327f0599ad672652bc46e988049815ab554b2))
* **deps:** bump web-specs from 2.73.0 to 2.74.0 ([#10023](https://github.com/mdn/yari/issues/10023)) ([4cb364b](https://github.com/mdn/yari/commit/4cb364b64693f01a1172e105713de97222407811))
* **macros/CSSRef:** add "Using CSS math functions" ([#10026](https://github.com/mdn/yari/issues/10026)) ([d727fd8](https://github.com/mdn/yari/commit/d727fd820a5dd158a5725fee278a28653ad2dab3))
* **macros/HTTPSidebar:** remove Cookie Security link ([#9654](https://github.com/mdn/yari/issues/9654)) ([4618778](https://github.com/mdn/yari/commit/46187786c61eeda9fb0a10eaa660a60307ab25dd))

## [2.35.0](https://github.com/mdn/yari/compare/v2.34.2...v2.35.0) (2023-11-10)


### Features

* **macro-usage-report:** add CSV output format ([#9996](https://github.com/mdn/yari/issues/9996)) ([85e9afa](https://github.com/mdn/yari/commit/85e9afaf136828618945551d99710b2fdbc5c7ee))


### Miscellaneous

* **deps-dev:** bump @babel/core from 7.23.2 to 7.23.3 ([#9986](https://github.com/mdn/yari/issues/9986)) ([19c2d93](https://github.com/mdn/yari/commit/19c2d939ba81673bf2bdf0befbb0c584b7890eba))
* **deps-dev:** bump @babel/eslint-parser from 7.22.15 to 7.23.3 ([#9991](https://github.com/mdn/yari/issues/9991)) ([e96005e](https://github.com/mdn/yari/commit/e96005e97a40d9dc411442d469bdadd35b8c914f))
* **deps-dev:** bump @babel/preset-env from 7.23.2 to 7.23.3 ([#9987](https://github.com/mdn/yari/issues/9987)) ([2d059c8](https://github.com/mdn/yari/commit/2d059c82d2879aa3b084935deaeec8a9b0d3fb05))
* **deps-dev:** bump eslint-plugin-n from 16.3.0 to 16.3.1 ([#9999](https://github.com/mdn/yari/issues/9999)) ([4d24433](https://github.com/mdn/yari/commit/4d24433a17762eed5a1994c6a0a231ccf6e65ab3))
* **deps:** bump @mdn/browser-compat-data from 5.3.29 to 5.3.30 ([#10000](https://github.com/mdn/yari/issues/10000)) ([0d4d603](https://github.com/mdn/yari/commit/0d4d603de9b2ae344370c7adc2819d0182d891a1))
* **deps:** bump markdown dependencies ([#9980](https://github.com/mdn/yari/issues/9980)) ([49979f1](https://github.com/mdn/yari/commit/49979f19c6d062fd6f725549295b62415f59de19))
* **deps:** bump mdn-data from 2.2.0 to 2.3.0 ([#9989](https://github.com/mdn/yari/issues/9989)) ([696bd7e](https://github.com/mdn/yari/commit/696bd7ec19dd43ffa0a06ae43ea9c3cf741d64bd))
* **deps:** bump openai from 4.16.1 to 4.17.0 ([#9990](https://github.com/mdn/yari/issues/9990)) ([7a66c1b](https://github.com/mdn/yari/commit/7a66c1bf664ad340018a0d3a8aa5a98d029c7d05))
* **deps:** bump openai from 4.17.0 to 4.17.3 ([#9998](https://github.com/mdn/yari/issues/9998)) ([209ef20](https://github.com/mdn/yari/commit/209ef20fe1bc00ced7014c0973fb6c32e4b03755))
* **deps:** bump the sentry group with 2 updates ([#9983](https://github.com/mdn/yari/issues/9983)) ([e094662](https://github.com/mdn/yari/commit/e094662180d23678189b8f0038331b9fca060d52))
* **deps:** bump the sentry group with 2 updates ([#9997](https://github.com/mdn/yari/issues/9997)) ([c2264e4](https://github.com/mdn/yari/commit/c2264e41051ff80d01e16b580a8e0c177e9380da))
* **deps:** bump web-specs from 2.72.0 to 2.73.0 ([#10001](https://github.com/mdn/yari/issues/10001)) ([4afa36d](https://github.com/mdn/yari/commit/4afa36d07bcfc9c54da77cb14d39a2725ca3ec66))
* **flaws:** exclude /discord from broken-link flaw ([#10007](https://github.com/mdn/yari/issues/10007)) ([c72d8bc](https://github.com/mdn/yari/commit/c72d8bca2fdcab7aecb7ccad6b4ba2e38b62f6a5))
* **footer:** update Careers link ([#9995](https://github.com/mdn/yari/issues/9995)) ([abc8f4e](https://github.com/mdn/yari/commit/abc8f4eedd1a616bbe6f428eb1687a9ac79cb2c3))
* **macros/CSSRef:** add Border-radius generator ([#9994](https://github.com/mdn/yari/issues/9994)) ([b499b71](https://github.com/mdn/yari/commit/b499b719bb8ce11011252198127227652d10aa7b))
* **macros:** delete {spec,spec2,SpecName} macros ([#9982](https://github.com/mdn/yari/issues/9982)) ([4cfbb82](https://github.com/mdn/yari/commit/4cfbb82c173883b46fca945dcaadf1c62d149717))

## [2.34.2](https://github.com/mdn/yari/compare/v2.34.1...v2.34.2) (2023-11-08)


### Bug Fixes

* **ai-help:** destructure embedding response properly ([#9977](https://github.com/mdn/yari/issues/9977)) ([a80a0d6](https://github.com/mdn/yari/commit/a80a0d64003a9660dcf467647ec34c1980380130))
* **ai-help:** revert "chore(deps): bump unified from 10.1.2 to 11.0.4 + remark-{gfm,parse,rehype} + rehype-{format,stringify} ([#9896](https://github.com/mdn/yari/issues/9896))" ([#9978](https://github.com/mdn/yari/issues/9978)) ([58b53db](https://github.com/mdn/yari/commit/58b53dbbd5a26a5845a4273ea9ef8c0c2dbe0965))
* **baseline:** hide banner on subgrid ([#9979](https://github.com/mdn/yari/issues/9979)) ([1fc8c92](https://github.com/mdn/yari/commit/1fc8c9252320cd71e63dd9fb341152ae40d2cd5a))
* **discord:** add /discord redirect with updated signup link ([#9976](https://github.com/mdn/yari/issues/9976)) ([3544491](https://github.com/mdn/yari/commit/354449185424b5aa2ec13f14e73afbff30a07546))


### Miscellaneous

* **deps-dev:** bump @testing-library/react from 14.0.0 to 14.1.0 ([#9967](https://github.com/mdn/yari/issues/9967)) ([45aa619](https://github.com/mdn/yari/commit/45aa6198ac5fc6b065ba1d17eac627772477af85))
* **deps-dev:** bump eslint-plugin-n from 16.2.0 to 16.3.0 ([#9971](https://github.com/mdn/yari/issues/9971)) ([3907390](https://github.com/mdn/yari/commit/39073909822feb7a9bd68821141b2a5d1ed45ca4))
* **deps-dev:** bump stylelint-scss from 5.3.0 to 5.3.1 ([#9965](https://github.com/mdn/yari/issues/9965)) ([83ae6b7](https://github.com/mdn/yari/commit/83ae6b778d116bd4663e230cac966d8670027b8f))
* **deps-dev:** bump the types group with 8 updates ([#9964](https://github.com/mdn/yari/issues/9964)) ([3b195e5](https://github.com/mdn/yari/commit/3b195e5a4441e5d3a322b77afefe376098fe2461))
* **deps:** bump @mdn/browser-compat-data from 5.3.28 to 5.3.29 ([#9966](https://github.com/mdn/yari/issues/9966)) ([3ee6b43](https://github.com/mdn/yari/commit/3ee6b437432d0bff7db95b4fb9e264c6c83a3a11))
* **deps:** bump cookie from 0.5.0 to 0.6.0 ([#9969](https://github.com/mdn/yari/issues/9969)) ([c67e0f2](https://github.com/mdn/yari/commit/c67e0f2c438dc88c1afbb43616d362962e79b93c))
* **deps:** bump inquirer from 9.2.11 to 9.2.12 ([#9970](https://github.com/mdn/yari/issues/9970)) ([580ca34](https://github.com/mdn/yari/commit/580ca3442239436f4c661fd5fc9692b29e3289c6))
* **deps:** bump openai from 4.15.4 to 4.16.1 ([#9972](https://github.com/mdn/yari/issues/9972)) ([3043174](https://github.com/mdn/yari/commit/30431746d2e9669f763fe10a66e506e3b35fbbc7))
* **deps:** bump the sentry group with 2 updates ([#9963](https://github.com/mdn/yari/issues/9963)) ([4642daf](https://github.com/mdn/yari/commit/4642daf20dfdb404b4decd71e9ebb5dc1c1de112))
* **deps:** bump web-specs from 2.71.0 to 2.72.0 ([#9973](https://github.com/mdn/yari/issues/9973)) ([2693dba](https://github.com/mdn/yari/commit/2693dbae3898d98376149549bb7a97111c739f75))

## [2.34.1](https://github.com/mdn/yari/compare/v2.34.0...v2.34.1) (2023-11-08)


### Bug Fixes

* **links:** adopt visited link colors from Firefox ([#9961](https://github.com/mdn/yari/issues/9961)) ([29839fb](https://github.com/mdn/yari/commit/29839fbad99deafae9cb5728a6931ba6b50b79bc))
* **node:** support v20 + suppress experimental warnings ([#9517](https://github.com/mdn/yari/issues/9517)) ([4401c3e](https://github.com/mdn/yari/commit/4401c3eb833cd1970a095730902f249ec7623711))

## [2.34.0](https://github.com/mdn/yari/compare/v2.33.1...v2.34.0) (2023-11-07)


### Features

* **links:** distinguish visited links (v2) ([#9931](https://github.com/mdn/yari/issues/9931)) ([76b9e7a](https://github.com/mdn/yari/commit/76b9e7ae23d464ec2dc821b2c2733d7f7de8bbc8))
* **sidebar:** add Colors category to Guides ([#9936](https://github.com/mdn/yari/issues/9936)) ([20e5826](https://github.com/mdn/yari/commit/20e5826e9e598481ebf0a26cf35e578cb01ace75))


### Bug Fixes

* **build:** sort meta files ([#9899](https://github.com/mdn/yari/issues/9899)) ([37bf90c](https://github.com/mdn/yari/commit/37bf90c69034855c41e20dfa951364522740e77b))
* **document-survey:** hide for writers ([#9893](https://github.com/mdn/yari/issues/9893)) ([ee8a59d](https://github.com/mdn/yari/commit/ee8a59db5b5e495493e577bef8819cc6d9a7b356))


### Enhancements

* **opengraph:** fix og:image and add og:{image:*,site_name,type} ([#9795](https://github.com/mdn/yari/issues/9795)) ([a9ee3d3](https://github.com/mdn/yari/commit/a9ee3d3438cbecf283f36a95cd58dac38b6280a5))


### Miscellaneous

* **deps-dev:** bump @babel/preset-env from 7.22.20 to 7.23.2 ([#9807](https://github.com/mdn/yari/issues/9807)) ([a9af0dc](https://github.com/mdn/yari/commit/a9af0dcc547a611a0be7743133a5feac55e99076))
* **deps-dev:** bump @swc/core from 1.3.80 to 1.3.96 ([#9944](https://github.com/mdn/yari/issues/9944)) ([d2d0ef5](https://github.com/mdn/yari/commit/d2d0ef5eec1a626d6621b9bb14147d87a3432046))
* **deps-dev:** bump bfj from 7.0.2 to 8.0.0 ([#9626](https://github.com/mdn/yari/issues/9626)) ([cd2c8be](https://github.com/mdn/yari/commit/cd2c8be08cc4df11e3dd45c067b912db8325ef6d))
* **deps-dev:** bump eslint from 8.52.0 to 8.53.0 ([#9946](https://github.com/mdn/yari/issues/9946)) ([b8999e3](https://github.com/mdn/yari/commit/b8999e330461e790a7458240552c3a341982c60b))
* **deps-dev:** bump eslint-plugin-n from 16.0.1 to 16.2.0 ([#9798](https://github.com/mdn/yari/issues/9798)) ([423c86e](https://github.com/mdn/yari/commit/423c86e44221192daf8a000d8a8152ceca2625b7))
* **deps-dev:** bump the types group with 1 update ([#9943](https://github.com/mdn/yari/issues/9943)) ([f16866f](https://github.com/mdn/yari/commit/f16866f294f58f5469090019375c8fc941b134d4))
* **deps-dev:** remove use-debounce ([#9952](https://github.com/mdn/yari/issues/9952)) ([5d52f54](https://github.com/mdn/yari/commit/5d52f54e33d311fcf099e2d96c526f5d74eec7da))
* **deps:** bump async from 3.2.4 to 3.2.5 ([#9947](https://github.com/mdn/yari/issues/9947)) ([e241ff4](https://github.com/mdn/yari/commit/e241ff47b56070c8f29af001175472b2639d8bf7))
* **deps:** bump cryptography from 41.0.3 to 41.0.4 in /deployer ([#9709](https://github.com/mdn/yari/issues/9709)) ([f8e1d7a](https://github.com/mdn/yari/commit/f8e1d7a1141331147d38b2c5fb97360c967d62d4))
* **deps:** bump fdir from 6.1.0 to 6.1.1 ([#9945](https://github.com/mdn/yari/issues/9945)) ([1390df5](https://github.com/mdn/yari/commit/1390df51635df56ba160e8f0de6623ea8c8dcb00))
* **deps:** bump openai from 4.14.2 to 4.15.4 ([#9949](https://github.com/mdn/yari/issues/9949)) ([abfbcff](https://github.com/mdn/yari/commit/abfbcff4d398163c92b6186a2d30f23111f0f1bf))
* **deps:** bump rehype-raw from 6.1.1 to 7.0.0 ([#9560](https://github.com/mdn/yari/issues/9560)) ([3c85a4a](https://github.com/mdn/yari/commit/3c85a4ab3e20e1f9dfa9e29c8b440277dfa302c1))
* **deps:** bump rehype-sanitize from 5.0.1 to 6.0.0 ([#9558](https://github.com/mdn/yari/issues/9558)) ([db843b0](https://github.com/mdn/yari/commit/db843b08b49429d075e493cdc75e6242641b459f))
* **deps:** bump sse.js from 0.6.1 to 1.0.0 ([#9594](https://github.com/mdn/yari/issues/9594)) ([32154e6](https://github.com/mdn/yari/commit/32154e6ece47665be04a44935beee2a396691a14))
* **deps:** bump the dependencies group in /deployer with 1 update ([#9950](https://github.com/mdn/yari/issues/9950)) ([2d7e33b](https://github.com/mdn/yari/commit/2d7e33b3bcf53c439734cf106623161025f80783))
* **deps:** bump unified from 10.1.2 to 11.0.4 + remark-{gfm,parse,rehype} + rehype-{format,stringify} ([#9896](https://github.com/mdn/yari/issues/9896)) ([ef5800a](https://github.com/mdn/yari/commit/ef5800a9eb174be852a8edcf31c9683defbbf77b))
* **footer:** add mastodon svg icon ([#9689](https://github.com/mdn/yari/issues/9689)) ([321caf4](https://github.com/mdn/yari/commit/321caf4703d326ad52dd9c1041398010d73ff633))
* **macros:** remove TenthCampaignQuote macro ([#9906](https://github.com/mdn/yari/issues/9906)) ([9507664](https://github.com/mdn/yari/commit/9507664915c0158c661d305f66e834edad790f9a))
* **markdown:** migrate to mdast-util-to-hast ([#9941](https://github.com/mdn/yari/issues/9941)) ([54eba1d](https://github.com/mdn/yari/commit/54eba1dfc39b9ac42af5c42633a61510c185a340))
* **pong:** update mapping ([#9884](https://github.com/mdn/yari/issues/9884)) ([6c044cc](https://github.com/mdn/yari/commit/6c044ccd20e7e1041445a03b13cb5bc36914653f))
* **telemetry:** measure top-level menu link clicks ([#9938](https://github.com/mdn/yari/issues/9938)) ([9c176c0](https://github.com/mdn/yari/commit/9c176c0f7b46193d22a98619279e95a5677447cb))
* **telemetry:** send geo_iso with pings ([#9909](https://github.com/mdn/yari/issues/9909)) ([2c94a69](https://github.com/mdn/yari/commit/2c94a6955654051f17eb92b4630e445919a8763d))

## [2.33.1](https://github.com/mdn/yari/compare/v2.33.0...v2.33.1) (2023-11-03)


### Bug Fixes

* **links:** revert distinguish visited links ([3bae299](https://github.com/mdn/yari/commit/3bae2998df7296591368004fd06d5b6b5358bb2f))


### Miscellaneous

* **deps-dev:** bump postcss-preset-env from 9.2.0 to 9.3.0 ([#9923](https://github.com/mdn/yari/issues/9923)) ([e095444](https://github.com/mdn/yari/commit/e0954449274a5225e56a6bd84afec280b14b378d))
* **deps-dev:** bump react-router-dom from 6.17.0 to 6.18.0 ([#9925](https://github.com/mdn/yari/issues/9925)) ([cd21c6d](https://github.com/mdn/yari/commit/cd21c6dcc0d2855e9e38759300ac805368e50dd5))
* **deps-dev:** bump stylelint-config-recommended-scss from 13.0.0 to 13.1.0 ([#9935](https://github.com/mdn/yari/issues/9935)) ([ca191b0](https://github.com/mdn/yari/commit/ca191b0211a7162e18f0504b2605a44eedbf880e))
* **deps-dev:** bump the types group with 1 update ([#9928](https://github.com/mdn/yari/issues/9928)) ([414cc21](https://github.com/mdn/yari/commit/414cc21e5b1b06bbf828478d983f4c66ce7c15d5))
* **deps:** bump @mdn/browser-compat-data from 5.3.27 to 5.3.28 ([#9926](https://github.com/mdn/yari/issues/9926)) ([48c8ce0](https://github.com/mdn/yari/commit/48c8ce03141eefde73bd8110772ddad90b45959f))
* **deps:** bump @stripe/stripe-js from 2.1.10 to 2.1.11 ([#9933](https://github.com/mdn/yari/issues/9933)) ([8054bbd](https://github.com/mdn/yari/commit/8054bbd1f3fffba02eab8dd8928d856977baf7be))
* **deps:** bump file-type from 18.5.0 to 18.6.0 ([#9924](https://github.com/mdn/yari/issues/9924)) ([ecd9779](https://github.com/mdn/yari/commit/ecd9779409c5de32d20839c45bb4c745350fd324))
* **deps:** bump mdn-data from 2.1.0 to 2.2.0 ([#9934](https://github.com/mdn/yari/issues/9934)) ([32c0c00](https://github.com/mdn/yari/commit/32c0c00815ac5d1efeca63d17c236266906d4a17))
* **macros/JsSidebar:** update zh-CN translation ([#9849](https://github.com/mdn/yari/issues/9849)) ([9867d52](https://github.com/mdn/yari/commit/9867d52abdebea25beb6e4d4878bd902a03664c4))
* **macros/LearnSidebar:** add some pages under MathML ([#9937](https://github.com/mdn/yari/issues/9937)) ([060e53a](https://github.com/mdn/yari/commit/060e53a002761656bbad954a1675ee0a8b8ef109))
* **macros/WebAssemblySidebar:** add zh-CN translation ([#9932](https://github.com/mdn/yari/issues/9932)) ([870285a](https://github.com/mdn/yari/commit/870285aed1e0218adbc4abf1660ccd519413496c))
* **telemetry:** measure menu clicks ([#9918](https://github.com/mdn/yari/issues/9918)) ([c4c5d79](https://github.com/mdn/yari/commit/c4c5d79f201cd2fe3844414dcaf5edc8b9bd5246))

## [2.33.0](https://github.com/mdn/yari/compare/v2.32.0...v2.33.0) (2023-10-31)


### Features

* **links:** distinguish visited links ([#9907](https://github.com/mdn/yari/issues/9907)) ([8f84da3](https://github.com/mdn/yari/commit/8f84da3bcc0bc6e1b87c15078c14a1d140925688))
* **theme:** sync body background-color with theme-color meta tag ([#9325](https://github.com/mdn/yari/issues/9325)) ([5001b04](https://github.com/mdn/yari/commit/5001b04890f796b388024b2d23c4c5b0caf88f73))


### Bug Fixes

* **client:** rendering locale in column header on /translations/dashboard ([24bf873](https://github.com/mdn/yari/commit/24bf8738815cc0884eb47e3ae0f4ce1973906389))
* correct some typos ([#9858](https://github.com/mdn/yari/issues/9858)) ([925538e](https://github.com/mdn/yari/commit/925538e166bd71d2befb3fb46741d7b6624a4978))
* **docs:** link first child of every description term in post-processing ([#9862](https://github.com/mdn/yari/issues/9862)) ([0295813](https://github.com/mdn/yari/commit/029581391fa2a57f843d55f47390ec8c0c4b6732))
* **images:** avoid blurry images ([#9591](https://github.com/mdn/yari/issues/9591)) ([0829b7e](https://github.com/mdn/yari/commit/0829b7ee43815d86f9c91ef6797cedc7d4f1e1f3))
* **mandala:** remove rotation and color animation ([#9916](https://github.com/mdn/yari/issues/9916)) ([e687a03](https://github.com/mdn/yari/commit/e687a03e2354412f4dad45e80d4ebaa9d7926d5a))
* **plus:** load stripe.js for fraud prevention ([#9318](https://github.com/mdn/yari/issues/9318)) ([88f000e](https://github.com/mdn/yari/commit/88f000e037fbad71ed2779159aa4e7f47568cadc))
* **translations/dashboard:** fix Popularity rank column header ([#9908](https://github.com/mdn/yari/issues/9908)) ([24bf873](https://github.com/mdn/yari/commit/24bf8738815cc0884eb47e3ae0f4ce1973906389))


### Miscellaneous

* **deps-dev:** bump {react-router,react-router-dom} from 6.16.0 to 6.17.0 ([#9832](https://github.com/mdn/yari/issues/9832)) ([fd72a19](https://github.com/mdn/yari/commit/fd72a19b394e9c4123b4670deae140b6549ec93f))
* **deps-dev:** bump eslint-plugin-unicorn from 48.0.1 to 49.0.0 ([#9904](https://github.com/mdn/yari/issues/9904)) ([0de918b](https://github.com/mdn/yari/commit/0de918bcc291a48299dce76c8f251224705e86eb))
* **deps-dev:** bump stylelint-scss from 5.2.1 to 5.3.0 ([#9905](https://github.com/mdn/yari/issues/9905)) ([5efd040](https://github.com/mdn/yari/commit/5efd04052a81c7d145dc8b7f1d212dbbfc5b0211))
* **deps-dev:** bump the types group with 1 update ([#9913](https://github.com/mdn/yari/issues/9913)) ([3b2dc06](https://github.com/mdn/yari/commit/3b2dc06f522bbdf0e730fe054f588d3bbc46b204))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.29 to 2.7.30 in /client/pwa ([#9823](https://github.com/mdn/yari/issues/9823)) ([a19c79c](https://github.com/mdn/yari/commit/a19c79ced150ca79f54dbd55781488124b5e8b0d))
* **deps:** bump openai from 3.3.0 to 4.14.0 ([#9888](https://github.com/mdn/yari/issues/9888)) ([607c938](https://github.com/mdn/yari/commit/607c9385f804bdb8c25e4a66870444516aa59b3f))
* **deps:** bump openai from 4.14.0 to 4.14.1 ([#9903](https://github.com/mdn/yari/issues/9903)) ([101b682](https://github.com/mdn/yari/commit/101b68220aa0ec8d264d37fd7050669613e72655))
* **deps:** bump openai from 4.14.1 to 4.14.2 ([#9914](https://github.com/mdn/yari/issues/9914)) ([b60d0c0](https://github.com/mdn/yari/commit/b60d0c0e4b204993b4ded647d0256e6692b92195))
* **deps:** bump the dependencies group in /deployer with 3 updates ([#9900](https://github.com/mdn/yari/issues/9900)) ([fe6c535](https://github.com/mdn/yari/commit/fe6c535a812511c57faa6ce722bc66d50e7c6c76))
* **deps:** bump the dependencies group in /testing/integration with 2 updates ([#9902](https://github.com/mdn/yari/issues/9902)) ([521b8af](https://github.com/mdn/yari/commit/521b8af6bb26cd0370f845fc32d6e63b88eb97ff))
* **deps:** bump the sentry group with 2 updates ([#9901](https://github.com/mdn/yari/issues/9901)) ([881e66c](https://github.com/mdn/yari/commit/881e66c4c648f776d314ed8d2bfe1fdf2d61c5ef))
* **deps:** bump the sentry group with 2 updates ([#9912](https://github.com/mdn/yari/issues/9912)) ([3c371ce](https://github.com/mdn/yari/commit/3c371ce6ae1cfdf853b309a9a1d6d150bb26f0ef))
* **macros/MathMLRef:** update zh-CN translation ([#9915](https://github.com/mdn/yari/issues/9915)) ([d7f3e7d](https://github.com/mdn/yari/commit/d7f3e7d6859d4742a42481af842c045691ec8268))
* **macros/Non-standard_Header:** remove "Firefox OS" ([#9827](https://github.com/mdn/yari/issues/9827)) ([fd2a66e](https://github.com/mdn/yari/commit/fd2a66e5eeed6174872e5ce98b8d114d621072a3))
* **telemetry:** measure TOC clicks ([#9919](https://github.com/mdn/yari/issues/9919)) ([69a0276](https://github.com/mdn/yari/commit/69a02760b76e017bc7017252d9a60f598b154b56))

## [2.32.0](https://github.com/mdn/yari/compare/v2.31.0...v2.32.0) (2023-10-27)


### Features

* **ai-help:** index full docs as well ([#9608](https://github.com/mdn/yari/issues/9608)) ([9355a64](https://github.com/mdn/yari/commit/9355a643b601052c1ef3c426d6f6323f3baec2aa))
* **blog:** add toc ([#9707](https://github.com/mdn/yari/issues/9707)) ([e31ba94](https://github.com/mdn/yari/commit/e31ba94d319097bf35cd04941f34c7b85902fb40))
* **docs:** add anchor links on description terms ([#8413](https://github.com/mdn/yari/issues/8413)) ([ff73a32](https://github.com/mdn/yari/commit/ff73a329eb76647137fab808c34b9d39a87dee24))
* **playground:** allow img from blob and data ([#9771](https://github.com/mdn/yari/issues/9771)) ([77e4c6e](https://github.com/mdn/yari/commit/77e4c6eb70fa2875c349ed22af75bcb04637f78c))
* **pong:** bottom banner ([#9883](https://github.com/mdn/yari/issues/9883)) ([d533e90](https://github.com/mdn/yari/commit/d533e904eda86653d87d067eb82b507b8d0aeb83))


### Bug Fixes

* **a11y:** fix tab order reset in the header ([#9851](https://github.com/mdn/yari/issues/9851)) ([b12f554](https://github.com/mdn/yari/commit/b12f554af27d7c43e061ae2cbc864249ef371943))
* **baseline:** not appearing on translated docs ([#9662](https://github.com/mdn/yari/issues/9662)) ([788c883](https://github.com/mdn/yari/commit/788c8838ebfcf871da8b02e5d36df6ac8ecd39d6))
* **blog:** move toc to left on large screens ([#9772](https://github.com/mdn/yari/issues/9772)) ([002bddd](https://github.com/mdn/yari/commit/002bddda521c38fe8f179104076ef103a761a1ac))
* **client:** avoid CSS warning in Firefox ([#9727](https://github.com/mdn/yari/issues/9727)) ([967b786](https://github.com/mdn/yari/commit/967b7867dc09bad5776a5aa10ea51924e376724d))
* **client:** make alt text on images appear in dark mode ([#9250](https://github.com/mdn/yari/issues/9250)) ([f432df1](https://github.com/mdn/yari/commit/f432df149368369940ab52ee5aecadd2132fb424))
* **docs:** restore behavior of description term links ([#9811](https://github.com/mdn/yari/issues/9811)) ([0cad7f4](https://github.com/mdn/yari/commit/0cad7f46a432684f0baabd2cff9725ee3ca54a90))
* **flaws:** ignore casing of text fragments ([#9882](https://github.com/mdn/yari/issues/9882)) ([fc51e08](https://github.com/mdn/yari/commit/fc51e088e03a7429ee9033d092841e9e5a285f4d))
* **images:** use dark text on white background ([#9863](https://github.com/mdn/yari/issues/9863)) ([90c868e](https://github.com/mdn/yari/commit/90c868eb8bbcffb515ffc82309bb871b34e323cb))
* **macros/LiveSampleLink:** add fallback to prebuilt samples ([#9738](https://github.com/mdn/yari/issues/9738)) ([4e36847](https://github.com/mdn/yari/commit/4e3684717b4857818eeeb901486eaf6be255b626))
* **macros/WebExtExamples:** update branch name ([#9730](https://github.com/mdn/yari/issues/9730)) ([4f05c30](https://github.com/mdn/yari/commit/4f05c30e99ab4a15c119d3c47ef3e2f15fc77f42))
* **ssr:** use absolute href for alternate rss link ([#9794](https://github.com/mdn/yari/issues/9794)) ([5150c6c](https://github.com/mdn/yari/commit/5150c6ca1fa85a01d3ed563e50805823fba9f0e7))
* update branch name with `main` ([4f05c30](https://github.com/mdn/yari/commit/4f05c30e99ab4a15c119d3c47ef3e2f15fc77f42))


### Enhancements

* **docs:** distinguish nested definition lists ([#9836](https://github.com/mdn/yari/issues/9836)) ([f8b48f2](https://github.com/mdn/yari/commit/f8b48f2dae9b302e0b6fa56887de8271c75af2e1))
* **search:** split query at dot ([#9840](https://github.com/mdn/yari/issues/9840)) ([9286d7b](https://github.com/mdn/yari/commit/9286d7b7022fbc2f8690160b9e73ef539279d115))


### Miscellaneous

* **ai-help:** fix typo in modal ([#9792](https://github.com/mdn/yari/issues/9792)) ([4ccfa53](https://github.com/mdn/yari/commit/4ccfa53e9b3f2659c0fe31646c0973307724d37b))
* **blog:** type buildBlog() param type ([#9830](https://github.com/mdn/yari/issues/9830)) ([55d9d83](https://github.com/mdn/yari/commit/55d9d834a5f620e9160b9008e715db1b615d6067))
* **deps-dev:** bump @babel/core from 7.22.20 to 7.23.0 ([#9718](https://github.com/mdn/yari/issues/9718)) ([d8cf162](https://github.com/mdn/yari/commit/d8cf1628878e182b4408e8b72e9787f61074f76d))
* **deps-dev:** bump @babel/core from 7.23.0 to 7.23.2 ([#9803](https://github.com/mdn/yari/issues/9803)) ([a240c5f](https://github.com/mdn/yari/commit/a240c5f4a16287335236ef9a799d564fd9fe903a))
* **deps-dev:** bump @playwright/test from 1.38.1 to 1.39.0 ([#9805](https://github.com/mdn/yari/issues/9805)) ([b996e36](https://github.com/mdn/yari/commit/b996e3648c16f9b36f87e4af570dfffbf400c27c))
* **deps-dev:** bump @supabase/supabase-js from 2.36.0 to 2.37.0 ([#9756](https://github.com/mdn/yari/issues/9756)) ([b38d6c2](https://github.com/mdn/yari/commit/b38d6c223d0f1ae13bb3928ddcb3e1669bd069a4))
* **deps-dev:** bump @supabase/supabase-js from 2.37.0 to 2.38.0 ([#9767](https://github.com/mdn/yari/issues/9767)) ([62fd1f7](https://github.com/mdn/yari/commit/62fd1f7f7d2e91c88cc98327e1a04c884da9c0b9))
* **deps-dev:** bump @supabase/supabase-js from 2.38.0 to 2.38.2 ([#9860](https://github.com/mdn/yari/issues/9860)) ([96356eb](https://github.com/mdn/yari/commit/96356eb369e7700dfe50f566ec7c55823f10d072))
* **deps-dev:** bump @supabase/supabase-js from 2.38.2 to 2.38.4 ([#9895](https://github.com/mdn/yari/issues/9895)) ([5f15c1c](https://github.com/mdn/yari/commit/5f15c1c4f3bd3b2ccdbcdde0fc14f5bca6b9ffff))
* **deps-dev:** bump browserslist from 4.21.11 to 4.22.1 ([#9746](https://github.com/mdn/yari/issues/9746)) ([b41c144](https://github.com/mdn/yari/commit/b41c1444d9a9a37eddb233d72a33c88c8d41476b))
* **deps-dev:** bump eslint from 8.49.0 to 8.50.0 ([#9723](https://github.com/mdn/yari/issues/9723)) ([59f5d5c](https://github.com/mdn/yari/commit/59f5d5c32746daf0fb28e9828d3fd0717bb7405e))
* **deps-dev:** bump eslint from 8.50.0 to 8.51.0 ([#9777](https://github.com/mdn/yari/issues/9777)) ([9d709cb](https://github.com/mdn/yari/commit/9d709cbf1cc7d2a47911bc731af943e126efd977))
* **deps-dev:** bump eslint from 8.51.0 to 8.52.0 ([#9868](https://github.com/mdn/yari/issues/9868)) ([a35c689](https://github.com/mdn/yari/commit/a35c68903c67b5c096778105d21cd2bd2b8854f6))
* **deps-dev:** bump eslint-plugin-import from 2.28.1 to 2.29.0 ([#9866](https://github.com/mdn/yari/issues/9866)) ([ceae0a9](https://github.com/mdn/yari/commit/ceae0a907ab3cee272342a977d79acbec12461b3))
* **deps-dev:** bump eslint-plugin-jest from 27.4.0 to 27.4.2 ([#9752](https://github.com/mdn/yari/issues/9752)) ([f0635e5](https://github.com/mdn/yari/commit/f0635e59afd3cfbea5e04439248d6eab3b8a51ce))
* **deps-dev:** bump eslint-plugin-jest from 27.4.2 to 27.4.3 ([#9870](https://github.com/mdn/yari/issues/9870)) ([96c200f](https://github.com/mdn/yari/commit/96c200f6ef584782786ff4081836e1fb21e1faee))
* **deps-dev:** bump eslint-plugin-jest from 27.4.3 to 27.6.0 ([#9894](https://github.com/mdn/yari/issues/9894)) ([7088721](https://github.com/mdn/yari/commit/7088721ab54ee56d761a2c4dfa57ab19d29a2a04))
* **deps-dev:** bump html-validate from 8.4.0 to 8.4.1 ([#9722](https://github.com/mdn/yari/issues/9722)) ([f424396](https://github.com/mdn/yari/commit/f424396395e12a92fc5b432e0a74cd217ea03a78))
* **deps-dev:** bump html-validate from 8.4.1 to 8.5.0 ([#9753](https://github.com/mdn/yari/issues/9753)) ([f12e7ac](https://github.com/mdn/yari/commit/f12e7ac17e75ccc7c92b916d9fc82f63ef6c33fb))
* **deps-dev:** bump html-validate from 8.5.0 to 8.6.0 ([#9825](https://github.com/mdn/yari/issues/9825)) ([deb99ee](https://github.com/mdn/yari/commit/deb99eea167a3262d77638ba5d9997cbd54ad902))
* **deps-dev:** bump html-validate from 8.6.0 to 8.7.0 ([#9867](https://github.com/mdn/yari/issues/9867)) ([abb0b35](https://github.com/mdn/yari/commit/abb0b35c0fdb85ede3d3c8c2b82ae3b72c6f09a0))
* **deps-dev:** bump postcss from 8.4.30 to 8.4.31 ([#9745](https://github.com/mdn/yari/issues/9745)) ([c0a2447](https://github.com/mdn/yari/commit/c0a2447993134ee8f5a51507b5258a85fce1d4cc))
* **deps-dev:** bump postcss-preset-env from 9.1.4 to 9.2.0 ([#9788](https://github.com/mdn/yari/issues/9788)) ([fa44bbd](https://github.com/mdn/yari/commit/fa44bbd521fc696d48f0f97b1994ebd6feae811a))
* **deps-dev:** bump prettier-plugin-packagejson from 2.4.5 to 2.4.6 ([#9747](https://github.com/mdn/yari/issues/9747)) ([e96e6f2](https://github.com/mdn/yari/commit/e96e6f2b67665b42fe5229c7933ff044cbadf358))
* **deps-dev:** bump resolve from 1.22.6 to 1.22.8 ([#9797](https://github.com/mdn/yari/issues/9797)) ([00ad090](https://github.com/mdn/yari/commit/00ad0901e22f475b79c3acd171c1b00561f0daee))
* **deps-dev:** bump sass from 1.68.0 to 1.69.0 ([#9773](https://github.com/mdn/yari/issues/9773)) ([cff107f](https://github.com/mdn/yari/commit/cff107f7cf7cd9fca332165066b1d44a27dddd3e))
* **deps-dev:** bump sass from 1.69.0 to 1.69.1 ([#9787](https://github.com/mdn/yari/issues/9787)) ([513ceb1](https://github.com/mdn/yari/commit/513ceb11c5894d6d5eaec706a9d882bc37a39559))
* **deps-dev:** bump sass from 1.69.1 to 1.69.2 ([#9799](https://github.com/mdn/yari/issues/9799)) ([5551811](https://github.com/mdn/yari/commit/555181138412f796a05f95bcf8af126cc00dadf8))
* **deps-dev:** bump sass from 1.69.2 to 1.69.3 ([#9809](https://github.com/mdn/yari/issues/9809)) ([dd54570](https://github.com/mdn/yari/commit/dd545703deaed608945cd8d09f17c26d0b60805e))
* **deps-dev:** bump sass from 1.69.3 to 1.69.4 ([#9843](https://github.com/mdn/yari/issues/9843)) ([c35017f](https://github.com/mdn/yari/commit/c35017f87778b97016d5e6bb57ec3fb534de7027))
* **deps-dev:** bump sass from 1.69.4 to 1.69.5 ([#9889](https://github.com/mdn/yari/issues/9889)) ([0076cdd](https://github.com/mdn/yari/commit/0076cdd80a32ebe571ae026b4a65b0ded6ecb958))
* **deps-dev:** bump style-dictionary from 3.8.0 to 3.9.0 ([#9878](https://github.com/mdn/yari/issues/9878)) ([9d82514](https://github.com/mdn/yari/commit/9d82514651ad04c92e8c28ee92609628423d0645))
* **deps-dev:** bump stylelint from 15.10.3 to 15.11.0 ([#9834](https://github.com/mdn/yari/issues/9834)) ([2b214a7](https://github.com/mdn/yari/commit/2b214a7ad56662fd55ae24b9298c8507c4032e7c))
* **deps-dev:** bump swr from 2.2.2 to 2.2.4 ([#9728](https://github.com/mdn/yari/issues/9728)) ([ffca12e](https://github.com/mdn/yari/commit/ffca12e2c0a479b224d3e709e2f7795bd823df5b))
* **deps-dev:** bump tailwindcss from 3.3.3 to 3.3.4 ([#9879](https://github.com/mdn/yari/issues/9879)) ([5720eba](https://github.com/mdn/yari/commit/5720ebaf990a9fe44382375e38ff7bd893b80452))
* **deps-dev:** bump tailwindcss from 3.3.4 to 3.3.5 ([#9887](https://github.com/mdn/yari/issues/9887)) ([9bac3e7](https://github.com/mdn/yari/commit/9bac3e70e6b6cb4276281e65882dd58548989f08))
* **deps-dev:** bump the dependencies group in /testing/integration with 1 update ([#9872](https://github.com/mdn/yari/issues/9872)) ([6a40572](https://github.com/mdn/yari/commit/6a40572b0cbf73ed1abfdc14a4226d62f43858b6))
* **deps-dev:** bump the types group with 1 update ([#9717](https://github.com/mdn/yari/issues/9717)) ([f5c7bf3](https://github.com/mdn/yari/commit/f5c7bf34b999cd146f812b7ee00f6571062114f9))
* **deps-dev:** bump the types group with 1 update ([#9751](https://github.com/mdn/yari/issues/9751)) ([a8f941d](https://github.com/mdn/yari/commit/a8f941da9241be9e9178e443fbb3666af0405d27))
* **deps-dev:** bump the types group with 1 update ([#9776](https://github.com/mdn/yari/issues/9776)) ([98955f9](https://github.com/mdn/yari/commit/98955f9690c79c7955b406735e41f29019e8ee83))
* **deps-dev:** bump the types group with 1 update ([#9871](https://github.com/mdn/yari/issues/9871)) ([96107df](https://github.com/mdn/yari/commit/96107df0121726425d848d40b3a9db825c4ab70d))
* **deps-dev:** bump the types group with 1 update ([#9886](https://github.com/mdn/yari/issues/9886)) ([17d061b](https://github.com/mdn/yari/commit/17d061b331675d66a667df6b61c0135e6d39a070))
* **deps-dev:** bump the types group with 2 updates ([#9769](https://github.com/mdn/yari/issues/9769)) ([c660e6a](https://github.com/mdn/yari/commit/c660e6a928f7f8ed04a852a47a88694b718aed17))
* **deps-dev:** bump the types group with 2 updates ([#9785](https://github.com/mdn/yari/issues/9785)) ([ad1f351](https://github.com/mdn/yari/commit/ad1f351850a77e6cfb0db72dd485e2d87ee07008))
* **deps-dev:** bump the types group with 3 updates ([#9796](https://github.com/mdn/yari/issues/9796)) ([3a9160f](https://github.com/mdn/yari/commit/3a9160f5c73f97b96fa8f02d0949646aafeee6ac))
* **deps-dev:** bump the types group with 5 updates ([#9741](https://github.com/mdn/yari/issues/9741)) ([0bd5489](https://github.com/mdn/yari/commit/0bd5489ea8556b07b79e66aecc2fe3b7ffed022b))
* **deps-dev:** bump the types group with 8 updates ([#9857](https://github.com/mdn/yari/issues/9857)) ([4a2afa9](https://github.com/mdn/yari/commit/4a2afa9c1d86353fcca94d6a7d5685a27f6f7b0e))
* **deps-dev:** bump ts-loader from 9.4.4 to 9.5.0 ([#9779](https://github.com/mdn/yari/issues/9779)) ([50bcf9b](https://github.com/mdn/yari/commit/50bcf9b0a198ed287cb009be29219664347004c2))
* **deps-dev:** bump ts-loader from 9.4.4 to 9.5.0 in /client/pwa ([#9780](https://github.com/mdn/yari/issues/9780)) ([788536c](https://github.com/mdn/yari/commit/788536c2ce45bbdb82107f750a8e972cdfb7fae7))
* **deps-dev:** bump webpack from 5.88.2 to 5.89.0 ([#9824](https://github.com/mdn/yari/issues/9824)) ([de5e07d](https://github.com/mdn/yari/commit/de5e07d086e3de4fea422d48f88a4fa70037aa78))
* **deps-dev:** bump webpack from 5.88.2 to 5.89.0 in /client/pwa ([#9822](https://github.com/mdn/yari/issues/9822)) ([46b4315](https://github.com/mdn/yari/commit/46b4315191168e8ead29a5a7c49ab125b2fc88e9))
* **deps:** bump @codemirror/state from 6.2.1 to 6.3.0 ([#9802](https://github.com/mdn/yari/issues/9802)) ([4f2b754](https://github.com/mdn/yari/commit/4f2b7541658d2223573d250cb808ef0e37998920))
* **deps:** bump @codemirror/state from 6.3.0 to 6.3.1 ([#9846](https://github.com/mdn/yari/issues/9846)) ([f80e45b](https://github.com/mdn/yari/commit/f80e45b180dbee1194cb0da4e0238bedae0c8c73))
* **deps:** bump @mdn/browser-compat-data from 5.3.18 to 5.3.19 ([#9735](https://github.com/mdn/yari/issues/9735)) ([b81f2c1](https://github.com/mdn/yari/commit/b81f2c1b887548ba454948137aa51bb8c78433ab))
* **deps:** bump @mdn/browser-compat-data from 5.3.19 to 5.3.20 ([#9764](https://github.com/mdn/yari/issues/9764)) ([158a7f2](https://github.com/mdn/yari/commit/158a7f2b2ae6b3ff16da6d784286787bf1163da3))
* **deps:** bump @mdn/browser-compat-data from 5.3.20 to 5.3.21 ([#9778](https://github.com/mdn/yari/issues/9778)) ([2496594](https://github.com/mdn/yari/commit/2496594791914f6553df7d76e59f60e11b344d0b))
* **deps:** bump @mdn/browser-compat-data from 5.3.21 to 5.3.22 ([#9800](https://github.com/mdn/yari/issues/9800)) ([7dbcb55](https://github.com/mdn/yari/commit/7dbcb55bc53fe6cdef532b5e2d7ca7c33c29a875))
* **deps:** bump @mdn/browser-compat-data from 5.3.22 to 5.3.23 ([#9815](https://github.com/mdn/yari/issues/9815)) ([88f1882](https://github.com/mdn/yari/commit/88f18820c0786c3c6077675ff25363b73908a939))
* **deps:** bump @mdn/browser-compat-data from 5.3.23 to 5.3.24 ([#9844](https://github.com/mdn/yari/issues/9844)) ([19767f0](https://github.com/mdn/yari/commit/19767f0d22bb03dcf1d16124fca5a5e328cf6d40))
* **deps:** bump @mdn/browser-compat-data from 5.3.24 to 5.3.25 ([#9861](https://github.com/mdn/yari/issues/9861)) ([6d9d212](https://github.com/mdn/yari/commit/6d9d21226e26c484712653767bd9edf5cd5f03f0))
* **deps:** bump @mdn/browser-compat-data from 5.3.25 to 5.3.26 ([#9877](https://github.com/mdn/yari/issues/9877)) ([b6c3932](https://github.com/mdn/yari/commit/b6c3932e05301755d0f47fae95dd60bb16513f6a))
* **deps:** bump @mdn/browser-compat-data from 5.3.26 to 5.3.27 ([#9897](https://github.com/mdn/yari/issues/9897)) ([16c3faa](https://github.com/mdn/yari/commit/16c3faa2feccd270d9e0023cd86102b6f732146d))
* **deps:** bump @mozilla/glean from 2.0.2 to 2.0.5 ([#9854](https://github.com/mdn/yari/issues/9854)) ([8f021d4](https://github.com/mdn/yari/commit/8f021d4b768dcf74c0c1d3bef78674c6c89bfcd3))
* **deps:** bump @vscode/ripgrep from 1.15.5 to 1.15.6 ([#9806](https://github.com/mdn/yari/issues/9806)) ([f46ba3a](https://github.com/mdn/yari/commit/f46ba3a7d8701ee705d317f9ed4b6c5d39e6930b))
* **deps:** bump actions/setup-node from 3 to 4 ([#9874](https://github.com/mdn/yari/issues/9874)) ([dc681e7](https://github.com/mdn/yari/commit/dc681e777781a5301c960db6741b2d32f2eb2af1))
* **deps:** bump aws-actions/configure-aws-credentials from 2.2.0 to 4.0.1 ([#9766](https://github.com/mdn/yari/issues/9766)) ([780c56a](https://github.com/mdn/yari/commit/780c56af628320b835a1d1c4fea951bf351982da))
* **deps:** bump the dependencies group in /deployer with 1 update ([#9750](https://github.com/mdn/yari/issues/9750)) ([fb30ad1](https://github.com/mdn/yari/commit/fb30ad191743d11bdad49c767c27587520e46248))
* **deps:** bump the dependencies group in /deployer with 1 update ([#9781](https://github.com/mdn/yari/issues/9781)) ([32be848](https://github.com/mdn/yari/commit/32be848db7cf0e4659a9d128f7e6113026752193))
* **deps:** bump the dependencies group in /deployer with 1 update ([#9820](https://github.com/mdn/yari/issues/9820)) ([b064256](https://github.com/mdn/yari/commit/b064256872bcf9a93107bddfef588bd9fc00d8d3))
* **deps:** bump the dependencies group in /deployer with 3 updates ([#9865](https://github.com/mdn/yari/issues/9865)) ([3385d97](https://github.com/mdn/yari/commit/3385d974cf8f42f1c99e49e0a7214f899316f8b2))
* **deps:** bump the sentry group with 2 updates ([#9725](https://github.com/mdn/yari/issues/9725)) ([a0bb09a](https://github.com/mdn/yari/commit/a0bb09ae8ab8a075b5b5813d857683eabd1dc7cb))
* **deps:** bump the sentry group with 2 updates ([#9733](https://github.com/mdn/yari/issues/9733)) ([ae738eb](https://github.com/mdn/yari/commit/ae738eb994ece344af55963e68e4ac6d9ad3c9c0))
* **deps:** bump the sentry group with 2 updates ([#9763](https://github.com/mdn/yari/issues/9763)) ([108de5c](https://github.com/mdn/yari/commit/108de5ce3f8af3eacf151333f0bfb5e27d24c1dd))
* **deps:** bump the sentry group with 2 updates ([#9821](https://github.com/mdn/yari/issues/9821)) ([d77b49b](https://github.com/mdn/yari/commit/d77b49bb8e32fba1306b3a7fde73050822e25e85))
* **deps:** bump the sentry group with 2 updates ([#9841](https://github.com/mdn/yari/issues/9841)) ([cbd7201](https://github.com/mdn/yari/commit/cbd7201daf528c1a7377535965f910629d15ff06))
* **deps:** bump the sentry group with 2 updates ([#9875](https://github.com/mdn/yari/issues/9875)) ([90f9642](https://github.com/mdn/yari/commit/90f96422f5fa6f60f3205ce83f9b269e364214d0))
* **deps:** bump the sentry group with 2 updates ([#9885](https://github.com/mdn/yari/issues/9885)) ([58b33b9](https://github.com/mdn/yari/commit/58b33b9bd90fc9651caf82daa153c972db5d27a1))
* **deps:** bump urllib3 from 1.26.14 to 1.26.17 in /testing/integration ([#9760](https://github.com/mdn/yari/issues/9760)) ([e3f651a](https://github.com/mdn/yari/commit/e3f651aafcb54bdc9b1772178845d136efdaf920))
* **deps:** bump urllib3 from 1.26.14 to 1.26.18 in /deployer ([#9837](https://github.com/mdn/yari/issues/9837)) ([7cad968](https://github.com/mdn/yari/commit/7cad9684c37481c7566153d045cf06601a5df6ac))
* **deps:** bump urllib3 from 1.26.17 to 1.26.18 in /testing/integration ([#9838](https://github.com/mdn/yari/issues/9838)) ([3a2b92f](https://github.com/mdn/yari/commit/3a2b92ff02c40ab84ae77965de82eec7c11e6790))
* **deps:** bump web-specs from 2.68.0 to 2.70.0 ([#9804](https://github.com/mdn/yari/issues/9804)) ([e393894](https://github.com/mdn/yari/commit/e393894d6294372673e12d034be38135a92857fb))
* **deps:** bump web-specs from 2.70.0 to 2.71.0 ([#9814](https://github.com/mdn/yari/issues/9814)) ([c528fb9](https://github.com/mdn/yari/commit/c528fb96be3e94bc610c4c53bf60c9cb357e5848))
* **featured-articles:** font-palette -&gt; nesting ([#9892](https://github.com/mdn/yari/issues/9892)) ([d1f6bf3](https://github.com/mdn/yari/commit/d1f6bf320e5de9a88d046b5b101eb2b85fb3e4f7))
* **flaws:** exclude /en-US/blog/* from broken-link flaw ([#9839](https://github.com/mdn/yari/issues/9839)) ([546f4fe](https://github.com/mdn/yari/commit/546f4fe74547f9905e54cd5cc634a92e7f4d05c9))
* **github:** add CODEOWNERS ([#9873](https://github.com/mdn/yari/issues/9873)) ([6d4878a](https://github.com/mdn/yari/commit/6d4878a4e8ccce77f56b2457d19621f8257ef768))
* **glean:** add page's UTM parameters to pings ([#9595](https://github.com/mdn/yari/issues/9595)) ([4c72586](https://github.com/mdn/yari/commit/4c7258670fbcb0b71036d2d9f604c58f48e2f0e2))
* **labeler:** add more labels ([#9784](https://github.com/mdn/yari/issues/9784)) ([a0a543d](https://github.com/mdn/yari/commit/a0a543df0251a40fbd7528e56f4dd3d9b3887a76))
* **macros/CSSRef:** update zh-CN translation of CSSRef ([#9791](https://github.com/mdn/yari/issues/9791)) ([48ad86d](https://github.com/mdn/yari/commit/48ad86d48d4431ce1ff30c6a0f9883c318ad4991))
* **macros/HTMLSidebar:** update zh-CN translation ([#9790](https://github.com/mdn/yari/issues/9790)) ([8bf7a7e](https://github.com/mdn/yari/commit/8bf7a7e1fe487b817b08b906ca35af84e3b970fb))
* **macros/LearnSidebar:** add "HTML forms in legacy browsers" ([#9202](https://github.com/mdn/yari/issues/9202)) ([89f4b29](https://github.com/mdn/yari/commit/89f4b299edc175405e16773a90a5c16ed54f9828))
* **macros/LearnSidebar:** update zh-CN translation ([#9630](https://github.com/mdn/yari/issues/9630)) ([41ec69a](https://github.com/mdn/yari/commit/41ec69abdecbf96033d261598ad21a9b12581f46))
* **macros:** delete {{htmlattrxref}} macro ([#9789](https://github.com/mdn/yari/issues/9789)) ([d640774](https://github.com/mdn/yari/commit/d640774ee23d2e7a056daeb187e5cb8f892ddff0))
* **macros:** delete {{SectionOnPage}} macro ([#9436](https://github.com/mdn/yari/issues/9436)) ([54dce18](https://github.com/mdn/yari/commit/54dce187bcaed195e7e86592c3a3045c558ed26e))
* **redirects:** remove broken redirect rules ([#9762](https://github.com/mdn/yari/issues/9762)) ([ad64ce5](https://github.com/mdn/yari/commit/ad64ce52a5b1058129c1f75d907999a8e1cc5650))
* **telemetry:** measure "Add/edit note" on collection items ([#9850](https://github.com/mdn/yari/issues/9850)) ([47d3686](https://github.com/mdn/yari/commit/47d3686b6cb4e9734e1e40db92a22c72b0dfbf30))

## [2.31.0](https://github.com/mdn/yari/compare/v2.30.0...v2.31.0) (2023-09-22)


### Features

* **glean:** add is_baseline metric to pings ([#9476](https://github.com/mdn/yari/issues/9476)) ([231d6aa](https://github.com/mdn/yari/commit/231d6aab8f1c8efe159d268c261446c5b7ae12d9))


### Bug Fixes

* **client/public:** avoid global variable ([#9619](https://github.com/mdn/yari/issues/9619)) ([47c26df](https://github.com/mdn/yari/commit/47c26df8c646b179599f898d176218fe4dad367f))
* **eslint:** support running in git submodule ([#9578](https://github.com/mdn/yari/issues/9578)) ([c40fb92](https://github.com/mdn/yari/commit/c40fb92112503476b38dbabd6374bad597ff8099))
* **placement:** fix firing multiple impressions ([#9631](https://github.com/mdn/yari/issues/9631)) ([b8da642](https://github.com/mdn/yari/commit/b8da64244b1f148b732e9937aff80d8cdb586d17))


### Miscellaneous

* **banners:** remove unused cta code ([#8872](https://github.com/mdn/yari/issues/8872)) ([063449c](https://github.com/mdn/yari/commit/063449c97109a3fefecb4cb96cd7f5aac120d055))
* **dependabot:** group pip minor/patch updates ([#9687](https://github.com/mdn/yari/issues/9687)) ([80c9cf4](https://github.com/mdn/yari/commit/80c9cf493077da694723235c33a549454ecc1801))
* **deps-dev:** bump @babel/core from 7.22.11 to 7.22.15 ([#9613](https://github.com/mdn/yari/issues/9613)) ([40c9acb](https://github.com/mdn/yari/commit/40c9acbd647d883c30c0acd2272a72e6d8c97f15))
* **deps-dev:** bump @babel/core from 7.22.15 to 7.22.17 ([#9640](https://github.com/mdn/yari/issues/9640)) ([9bed1cc](https://github.com/mdn/yari/commit/9bed1cce9b7d72cc5a65168da2108195f3f43461))
* **deps-dev:** bump @babel/core from 7.22.17 to 7.22.19 ([#9668](https://github.com/mdn/yari/issues/9668)) ([934b7bb](https://github.com/mdn/yari/commit/934b7bbb9303f45f947392abf3f26d8363a47e5c))
* **deps-dev:** bump @babel/core from 7.22.19 to 7.22.20 ([#9684](https://github.com/mdn/yari/issues/9684)) ([86d2bf8](https://github.com/mdn/yari/commit/86d2bf805985f0c64a93d3cdb7dcda2281c11f3a))
* **deps-dev:** bump @babel/eslint-parser from 7.22.11 to 7.22.15 ([#9612](https://github.com/mdn/yari/issues/9612)) ([d1192cc](https://github.com/mdn/yari/commit/d1192cc956b2cb344ce256ae812e2379f4eabb7b))
* **deps-dev:** bump @babel/preset-env from 7.22.10 to 7.22.14 ([#9588](https://github.com/mdn/yari/issues/9588)) ([e4ab1b8](https://github.com/mdn/yari/commit/e4ab1b8da72a561150f8e3f1a4a8cd61fe79f0b9))
* **deps-dev:** bump @babel/preset-env from 7.22.14 to 7.22.15 ([#9611](https://github.com/mdn/yari/issues/9611)) ([fe52e46](https://github.com/mdn/yari/commit/fe52e468ca64d62124d87cf4b2499e2bb16ea6b3))
* **deps-dev:** bump @babel/preset-env from 7.22.15 to 7.22.20 ([#9680](https://github.com/mdn/yari/issues/9680)) ([1147b41](https://github.com/mdn/yari/commit/1147b418df2efd44f5005dd0e3f2cc2210accc9c))
* **deps-dev:** bump @playwright/test from 1.37.1 to 1.38.0 ([#9661](https://github.com/mdn/yari/issues/9661)) ([1d1a9b4](https://github.com/mdn/yari/commit/1d1a9b4bb30b8b1405c841d398e4779d98fd8576))
* **deps-dev:** bump @playwright/test from 1.38.0 to 1.38.1 ([#9712](https://github.com/mdn/yari/issues/9712)) ([357650c](https://github.com/mdn/yari/commit/357650cb894f42ab931559bff52504ce4023f5e5))
* **deps-dev:** bump @supabase/supabase-js from 2.33.1 to 2.33.2 ([#9643](https://github.com/mdn/yari/issues/9643)) ([5192acc](https://github.com/mdn/yari/commit/5192acc214f7fcddb6782054d625d7c8d2b6e82c))
* **deps-dev:** bump @supabase/supabase-js from 2.33.2 to 2.34.0 ([#9698](https://github.com/mdn/yari/issues/9698)) ([bfe19cb](https://github.com/mdn/yari/commit/bfe19cb725e0c0de89f3a602dcf676949462752f))
* **deps-dev:** bump @supabase/supabase-js from 2.34.0 to 2.36.0 ([#9705](https://github.com/mdn/yari/issues/9705)) ([f117a58](https://github.com/mdn/yari/commit/f117a58f152159411f17fe772761009128765795))
* **deps-dev:** bump @types/cli-progress from 3.11.0 to 3.11.1 ([#9610](https://github.com/mdn/yari/issues/9610)) ([8d88356](https://github.com/mdn/yari/commit/8d88356e0d5b6d150f6991ec544eedfdb5606a66))
* **deps-dev:** bump @types/cli-progress from 3.11.1 to 3.11.2 ([#9625](https://github.com/mdn/yari/issues/9625)) ([106a6f4](https://github.com/mdn/yari/commit/106a6f47230caefe7e3ceaa3f550ea34da9f8d42))
* **deps-dev:** bump babel-jest from 29.6.4 to 29.7.0 ([#9651](https://github.com/mdn/yari/issues/9651)) ([910df81](https://github.com/mdn/yari/commit/910df814a9ea4aff68a40f56b30094b7f0878224))
* **deps-dev:** bump black from 23.7.0 to 23.9.1 in /deployer ([#9635](https://github.com/mdn/yari/issues/9635)) ([b17be3f](https://github.com/mdn/yari/commit/b17be3f590ae740c69c27ed9ce3d7135be0bde0c))
* **deps-dev:** bump black from 23.7.0 to 23.9.1 in /testing/integration ([#9637](https://github.com/mdn/yari/issues/9637)) ([4ce6f69](https://github.com/mdn/yari/commit/4ce6f690e9b5453360c439c905f34a6d3aa47720))
* **deps-dev:** bump browserslist from 4.21.10 to 4.21.11 ([#9714](https://github.com/mdn/yari/issues/9714)) ([67ab003](https://github.com/mdn/yari/commit/67ab0037ca65bda7c8dc6cd0d34386abf0f667e3))
* **deps-dev:** bump camelcase from 7.0.1 to 8.0.0 ([#9473](https://github.com/mdn/yari/issues/9473)) ([5237040](https://github.com/mdn/yari/commit/5237040364a00768fc926089365ccc2fc53fc7af))
* **deps-dev:** bump eslint from 8.48.0 to 8.49.0 ([#9641](https://github.com/mdn/yari/issues/9641)) ([76f8d44](https://github.com/mdn/yari/commit/76f8d444e4e112ce49504e09ec9376445a10953e))
* **deps-dev:** bump eslint-plugin-jest from 27.2.3 to 27.4.0 ([#9678](https://github.com/mdn/yari/issues/9678)) ([c92ae09](https://github.com/mdn/yari/commit/c92ae0940d1e0bffcb69c07e6e82e11c19c02c14))
* **deps-dev:** bump html-validate from 8.3.0 to 8.4.0 ([#9638](https://github.com/mdn/yari/issues/9638)) ([bd38165](https://github.com/mdn/yari/commit/bd381656a7c3274c44af96abcf73d04d83224ff4))
* **deps-dev:** bump jest from 29.6.4 to 29.7.0 ([#9649](https://github.com/mdn/yari/issues/9649)) ([06376f7](https://github.com/mdn/yari/commit/06376f7d2ef9ee26b8aebd57debdbcc8482dde26))
* **deps-dev:** bump jest-environment-jsdom from 29.6.4 to 29.7.0 ([#9652](https://github.com/mdn/yari/issues/9652)) ([a7e4348](https://github.com/mdn/yari/commit/a7e4348ee5dc226cb7e5864fd2b299176d1e9709))
* **deps-dev:** bump jest-resolve from 29.6.4 to 29.7.0 ([#9648](https://github.com/mdn/yari/issues/9648)) ([0f1482c](https://github.com/mdn/yari/commit/0f1482c9584c5e44fa2d2f1c0c8d5f634e555778))
* **deps-dev:** bump postcss from 8.4.29 to 8.4.30 ([#9691](https://github.com/mdn/yari/issues/9691)) ([1866b43](https://github.com/mdn/yari/commit/1866b43a5b17cc8f86a3b142f769e37dfc85d6c3))
* **deps-dev:** bump postcss-preset-env from 9.1.2 to 9.1.3 ([#9599](https://github.com/mdn/yari/issues/9599)) ([d406235](https://github.com/mdn/yari/commit/d406235c65448a1f25930728f2bf7d3b8ee8cbb7))
* **deps-dev:** bump postcss-preset-env from 9.1.3 to 9.1.4 ([#9693](https://github.com/mdn/yari/issues/9693)) ([d60e844](https://github.com/mdn/yari/commit/d60e8445fa82a3b7c9e5c9cd8a61f160bd499fed))
* **deps-dev:** bump pytest from 7.4.0 to 7.4.1 in /deployer ([#9605](https://github.com/mdn/yari/issues/9605)) ([6af6523](https://github.com/mdn/yari/commit/6af6523c4e2a902f1c79d243124c36428f4ac1ac))
* **deps-dev:** bump pytest from 7.4.1 to 7.4.2 in /deployer ([#9634](https://github.com/mdn/yari/issues/9634)) ([dfec24b](https://github.com/mdn/yari/commit/dfec24ba35632e97ba5dd7b716f53476639dbdd6))
* **deps-dev:** bump react-router-dom from 6.15.0 to 6.16.0 ([#9658](https://github.com/mdn/yari/issues/9658)) ([850b484](https://github.com/mdn/yari/commit/850b4840d3a02c344796ce6e43157b57e71b4911))
* **deps-dev:** bump resolve from 1.22.4 to 1.22.5 ([#9670](https://github.com/mdn/yari/issues/9670)) ([68c324e](https://github.com/mdn/yari/commit/68c324eaa063082de446cd7245ac66ddf30199b3))
* **deps-dev:** bump resolve from 1.22.5 to 1.22.6 ([#9683](https://github.com/mdn/yari/issues/9683)) ([bbeeb1f](https://github.com/mdn/yari/commit/bbeeb1ff39627b022b393205a7e5dd2a2e52d4d6))
* **deps-dev:** bump sass from 1.66.1 to 1.67.0 ([#9660](https://github.com/mdn/yari/issues/9660)) ([bf57253](https://github.com/mdn/yari/commit/bf5725382a8213df973235020688f13040e1ecd0))
* **deps-dev:** bump sass from 1.67.0 to 1.68.0 ([#9706](https://github.com/mdn/yari/issues/9706)) ([845de9d](https://github.com/mdn/yari/commit/845de9d04ca6e5f0fe4242d15de13d5165c011b8))
* **deps-dev:** bump stylelint-config-recommended-scss from 12.0.0 to 13.0.0 ([#9601](https://github.com/mdn/yari/issues/9601)) ([c547306](https://github.com/mdn/yari/commit/c54730604a7d6882480c2279d17721b006b19af3))
* **deps-dev:** bump stylelint-scss from 5.1.0 to 5.2.0 ([#9669](https://github.com/mdn/yari/issues/9669)) ([fed559f](https://github.com/mdn/yari/commit/fed559f75c98575ddfed86407f8fa0ee60f7c9b6))
* **deps-dev:** bump stylelint-scss from 5.2.0 to 5.2.1 ([#9677](https://github.com/mdn/yari/issues/9677)) ([81cf182](https://github.com/mdn/yari/commit/81cf182cae4dabdc8ff0d5af1307872006d5a03e))
* **deps-dev:** bump the types group with 1 update ([#9675](https://github.com/mdn/yari/issues/9675)) ([1d1dde8](https://github.com/mdn/yari/commit/1d1dde8d4aa7b2e5294c12d8b558aab50fc2ad4f))
* **deps-dev:** bump the types group with 1 update ([#9690](https://github.com/mdn/yari/issues/9690)) ([932f95b](https://github.com/mdn/yari/commit/932f95b6fb7db48682056092138b6f46c0ca5942))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.24 to 2.7.28 in /client/pwa ([#9606](https://github.com/mdn/yari/issues/9606)) ([88afdeb](https://github.com/mdn/yari/commit/88afdeb317f13dbe5b5600ba83bdd23db523bc18))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.28 to 2.7.29 in /client/pwa ([#9616](https://github.com/mdn/yari/issues/9616)) ([540f1fc](https://github.com/mdn/yari/commit/540f1fca60ae61966b3a500caa244977a70472aa))
* **deps:** bump @mdn/browser-compat-data from 5.3.14 to 5.3.15 ([#9644](https://github.com/mdn/yari/issues/9644)) ([b79267f](https://github.com/mdn/yari/commit/b79267f60cac9767ae4f50b0fc7e32c64e37a25d))
* **deps:** bump @mdn/browser-compat-data from 5.3.15 to 5.3.16 ([#9681](https://github.com/mdn/yari/issues/9681)) ([d30f7d5](https://github.com/mdn/yari/commit/d30f7d5421f902ae173e0e879c7c0b74ceae297a))
* **deps:** bump @mdn/browser-compat-data from 5.3.16 to 5.3.17 ([#9700](https://github.com/mdn/yari/issues/9700)) ([e38a5bd](https://github.com/mdn/yari/commit/e38a5bd842a3520779f6749c6b4f9a892a0e6471))
* **deps:** bump @mdn/browser-compat-data from 5.3.17 to 5.3.18 ([#9710](https://github.com/mdn/yari/issues/9710)) ([050b4ae](https://github.com/mdn/yari/commit/050b4ae3f5c95016f31e5b952e9565c7d6e61297))
* **deps:** bump @mozilla/glean from 2.0.1 to 2.0.2 ([#9667](https://github.com/mdn/yari/issues/9667)) ([6a1680a](https://github.com/mdn/yari/commit/6a1680aad8012e380e4f20ade1f9f250919113a0))
* **deps:** bump @sentry/* from 7.63.0 to 7.67.0 ([#9614](https://github.com/mdn/yari/issues/9614)) ([bdef8e9](https://github.com/mdn/yari/commit/bdef8e9e09a57dfc2b9e7ff61b473f72633a95c5))
* **deps:** bump @sentry/* from 7.67.0 to 7.68.0 ([#9620](https://github.com/mdn/yari/issues/9620)) ([7c10c85](https://github.com/mdn/yari/commit/7c10c8582a53b2b2ffd880a3a267fb46a7b9c4ba))
* **deps:** bump @webref/css from 5.4.4 to 6.0.0 ([#9621](https://github.com/mdn/yari/issues/9621)) ([6769c39](https://github.com/mdn/yari/commit/6769c39ea5919ba3ed89913451d60b8802928c96))
* **deps:** bump actions/checkout from 3 to 4 ([#9609](https://github.com/mdn/yari/issues/9609)) ([2b8ea58](https://github.com/mdn/yari/commit/2b8ea58fcb28d86ce35dfb6e6e5694ad2277377e))
* **deps:** bump boto3 from 1.28.35 to 1.28.40 in /deployer ([#9604](https://github.com/mdn/yari/issues/9604)) ([d0b966d](https://github.com/mdn/yari/commit/d0b966d6a1bc903c70ccde44a368b31561d7e2ca))
* **deps:** bump boto3 from 1.28.40 to 1.28.42 in /deployer ([#9622](https://github.com/mdn/yari/issues/9622)) ([036c053](https://github.com/mdn/yari/commit/036c053372bdd004e81570571a95177d17804ada))
* **deps:** bump boto3 from 1.28.42 to 1.28.44 in /deployer ([#9633](https://github.com/mdn/yari/issues/9633)) ([2b343cb](https://github.com/mdn/yari/commit/2b343cbeb286368fdc03201362158aa103d9f189))
* **deps:** bump boto3 from 1.28.44 to 1.28.49 in /deployer ([#9674](https://github.com/mdn/yari/issues/9674)) ([270c069](https://github.com/mdn/yari/commit/270c0695c5ab78a5be555e797ce15e2510176732))
* **deps:** bump certifi from 2022.12.7 to 2023.7.22 in /deployer ([#9686](https://github.com/mdn/yari/issues/9686)) ([f6021d4](https://github.com/mdn/yari/commit/f6021d47358e1a41483e5226e857fe6d10aa034b))
* **deps:** bump certifi from 2022.12.7 to 2023.7.22 in /testing/integration ([#9685](https://github.com/mdn/yari/issues/9685)) ([51e2467](https://github.com/mdn/yari/commit/51e2467ccf119ab698152607acce1ff9f981e41a))
* **deps:** bump cryptography from 41.0.0 to 41.0.3 in /deployer ([#9602](https://github.com/mdn/yari/issues/9602)) ([00fab4d](https://github.com/mdn/yari/commit/00fab4d8069d88682fb4359b53db67759ac24e84))
* **deps:** bump dayjs from 1.11.9 to 1.11.10 ([#9702](https://github.com/mdn/yari/issues/9702)) ([60a64bc](https://github.com/mdn/yari/commit/60a64bc019b80e6d13e3de100b20a97203d11d0a))
* **deps:** bump inquirer from 9.2.10 to 9.2.11 ([#9645](https://github.com/mdn/yari/issues/9645)) ([f02fc39](https://github.com/mdn/yari/commit/f02fc396218499843c3c04fcf2a0ae5784b3e694))
* **deps:** bump pytest from 7.4.0 to 7.4.1 in /testing/integration ([#9603](https://github.com/mdn/yari/issues/9603)) ([ae232da](https://github.com/mdn/yari/commit/ae232da32b40fed4ae6f88cb6d86a64ea8abd2ed))
* **deps:** bump pytest from 7.4.1 to 7.4.2 in /testing/integration ([#9636](https://github.com/mdn/yari/issues/9636)) ([9be6c40](https://github.com/mdn/yari/commit/9be6c40f862f9f3bcb4e43bf0e6e2aaf698bb496))
* **deps:** bump the sentry group with 2 updates ([#9656](https://github.com/mdn/yari/issues/9656)) ([478dc9d](https://github.com/mdn/yari/commit/478dc9dba84176dbf406e1c1af085cd8d13175dc))
* **deps:** bump the sentry group with 2 updates ([#9697](https://github.com/mdn/yari/issues/9697)) ([171432d](https://github.com/mdn/yari/commit/171432da029d73e091968f7a638b743e57bfadd5))
* **deps:** bump web-specs from 2.66.0 to 2.67.0 ([#9618](https://github.com/mdn/yari/issues/9618)) ([f9bc331](https://github.com/mdn/yari/commit/f9bc3319b78d0c2df568a217d87e1c4a50a90acd))
* **deps:** bump web-specs from 2.67.0 to 2.68.0 ([#9701](https://github.com/mdn/yari/issues/9701)) ([bfe8d3d](https://github.com/mdn/yari/commit/bfe8d3d8d188f82e7de0e209d483a04060888458))
* **glean:** renew metrics ([#9592](https://github.com/mdn/yari/issues/9592)) ([0fd72d0](https://github.com/mdn/yari/commit/0fd72d0f5912b6064d61761e0db1931fd5ca1e7d))
* **menu:** remove playground new tag ([#9629](https://github.com/mdn/yari/issues/9629)) ([f2ed581](https://github.com/mdn/yari/commit/f2ed5816bfb59c48b60868b2e78338c9dac106cc))
* **plus:** prepare account rebranding ([#9708](https://github.com/mdn/yari/issues/9708)) ([19b5f89](https://github.com/mdn/yari/commit/19b5f89368485e8bc5100b47e49b8097cf39ecc0))

## [2.30.0](https://github.com/mdn/yari/compare/v2.29.0...v2.30.0) (2023-08-30)


### Features

* **ai-help:** add syntax highlighting for code examples ([#9510](https://github.com/mdn/yari/issues/9510)) ([e9f49cd](https://github.com/mdn/yari/commit/e9f49cd51f9ef50cca3da5d69bf3e596d9715424))


### Bug Fixes

* **ai-help:** nonsense prepended when copying message ([#9484](https://github.com/mdn/yari/issues/9484)) ([117f5bf](https://github.com/mdn/yari/commit/117f5bf3b88db498c5fb0160a5fc988570810908))
* **glean:** fix url metrics ([#9516](https://github.com/mdn/yari/issues/9516)) ([f962258](https://github.com/mdn/yari/commit/f962258b33fe7dbfcd9235a7a1e754b552f1385a))


### Miscellaneous

* **ai-help:** make feedback link external ([#9511](https://github.com/mdn/yari/issues/9511)) ([b73eef0](https://github.com/mdn/yari/commit/b73eef07234ed61a09e9fe00e60e6ca9e0f38fdb))
* **ai-help:** use private repo for internal feedback ([#9506](https://github.com/mdn/yari/issues/9506)) ([77585e7](https://github.com/mdn/yari/commit/77585e7cce221e82af1f51ac49e74fb27432a528))
* **deps-dev:** bump @babel/core from 7.22.10 to 7.22.11 ([#9553](https://github.com/mdn/yari/issues/9553)) ([58abe5c](https://github.com/mdn/yari/commit/58abe5ce2613620deb6f604a3a87db18d9492d14))
* **deps-dev:** bump @babel/eslint-parser from 7.22.10 to 7.22.11 ([#9551](https://github.com/mdn/yari/issues/9551)) ([b7f6022](https://github.com/mdn/yari/commit/b7f6022a2649ac60c25a88c72d12ec527b0ebfec))
* **deps-dev:** bump @playwright/test from 1.36.2 to 1.37.0 ([#9482](https://github.com/mdn/yari/issues/9482)) ([9acac73](https://github.com/mdn/yari/commit/9acac73ca8a28e16908198dfafd70d6d255037ad))
* **deps-dev:** bump @playwright/test from 1.37.0 to 1.37.1 ([#9512](https://github.com/mdn/yari/issues/9512)) ([fa500a5](https://github.com/mdn/yari/commit/fa500a5776b46801eb535f1a262fb48ab8246264))
* **deps-dev:** bump @pmmmwh/react-refresh-webpack-plugin from 0.5.10 to 0.5.11 ([#9498](https://github.com/mdn/yari/issues/9498)) ([e09ed3b](https://github.com/mdn/yari/commit/e09ed3bc39900f500a02e6a29d335926e0673d09))
* **deps-dev:** bump @supabase/supabase-js from 2.32.0 to 2.33.0 ([#9530](https://github.com/mdn/yari/issues/9530)) ([b4a79fa](https://github.com/mdn/yari/commit/b4a79fa23c5bd874c350dc1453cfc1ab7532572c))
* **deps-dev:** bump @supabase/supabase-js from 2.33.0 to 2.33.1 ([#9538](https://github.com/mdn/yari/issues/9538)) ([ac4c916](https://github.com/mdn/yari/commit/ac4c916784d951664e2943aa800a9ce497d4727b))
* **deps-dev:** bump @svgr/webpack from 8.0.1 to 8.1.0 ([#9497](https://github.com/mdn/yari/issues/9497)) ([5b37beb](https://github.com/mdn/yari/commit/5b37beb2797f0936490782c19ee661f4eee527b0))
* **deps-dev:** bump @swc/core from 1.3.74 to 1.3.76 ([#9472](https://github.com/mdn/yari/issues/9472)) ([7fa71ff](https://github.com/mdn/yari/commit/7fa71ff2b31fec656879770a57a52ae9c0a9c2f6))
* **deps-dev:** bump @swc/core from 1.3.76 to 1.3.77 ([#9502](https://github.com/mdn/yari/issues/9502)) ([f049ab3](https://github.com/mdn/yari/commit/f049ab3578a5b4f1b64637b8b9f34fe221d1e261))
* **deps-dev:** bump @swc/core from 1.3.77 to 1.3.78 ([#9513](https://github.com/mdn/yari/issues/9513)) ([0e692c9](https://github.com/mdn/yari/commit/0e692c9d19ad52b7d4d353653e47c2deca8a3f18))
* **deps-dev:** bump @swc/core from 1.3.78 to 1.3.79 ([#9554](https://github.com/mdn/yari/issues/9554)) ([923abb3](https://github.com/mdn/yari/commit/923abb3b928ec39736e1fd1a7747d2b89bba3169))
* **deps-dev:** bump @swc/core from 1.3.79 to 1.3.80 ([#9562](https://github.com/mdn/yari/issues/9562)) ([afcf585](https://github.com/mdn/yari/commit/afcf585592ac50c18be254451a714825df0271a7))
* **deps-dev:** bump @types/jest from 29.5.3 to 29.5.4 ([#9539](https://github.com/mdn/yari/issues/9539)) ([e9ffa21](https://github.com/mdn/yari/commit/e9ffa215ac549c5e248900c533746ed4b2cfadad))
* **deps-dev:** bump @types/react from 18.2.19 to 18.2.20 ([#9471](https://github.com/mdn/yari/issues/9471)) ([36b894c](https://github.com/mdn/yari/commit/36b894cb8fd7e3e7e55220c32bf58ce3e554b882))
* **deps-dev:** bump @types/react from 18.2.20 to 18.2.21 ([#9540](https://github.com/mdn/yari/issues/9540)) ([6bc317a](https://github.com/mdn/yari/commit/6bc317a734dcc57f3c467ec72d28c618aa38b3d7))
* **deps-dev:** bump babel-jest from 29.6.2 to 29.6.3 ([#9531](https://github.com/mdn/yari/issues/9531)) ([22389de](https://github.com/mdn/yari/commit/22389de5b849a7e2eb52f2d9d0ca877bb1e556d6))
* **deps-dev:** bump babel-jest from 29.6.3 to 29.6.4 ([#9547](https://github.com/mdn/yari/issues/9547)) ([c527a45](https://github.com/mdn/yari/commit/c527a4544ca5318f6403dd733c6cf537d1ca81d4))
* **deps-dev:** bump eslint from 8.46.0 to 8.47.0 ([#9494](https://github.com/mdn/yari/issues/9494)) ([7c59989](https://github.com/mdn/yari/commit/7c5998957da04549503c7230424f579f15f08209))
* **deps-dev:** bump eslint from 8.47.0 to 8.48.0 ([#9568](https://github.com/mdn/yari/issues/9568)) ([c2ed16a](https://github.com/mdn/yari/commit/c2ed16ad62d44592e71be9ea0433e63e351a7ca3))
* **deps-dev:** bump eslint-plugin-import from 2.28.0 to 2.28.1 ([#9523](https://github.com/mdn/yari/issues/9523)) ([a49bc15](https://github.com/mdn/yari/commit/a49bc158562a28a6b7f1eb173a4e7e5a9a28bf16))
* **deps-dev:** bump eslint-plugin-react from 7.33.1 to 7.33.2 ([#9503](https://github.com/mdn/yari/issues/9503)) ([70975cc](https://github.com/mdn/yari/commit/70975cce6a16cefb4821fc8ae2225bc4b0226653))
* **deps-dev:** bump html-validate from 8.2.0 to 8.3.0 ([#9522](https://github.com/mdn/yari/issues/9522)) ([cec9e01](https://github.com/mdn/yari/commit/cec9e01258e091b8cab6b0ad4bce7724da25f2e7))
* **deps-dev:** bump jest from 29.6.2 to 29.6.3 ([#9533](https://github.com/mdn/yari/issues/9533)) ([b2dbd58](https://github.com/mdn/yari/commit/b2dbd58c25e646c62326f90a200d529f83dd9bab))
* **deps-dev:** bump jest from 29.6.3 to 29.6.4 ([#9546](https://github.com/mdn/yari/issues/9546)) ([1452d48](https://github.com/mdn/yari/commit/1452d48fc5c310d8953d6692a3bc35787c9b51d4))
* **deps-dev:** bump jest-environment-jsdom from 29.6.2 to 29.6.3 ([#9534](https://github.com/mdn/yari/issues/9534)) ([bb8110d](https://github.com/mdn/yari/commit/bb8110d1933f1d4e81619b269d66a426abfa78dc))
* **deps-dev:** bump jest-environment-jsdom from 29.6.3 to 29.6.4 ([#9543](https://github.com/mdn/yari/issues/9543)) ([9738525](https://github.com/mdn/yari/commit/9738525982d5019bfc7fd6dacc9dca16bbfb6685))
* **deps-dev:** bump jest-resolve from 29.6.2 to 29.6.3 ([#9532](https://github.com/mdn/yari/issues/9532)) ([0a5b01e](https://github.com/mdn/yari/commit/0a5b01eff32041213abd2e33d06b90090128e4d3))
* **deps-dev:** bump jest-resolve from 29.6.3 to 29.6.4 ([#9544](https://github.com/mdn/yari/issues/9544)) ([6a7cacb](https://github.com/mdn/yari/commit/6a7cacb53dca436bdb9abfb2003487a7e73e9eed))
* **deps-dev:** bump postcss from 8.4.27 to 8.4.28 ([#9501](https://github.com/mdn/yari/issues/9501)) ([9e29236](https://github.com/mdn/yari/commit/9e292368a66a5e622f03bd500dddf34e7c0d5a59))
* **deps-dev:** bump postcss from 8.4.28 to 8.4.29 ([#9584](https://github.com/mdn/yari/issues/9584)) ([61c0d2e](https://github.com/mdn/yari/commit/61c0d2ef1f0def169ed8513785d0a511db8874d9))
* **deps-dev:** bump postcss-preset-env from 9.1.1 to 9.1.2 ([#9567](https://github.com/mdn/yari/issues/9567)) ([b9e5677](https://github.com/mdn/yari/commit/b9e5677c5da85905cbaa25a79c1e49e56a690645))
* **deps-dev:** bump prettier from 3.0.1 to 3.0.2 ([#9500](https://github.com/mdn/yari/issues/9500)) ([2e55aab](https://github.com/mdn/yari/commit/2e55aab442fcaaae9142a38fbe457e24503bed4c))
* **deps-dev:** bump prettier from 3.0.2 to 3.0.3 ([#9580](https://github.com/mdn/yari/issues/9580)) ([8a674eb](https://github.com/mdn/yari/commit/8a674eb83871e0a0e2598ac54d34db0b6fe61cdf))
* **deps-dev:** bump react-router-dom from 6.14.2 to 6.15.0 ([#9480](https://github.com/mdn/yari/issues/9480)) ([19b2684](https://github.com/mdn/yari/commit/19b2684923c61f27e6f8b48b5c4b5cf75f994662))
* **deps-dev:** bump sass from 1.64.2 to 1.65.1 ([#9470](https://github.com/mdn/yari/issues/9470)) ([e547cc5](https://github.com/mdn/yari/commit/e547cc5a05964909b987035de821ef5ef704a70e))
* **deps-dev:** bump sass from 1.65.1 to 1.66.0 ([#9515](https://github.com/mdn/yari/issues/9515)) ([59ab4be](https://github.com/mdn/yari/commit/59ab4be0199997b0c76e38e2509418e98448ee5c))
* **deps-dev:** bump sass from 1.66.0 to 1.66.1 ([#9527](https://github.com/mdn/yari/issues/9527)) ([ba488df](https://github.com/mdn/yari/commit/ba488df8eee8a4596c86aa31f56f3d0735acdfe2))
* **deps-dev:** bump stylelint from 15.10.2 to 15.10.3 ([#9520](https://github.com/mdn/yari/issues/9520)) ([a1c9f1a](https://github.com/mdn/yari/commit/a1c9f1aee3ae4df485c860275ef6cb4ee35537c8))
* **deps-dev:** bump swr from 2.2.0 to 2.2.1 ([#9489](https://github.com/mdn/yari/issues/9489)) ([d07a245](https://github.com/mdn/yari/commit/d07a2456c18aa69286ec60dcb3e38253987584c9))
* **deps-dev:** bump swr from 2.2.1 to 2.2.2 ([#9564](https://github.com/mdn/yari/issues/9564)) ([f8e2515](https://github.com/mdn/yari/commit/f8e251549e4b638b30efb5204c3345d248729f38))
* **deps-dev:** bump typescript from 5.1.6 to 5.2.2 in /client/pwa ([#9550](https://github.com/mdn/yari/issues/9550)) ([bf35eb8](https://github.com/mdn/yari/commit/bf35eb8043bb5bb16ff6b93d5b6d71331d438702))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.22 to 2.7.23 in /client/pwa ([#9475](https://github.com/mdn/yari/issues/9475)) ([9565dea](https://github.com/mdn/yari/commit/9565dea0bec771591ea1e370ba1ea25e584329b8))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.23 to 2.7.24 in /client/pwa ([#9483](https://github.com/mdn/yari/issues/9483)) ([886b2c8](https://github.com/mdn/yari/commit/886b2c8090af69467d31caef77fb446831f6acdd))
* **deps:** bump @caporal/core from 2.0.2 to 2.0.7 ([#9573](https://github.com/mdn/yari/issues/9573)) ([2514929](https://github.com/mdn/yari/commit/2514929546d4efe95eae46b12d8630d6ce6f8095))
* **deps:** bump @codemirror/lang-html from 6.4.5 to 6.4.6 ([#9575](https://github.com/mdn/yari/issues/9575)) ([5a49794](https://github.com/mdn/yari/commit/5a49794e214121095c4cfa610093e56b690b61f7))
* **deps:** bump @codemirror/lang-javascript from 6.1.9 to 6.2.0 ([#9566](https://github.com/mdn/yari/issues/9566)) ([a6de79c](https://github.com/mdn/yari/commit/a6de79ca8e69239e532f995c6bd15e0bb2d19c41))
* **deps:** bump @codemirror/lang-javascript from 6.2.0 to 6.2.1 ([#9577](https://github.com/mdn/yari/issues/9577)) ([4aec0c7](https://github.com/mdn/yari/commit/4aec0c74012beddb25a379de0cb47f861f7dd1ac))
* **deps:** bump @mdn/browser-compat-data from 5.3.10 to 5.3.11 ([#9521](https://github.com/mdn/yari/issues/9521)) ([4766cc3](https://github.com/mdn/yari/commit/4766cc3b54c3e998e8871a457846a481df3f8760))
* **deps:** bump @mdn/browser-compat-data from 5.3.11 to 5.3.12 ([#9537](https://github.com/mdn/yari/issues/9537)) ([efa43f3](https://github.com/mdn/yari/commit/efa43f38ddd9c812b3a246c6e46d3dd1d8181b2e))
* **deps:** bump @mdn/browser-compat-data from 5.3.12 to 5.3.13 ([#9569](https://github.com/mdn/yari/issues/9569)) ([88bf17f](https://github.com/mdn/yari/commit/88bf17fad7a2c223e468113a7154db0231e4f8ec))
* **deps:** bump @mdn/browser-compat-data from 5.3.13 to 5.3.14 ([#9582](https://github.com/mdn/yari/issues/9582)) ([5829c19](https://github.com/mdn/yari/commit/5829c19ae5424e9161ba09e0566834b2aa086101))
* **deps:** bump @mdn/browser-compat-data from 5.3.8 to 5.3.9 ([#9491](https://github.com/mdn/yari/issues/9491)) ([f77c6c1](https://github.com/mdn/yari/commit/f77c6c17ab4e8aa79b7bb6698aa486a1b644ee58))
* **deps:** bump @mdn/browser-compat-data from 5.3.9 to 5.3.10 ([#9504](https://github.com/mdn/yari/issues/9504)) ([1712031](https://github.com/mdn/yari/commit/171203131fd5a0680927d9b58612b0107e36b7cb))
* **deps:** bump @sentry/integrations from 7.62.0 to 7.63.0 ([#9479](https://github.com/mdn/yari/issues/9479)) ([65fc7f3](https://github.com/mdn/yari/commit/65fc7f3ede11dae51981bf879836fa26fcb704c3))
* **deps:** bump @sentry/node from 7.62.0 to 7.63.0 ([#9478](https://github.com/mdn/yari/issues/9478)) ([8c0f7a4](https://github.com/mdn/yari/commit/8c0f7a4f34cb0776473969b5650b2c44089153f4))
* **deps:** bump boto3 from 1.28.20 to 1.28.25 in /deployer ([#9487](https://github.com/mdn/yari/issues/9487)) ([c33610e](https://github.com/mdn/yari/commit/c33610e2bda1dc13e882b54620405b025526342d))
* **deps:** bump boto3 from 1.28.25 to 1.28.30 in /deployer ([#9528](https://github.com/mdn/yari/issues/9528)) ([924565a](https://github.com/mdn/yari/commit/924565a0809a81c208b39dd7e7b95d3df4f632f1))
* **deps:** bump boto3 from 1.28.30 to 1.28.35 in /deployer ([#9570](https://github.com/mdn/yari/issues/9570)) ([fb8234f](https://github.com/mdn/yari/commit/fb8234f0055c095f5ba23e4d61eb44e1be68a861))
* **deps:** bump click from 8.1.6 to 8.1.7 in /deployer ([#9529](https://github.com/mdn/yari/issues/9529)) ([c0899fb](https://github.com/mdn/yari/commit/c0899fb9d74d32658bfee200a3d52c0b205e3575))
* **deps:** bump fdir from 6.0.2 to 6.1.0 ([#9495](https://github.com/mdn/yari/issues/9495)) ([d0943e7](https://github.com/mdn/yari/commit/d0943e79b4d2372e761ff063cc2a97e57495a908))
* **deps:** bump lru-cache from 10.0.0 to 10.0.1 ([#9481](https://github.com/mdn/yari/issues/9481)) ([729ff13](https://github.com/mdn/yari/commit/729ff1399decfa8cef06cf89c0cc688130f7ed3f))
* **deps:** bump mdn-data from 2.0.32 to 2.0.33 ([#9519](https://github.com/mdn/yari/issues/9519)) ([2f1dd00](https://github.com/mdn/yari/commit/2f1dd00f2bb4d69c9d8393c7c9d44e0dc43bbb3a))
* **deps:** bump mdn-data from 2.0.33 to 2.1.0 ([#9583](https://github.com/mdn/yari/issues/9583)) ([09da070](https://github.com/mdn/yari/commit/09da070f299a42a4929d9ee1a4ba57ca6de43dd0))
* **deps:** bump open-editor from 4.1.0 to 4.1.1 ([#9563](https://github.com/mdn/yari/issues/9563)) ([db34a2b](https://github.com/mdn/yari/commit/db34a2b52d24dcc4bd61fc4a412dc5f4d6e21828))
* **deps:** bump rehype-stringify from 9.0.3 to 9.0.4 ([#9507](https://github.com/mdn/yari/issues/9507)) ([58f9052](https://github.com/mdn/yari/commit/58f9052b92e964657ba33dd2e40eed298053eca6))
* **deps:** bump web-specs from 2.65.0 to 2.66.0 ([#9559](https://github.com/mdn/yari/issues/9559)) ([05a59e7](https://github.com/mdn/yari/commit/05a59e7d2fa2e24e265d48f63ee7a17b240de3be))
* **deps:** upgrade to glean 2.x ([#9509](https://github.com/mdn/yari/issues/9509)) ([098c5a3](https://github.com/mdn/yari/commit/098c5a3140691501e4022388955924b281f2ecfe))
* **glean:** migrate to using data-glean everywhere ([#9496](https://github.com/mdn/yari/issues/9496)) ([bd99229](https://github.com/mdn/yari/commit/bd9922925f9ed1c97c2ed6b0abef84b86c539119))
* **language-menu:** use proper &lt;a&gt; tags ([#9505](https://github.com/mdn/yari/issues/9505)) ([af58be3](https://github.com/mdn/yari/commit/af58be3bd60fe4b169e585dd04dba0b81115091a))
* update .nvmrc ([#9518](https://github.com/mdn/yari/issues/9518)) ([02a19a6](https://github.com/mdn/yari/commit/02a19a6035533f065a4a4ce60f094aca740c6031))

## [2.29.0](https://github.com/mdn/yari/compare/v2.28.4...v2.29.0) (2023-08-10)


### Features

* **docs:** add LaTeX syntax highlighting ([#9366](https://github.com/mdn/yari/issues/9366)) ([bea1c54](https://github.com/mdn/yari/commit/bea1c542019f57e73086601bac66f8f57ab94b38))
* **npm:** add yari-build-blog command ([#9468](https://github.com/mdn/yari/issues/9468)) ([9414524](https://github.com/mdn/yari/commit/941452496a8a0df411403713a91f0b5dbf709c0d))
* **prism:** enable Nginx syntax highlighting ([#9419](https://github.com/mdn/yari/issues/9419)) ([e52f10e](https://github.com/mdn/yari/commit/e52f10e2d95d1479172f014858bc58aec1f80f26))


### Bug Fixes

* **signup-link:** clicking led to 404 ([#9390](https://github.com/mdn/yari/issues/9390)) ([24bdfe2](https://github.com/mdn/yari/commit/24bdfe2e35eb6a604a7a374ff644316f440ee7cd))


### Enhancements

* **signup:** replace "Get MDN Plus" with "Sign up for free" ([#9357](https://github.com/mdn/yari/issues/9357)) ([2abbeba](https://github.com/mdn/yari/commit/2abbeba53717d0b47edc38c483d3b5aeb0c6ee04))


### Miscellaneous

* **baseline:** add glean metrics ([#9391](https://github.com/mdn/yari/issues/9391)) ([2843109](https://github.com/mdn/yari/commit/284310954ff5dd9f3e0c4ed329ce0efa2dc0a7ca))
* **deps-dev:** bump @babel/core from 7.22.9 to 7.22.10 ([#9457](https://github.com/mdn/yari/issues/9457)) ([74cf94b](https://github.com/mdn/yari/commit/74cf94b73de13986ce730ecd74f2c5eaa59f9c81))
* **deps-dev:** bump @babel/eslint-parser from 7.22.9 to 7.22.10 ([#9461](https://github.com/mdn/yari/issues/9461)) ([0d3c74d](https://github.com/mdn/yari/commit/0d3c74d3c10bb90136958213c76a3cb1d237007e))
* **deps-dev:** bump @babel/preset-env from 7.22.9 to 7.22.10 ([#9462](https://github.com/mdn/yari/issues/9462)) ([51cac03](https://github.com/mdn/yari/commit/51cac03b9ea9e62634147824c19abd5789268b12))
* **deps-dev:** bump @playwright/test from 1.36.1 to 1.36.2 ([#9383](https://github.com/mdn/yari/issues/9383)) ([64cd7f3](https://github.com/mdn/yari/commit/64cd7f3854453b79c97f5a17a330480205f5f779))
* **deps-dev:** bump @supabase/supabase-js from 2.26.0 to 2.29.0 ([#9371](https://github.com/mdn/yari/issues/9371)) ([690cbe4](https://github.com/mdn/yari/commit/690cbe48be67194c9bf703fae27a5e610b182ef8))
* **deps-dev:** bump @supabase/supabase-js from 2.29.0 to 2.30.0 ([#9386](https://github.com/mdn/yari/issues/9386)) ([307328b](https://github.com/mdn/yari/commit/307328bc6bab2c9f31cfebf83342a7651b55ef0d))
* **deps-dev:** bump @supabase/supabase-js from 2.30.0 to 2.31.0 ([#9400](https://github.com/mdn/yari/issues/9400)) ([9b3efc4](https://github.com/mdn/yari/commit/9b3efc4384c5e95167fed7fd72d7c9d39456b659))
* **deps-dev:** bump @supabase/supabase-js from 2.31.0 to 2.32.0 ([#9448](https://github.com/mdn/yari/issues/9448)) ([6309b3a](https://github.com/mdn/yari/commit/6309b3a211cc90ebdf8cd7bd47a56a74290fead6))
* **deps-dev:** bump @swc/core from 1.3.70 to 1.3.71 ([#9382](https://github.com/mdn/yari/issues/9382)) ([50951df](https://github.com/mdn/yari/commit/50951dff01449e3ce3777b1bf9559de78ec7d087))
* **deps-dev:** bump @swc/core from 1.3.71 to 1.3.72 ([#9415](https://github.com/mdn/yari/issues/9415)) ([dd73fef](https://github.com/mdn/yari/commit/dd73fef1ed5033121e9cdfd9a1c19a043d693cbd))
* **deps-dev:** bump @swc/core from 1.3.72 to 1.3.73 ([#9427](https://github.com/mdn/yari/issues/9427)) ([99aeb77](https://github.com/mdn/yari/commit/99aeb77091a7913ea4bcab67a365376847415d29))
* **deps-dev:** bump @swc/core from 1.3.73 to 1.3.74 ([#9435](https://github.com/mdn/yari/issues/9435)) ([8835882](https://github.com/mdn/yari/commit/883588240aedc2be3b2769a8083b43bb622210ba))
* **deps-dev:** bump @types/react from 18.2.15 to 18.2.16 ([#9380](https://github.com/mdn/yari/issues/9380)) ([b587d67](https://github.com/mdn/yari/commit/b587d676da050a4f784fedcbe90e2fd6610e3d4d))
* **deps-dev:** bump @types/react from 18.2.16 to 18.2.17 ([#9394](https://github.com/mdn/yari/issues/9394)) ([8adcc68](https://github.com/mdn/yari/commit/8adcc6843ac65853f918e314665a9e4f16f4e7d3))
* **deps-dev:** bump @types/react from 18.2.17 to 18.2.18 ([#9424](https://github.com/mdn/yari/issues/9424)) ([9c072fa](https://github.com/mdn/yari/commit/9c072faf6e87150a67098fa1f9608fe4d12e35f8))
* **deps-dev:** bump @types/react from 18.2.18 to 18.2.19 ([#9459](https://github.com/mdn/yari/issues/9459)) ([11be7f2](https://github.com/mdn/yari/commit/11be7f2c487514f9896a901a9c5fa04c8cd782ea))
* **deps-dev:** bump babel-jest from 29.6.1 to 29.6.2 ([#9397](https://github.com/mdn/yari/issues/9397)) ([b4fa6a9](https://github.com/mdn/yari/commit/b4fa6a918e899350ab8924fde4e20208010e7f39))
* **deps-dev:** bump browserslist from 4.21.9 to 4.21.10 ([#9416](https://github.com/mdn/yari/issues/9416)) ([afec285](https://github.com/mdn/yari/commit/afec2853ff2c9f013bf2244da74e6d32dd455581))
* **deps-dev:** bump eslint from 8.45.0 to 8.46.0 ([#9414](https://github.com/mdn/yari/issues/9414)) ([cf3f0c8](https://github.com/mdn/yari/commit/cf3f0c867a8be585acfa3892042e505153052935))
* **deps-dev:** bump eslint-plugin-import from 2.27.5 to 2.28.0 ([#9403](https://github.com/mdn/yari/issues/9403)) ([e4de45d](https://github.com/mdn/yari/commit/e4de45d36ad17ecad6c6620c45288e1c511ecd9c))
* **deps-dev:** bump eslint-plugin-react from 7.33.0 to 7.33.1 ([#9412](https://github.com/mdn/yari/issues/9412)) ([8dd1e33](https://github.com/mdn/yari/commit/8dd1e33ccc73f4b06f383b198e4591297e6b961d))
* **deps-dev:** bump eslint-plugin-unicorn from 48.0.0 to 48.0.1 ([#9388](https://github.com/mdn/yari/issues/9388)) ([f5c09b1](https://github.com/mdn/yari/commit/f5c09b14753a48701ab4ca923bdbb2dd03cd7f76))
* **deps-dev:** bump flake8 from 6.0.0 to 6.1.0 in /deployer ([#9413](https://github.com/mdn/yari/issues/9413)) ([9a34047](https://github.com/mdn/yari/commit/9a34047376858770277d442d83b48dfe03903b33))
* **deps-dev:** bump flake8 from 6.0.0 to 6.1.0 in /testing/integration ([#9418](https://github.com/mdn/yari/issues/9418)) ([f78b51c](https://github.com/mdn/yari/commit/f78b51c80cbe760e80620c2890723a0b7f1db5fd))
* **deps-dev:** bump html-validate from 8.0.5 to 8.1.0 ([#9372](https://github.com/mdn/yari/issues/9372)) ([adef74d](https://github.com/mdn/yari/commit/adef74dd7900e4232e44e579ff7d317f2037543c))
* **deps-dev:** bump html-validate from 8.1.0 to 8.2.0 ([#9458](https://github.com/mdn/yari/issues/9458)) ([703105b](https://github.com/mdn/yari/commit/703105b4c42e937fdf489dbbeca4a03d95830d9b))
* **deps-dev:** bump jest from 29.6.1 to 29.6.2 ([#9395](https://github.com/mdn/yari/issues/9395)) ([d3a0a5a](https://github.com/mdn/yari/commit/d3a0a5a0be5a98e33b4f2ce7cef33060e4674312))
* **deps-dev:** bump jest-environment-jsdom from 29.6.1 to 29.6.2 ([#9398](https://github.com/mdn/yari/issues/9398)) ([e6c8def](https://github.com/mdn/yari/commit/e6c8deff2e366daece830a413bbe007d5caa7df8))
* **deps-dev:** bump jest-resolve from 29.6.1 to 29.6.2 ([#9399](https://github.com/mdn/yari/issues/9399)) ([d14803b](https://github.com/mdn/yari/commit/d14803bede3ca304c7b319dfa9c382d93f851adc))
* **deps-dev:** bump postcss from 8.4.26 to 8.4.27 ([#9368](https://github.com/mdn/yari/issues/9368)) ([d67949a](https://github.com/mdn/yari/commit/d67949a5463660904c9125dbd5c249d633fbb9ad))
* **deps-dev:** bump postcss-preset-env from 9.0.0 to 9.1.0 ([#9381](https://github.com/mdn/yari/issues/9381)) ([9073be3](https://github.com/mdn/yari/commit/9073be378e9b49c7fefbfdedfaa1f36579ff7966))
* **deps-dev:** bump postcss-preset-env from 9.1.0 to 9.1.1 ([#9452](https://github.com/mdn/yari/issues/9452)) ([2de57bb](https://github.com/mdn/yari/commit/2de57bb8a556477e449ad7596795852d9524b386))
* **deps-dev:** bump prettier from 3.0.0 to 3.0.1 ([#9434](https://github.com/mdn/yari/issues/9434)) ([650ad9c](https://github.com/mdn/yari/commit/650ad9cd4d13c107576ed31caea81d017126b022))
* **deps-dev:** bump resolve from 1.22.3 to 1.22.4 ([#9451](https://github.com/mdn/yari/issues/9451)) ([dc9b506](https://github.com/mdn/yari/commit/dc9b50668d20eb4d63322fffe36f47da71373192))
* **deps-dev:** bump sass from 1.64.0 to 1.64.1 ([#9369](https://github.com/mdn/yari/issues/9369)) ([d18ac68](https://github.com/mdn/yari/commit/d18ac6816c77cb7ddfd9785981193f77cc723694))
* **deps-dev:** bump sass from 1.64.1 to 1.64.2 ([#9421](https://github.com/mdn/yari/issues/9421)) ([915c05d](https://github.com/mdn/yari/commit/915c05d52f5c589ceb7fe75997762bcb530acd51))
* **deps-dev:** bump stylelint-prettier from 4.0.0 to 4.0.1 ([#9401](https://github.com/mdn/yari/issues/9401)) ([01cd900](https://github.com/mdn/yari/commit/01cd9000e517782ab4507391ae096b80c1621844))
* **deps-dev:** bump stylelint-prettier from 4.0.1 to 4.0.2 ([#9402](https://github.com/mdn/yari/issues/9402)) ([fb768ee](https://github.com/mdn/yari/commit/fb768eebeb2e13977f8f8353a035aa903106ca4a))
* **deps-dev:** bump stylelint-scss from 5.0.1 to 5.1.0 ([#9466](https://github.com/mdn/yari/issues/9466)) ([5457ea2](https://github.com/mdn/yari/commit/5457ea2abbbba22a96e8b2cfc958c312d7534d91))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.20 to 2.7.21 in /client/pwa ([#9456](https://github.com/mdn/yari/issues/9456)) ([e524911](https://github.com/mdn/yari/commit/e524911a7af91b73bdc2ca3f8acf99955a424c94))
* **deps:** bump [@zip](https://github.com/zip).js/zip.js from 2.7.21 to 2.7.22 in /client/pwa ([#9467](https://github.com/mdn/yari/issues/9467)) ([7032c39](https://github.com/mdn/yari/commit/7032c39f419953427a9f1e00364c42bd6c622dca))
* **deps:** bump @codemirror/lang-css from 6.2.0 to 6.2.1 ([#9454](https://github.com/mdn/yari/issues/9454)) ([fe57e28](https://github.com/mdn/yari/commit/fe57e285f3737d439a98fe76dffb4978484c8ae0))
* **deps:** bump @mdn/browser-compat-data from 5.3.4 to 5.3.5 ([#9370](https://github.com/mdn/yari/issues/9370)) ([f9d6129](https://github.com/mdn/yari/commit/f9d6129d6d9c3002eadd1d8fa3dc8c81f4b84b23))
* **deps:** bump @mdn/browser-compat-data from 5.3.5 to 5.3.6 ([#9387](https://github.com/mdn/yari/issues/9387)) ([508de8c](https://github.com/mdn/yari/commit/508de8ce7e9c879b758b58c425a33e5d31471cd4))
* **deps:** bump @mdn/browser-compat-data from 5.3.6 to 5.3.7 ([#9431](https://github.com/mdn/yari/issues/9431)) ([bb4d297](https://github.com/mdn/yari/commit/bb4d297be2dc566f188bcb65e5a2f3e80fc04f8b))
* **deps:** bump @mdn/browser-compat-data from 5.3.7 to 5.3.8 ([#9449](https://github.com/mdn/yari/issues/9449)) ([893e871](https://github.com/mdn/yari/commit/893e871a36ad8e196bf49298df442e04c67c0757))
* **deps:** bump @sentry/integrations from 7.60.0 to 7.60.1 ([#9393](https://github.com/mdn/yari/issues/9393)) ([7ba941d](https://github.com/mdn/yari/commit/7ba941d53ae4afed5a23252bbd2e6cf96306822e))
* **deps:** bump @sentry/integrations from 7.60.1 to 7.61.0 ([#9426](https://github.com/mdn/yari/issues/9426)) ([7e2231b](https://github.com/mdn/yari/commit/7e2231b2b529ca4d42cbf8c0aff6804f0216a070))
* **deps:** bump @sentry/integrations from 7.61.0 to 7.61.1 ([#9438](https://github.com/mdn/yari/issues/9438)) ([63c0859](https://github.com/mdn/yari/commit/63c0859d02bfba940fec7497b81ee9ca17cbfedd))
* **deps:** bump @sentry/integrations from 7.61.1 to 7.62.0 ([#9464](https://github.com/mdn/yari/issues/9464)) ([1d6e6da](https://github.com/mdn/yari/commit/1d6e6da947a92203a012ca00ae1e15f837201a04))
* **deps:** bump @sentry/node from 7.60.0 to 7.60.1 ([#9396](https://github.com/mdn/yari/issues/9396)) ([e2b3671](https://github.com/mdn/yari/commit/e2b3671f1de1d5313f3dd98fcd89e258246356a8))
* **deps:** bump @sentry/node from 7.60.1 to 7.61.0 ([#9422](https://github.com/mdn/yari/issues/9422)) ([b8692c9](https://github.com/mdn/yari/commit/b8692c9fff690f58a9e8c6247e1d94e95b5b9962))
* **deps:** bump @sentry/node from 7.61.0 to 7.61.1 ([#9437](https://github.com/mdn/yari/issues/9437)) ([56abc25](https://github.com/mdn/yari/commit/56abc2502ed8a9f32b0bb31553c6647cb962dcb2))
* **deps:** bump @sentry/node from 7.61.1 to 7.62.0 ([#9465](https://github.com/mdn/yari/issues/9465)) ([9e260c6](https://github.com/mdn/yari/commit/9e260c631d49e1f59c3d1fbccffe1fbca5dfd36a))
* **deps:** bump boto3 from 1.28.15 to 1.28.20 in /deployer ([#9446](https://github.com/mdn/yari/issues/9446)) ([e9cdc09](https://github.com/mdn/yari/commit/e9cdc09bd0288e67705d4738501ca442c9e8004c))
* **deps:** bump boto3 from 1.28.3 to 1.28.9 in /deployer ([#9375](https://github.com/mdn/yari/issues/9375)) ([bb73d4e](https://github.com/mdn/yari/commit/bb73d4e8a9c74eb4c92e2ebc1a228b68a65006fb))
* **deps:** bump boto3 from 1.28.9 to 1.28.15 in /deployer ([#9411](https://github.com/mdn/yari/issues/9411)) ([a2d03dd](https://github.com/mdn/yari/commit/a2d03dd216c06765dcc852ff6380aec2ed003bf4))
* **deps:** bump click from 8.1.5 to 8.1.6 in /deployer ([#9377](https://github.com/mdn/yari/issues/9377)) ([d11b0a8](https://github.com/mdn/yari/commit/d11b0a8ba59d6c68e763eb8922ed7ce12fef2cae))
* **deps:** bump fdir from 6.0.1 to 6.0.2 ([#9423](https://github.com/mdn/yari/issues/9423)) ([7c9edbd](https://github.com/mdn/yari/commit/7c9edbd708df6e1ff6d417ecc8787cd5261406ac))
* **deps:** bump inquirer from 9.2.8 to 9.2.9 ([#9417](https://github.com/mdn/yari/issues/9417)) ([429c0a3](https://github.com/mdn/yari/commit/429c0a34181533a35d242659343591970e17335f))
* **deps:** bump inquirer from 9.2.9 to 9.2.10 ([#9453](https://github.com/mdn/yari/issues/9453)) ([ea6427c](https://github.com/mdn/yari/commit/ea6427c5e1479e355d1d95257ad310699d871436))
* **deps:** bump open-editor from 4.0.0 to 4.1.0 ([#9450](https://github.com/mdn/yari/issues/9450)) ([0c22184](https://github.com/mdn/yari/commit/0c22184c78d4b0d630e97679dc5bfc509063e7b4))
* **deps:** bump pygithub from 1.59.0 to 1.59.1 in /deployer ([#9447](https://github.com/mdn/yari/issues/9447)) ([4b177e9](https://github.com/mdn/yari/commit/4b177e9d8b0bc76ced696e56fe119bbb96a27ebc))
* **deps:** bump selectolax from 0.3.14 to 0.3.15 in /deployer ([#9376](https://github.com/mdn/yari/issues/9376)) ([1374a74](https://github.com/mdn/yari/commit/1374a7400b50610ea2a4dd1f6545cd613d360966))
* **deps:** bump selectolax from 0.3.15 to 0.3.16 in /deployer ([#9410](https://github.com/mdn/yari/issues/9410)) ([3c2a19e](https://github.com/mdn/yari/commit/3c2a19e60be313ae536a00f9a561cf3a8a903469))
* **deps:** bump web-specs from 2.63.0 to 2.64.0 ([#9389](https://github.com/mdn/yari/issues/9389)) ([22c5441](https://github.com/mdn/yari/commit/22c54413805f59b83c02280f324ebf6ba54ceaa4))
* **deps:** bump web-specs from 2.64.0 to 2.64.1 ([#9404](https://github.com/mdn/yari/issues/9404)) ([f309a76](https://github.com/mdn/yari/commit/f309a768faf35aa0b53f4a9322ff59d35ca904b6))
* **deps:** bump web-specs from 2.64.1 to 2.65.0 ([#9425](https://github.com/mdn/yari/issues/9425)) ([3217c18](https://github.com/mdn/yari/commit/3217c1858963a15fde215ba28cf164854f71f68a))
* **docs/learn:** add user research survey banner ([#9405](https://github.com/mdn/yari/issues/9405)) ([65f1e4b](https://github.com/mdn/yari/commit/65f1e4b793f5ce7fd0d4a4a0a2b623db67af336d))
* **docs/learn:** remove user research survey banner ([#9441](https://github.com/mdn/yari/issues/9441)) ([e49d8aa](https://github.com/mdn/yari/commit/e49d8aa4ff7b20fe80058ec179868f14718130c7))
* **survey:** add august 2023 discoverability survey ([#9440](https://github.com/mdn/yari/issues/9440)) ([84ae026](https://github.com/mdn/yari/commit/84ae02688d27855ee9a8f7e056808c93bb31a28b))
* update minimum node version from 18.0 to 18.16 ([#9384](https://github.com/mdn/yari/issues/9384)) ([efbeb7d](https://github.com/mdn/yari/commit/efbeb7d241bcdb45102da66efcd07101842c3eb4))

## [2.28.4](https://github.com/mdn/yari/compare/v2.28.3...v2.28.4) (2023-07-21)


### Bug Fixes

* **deployer:** escape markdown markup in link text ([#8996](https://github.com/mdn/yari/issues/8996)) ([810edfa](https://github.com/mdn/yari/commit/810edfa2935a36d76381811f3844d509dacf6e61))
* **play:** fix cursor jump on first edit ([#9356](https://github.com/mdn/yari/issues/9356)) ([216400e](https://github.com/mdn/yari/commit/216400ea6d43baba352210ff2050e20281ebd0e8))


### Enhancements

* **build:** handle missing BLOG_ROOT + log rg errors ([#9340](https://github.com/mdn/yari/issues/9340)) ([dab1fd9](https://github.com/mdn/yari/commit/dab1fd92d636c36073ef1c11933026fc347c5c75))
* **document-survey:** adjust margins and widths ([#9364](https://github.com/mdn/yari/issues/9364)) ([c4ac8ce](https://github.com/mdn/yari/commit/c4ac8ce4df76136cbf61e728c370a7c22dd6707d))


### Miscellaneous

* **deps-dev:** bump eslint-plugin-react from 7.32.2 to 7.33.0 ([#9363](https://github.com/mdn/yari/issues/9363)) ([d53569d](https://github.com/mdn/yari/commit/d53569d9b650e0cd4553e4ea5eab7e6f6697262b))
* **deps-dev:** bump sass from 1.63.6 to 1.64.0 ([#9355](https://github.com/mdn/yari/issues/9355)) ([f9f31cf](https://github.com/mdn/yari/commit/f9f31cfa5c74228b8d67350ba80812be628af7d0))
* **deps-dev:** bump stylelint from 15.10.1 to 15.10.2 ([#9344](https://github.com/mdn/yari/issues/9344)) ([4ba0be2](https://github.com/mdn/yari/commit/4ba0be23e6fc0c8fd021f92b3636ea724d9b514b))
* **deps-dev:** migrate to stylelint-config-recommended-scss ([#9341](https://github.com/mdn/yari/issues/9341)) ([62a544c](https://github.com/mdn/yari/commit/62a544c65becd55f0b9c427467870770781544d9))
* **deps:** bump @mdn/browser-compat-data from 5.3.3 to 5.3.4 ([#9343](https://github.com/mdn/yari/issues/9343)) ([f2e7d16](https://github.com/mdn/yari/commit/f2e7d1656d0b9acee64f5033d47a0e1fe6044c01))
* **deps:** bump @sentry/integrations from 7.59.2 to 7.59.3 ([#9354](https://github.com/mdn/yari/issues/9354)) ([427b03a](https://github.com/mdn/yari/commit/427b03ad8bc16eee63fe024a9455b85fc80358a4))
* **deps:** bump @sentry/integrations from 7.59.3 to 7.60.0 ([#9361](https://github.com/mdn/yari/issues/9361)) ([ea3d030](https://github.com/mdn/yari/commit/ea3d030f10769f1f9c2e7f58fd74d657a48fa615))
* **deps:** bump @sentry/node from 7.57.0 to 7.59.2 ([#9331](https://github.com/mdn/yari/issues/9331)) ([ed51740](https://github.com/mdn/yari/commit/ed51740026f7cf631fa77a908b59df069f3f2c1e))
* **deps:** bump @sentry/node from 7.59.2 to 7.59.3 ([#9353](https://github.com/mdn/yari/issues/9353)) ([550acac](https://github.com/mdn/yari/commit/550acacf82959124c553f55464656fbbba6702e3))
* **deps:** bump @sentry/node from 7.59.3 to 7.60.0 ([#9362](https://github.com/mdn/yari/issues/9362)) ([f028242](https://github.com/mdn/yari/commit/f028242d163b62d911ad66868231207e0f985832))
* **prod-build:** update AI Help index ([22f19fc](https://github.com/mdn/yari/commit/22f19fc4ee83b4851dbdde71750142fc454866a5))

## [2.28.3](https://github.com/mdn/yari/compare/v2.28.2...v2.28.3) (2023-07-18)


### Bug Fixes

* **build:** copy fallback images from en-US to l10n ([#7917](https://github.com/mdn/yari/issues/7917)) ([86a4e6f](https://github.com/mdn/yari/commit/86a4e6fbaaa1ad85a8c47c065f4c15eb4e6d4efc))
* **cloud-function:** remove deprecated X-XSS-Protection header ([#9240](https://github.com/mdn/yari/issues/9240)) ([4a02f2e](https://github.com/mdn/yari/commit/4a02f2ed871fbef498f16862dc0adc238bfae58c))
* **deps-dev:** add @babel/plugin-proposal-private-property-in-object ([#9338](https://github.com/mdn/yari/issues/9338)) ([0b4f31a](https://github.com/mdn/yari/commit/0b4f31ac84bab7cd3048467e20c3643e486c385d))
* **flaws:** stop reporting absolute MDN blog links as broken ([#9080](https://github.com/mdn/yari/issues/9080)) ([e59323f](https://github.com/mdn/yari/commit/e59323f9409ec6294d6addbbc52f062a62b167d1))


### Enhancements

* **release-please:** include chore/enhance commits ([#9339](https://github.com/mdn/yari/issues/9339)) ([ec97a3d](https://github.com/mdn/yari/commit/ec97a3d837660a0d228db724cb162ac6aed89d62))


### Miscellaneous

* **deps-dev:** bump @playwright/test from 1.36.0 to 1.36.1 ([#9315](https://github.com/mdn/yari/issues/9315)) ([df09d78](https://github.com/mdn/yari/commit/df09d78d6b72246fdb849d9cc65aafb37fb9716f))
* **deps-dev:** bump @swc/core from 1.3.69 to 1.3.70 ([#9329](https://github.com/mdn/yari/issues/9329)) ([8f5348b](https://github.com/mdn/yari/commit/8f5348be763fde399a4d98ea3495fe57d20956f7))
* **deps-dev:** bump @types/mdast from 3.0.11 to 4.0.0 ([#9251](https://github.com/mdn/yari/issues/9251)) ([a3406e5](https://github.com/mdn/yari/commit/a3406e584003b593cc5ec2fde4d6a02dc7d5e73f))
* **deps-dev:** bump black from 23.3.0 to 23.7.0 in /deployer ([#9312](https://github.com/mdn/yari/issues/9312)) ([34db2f5](https://github.com/mdn/yari/commit/34db2f5bb74a4f92d0f1ceecae7c03edc6db1c5d))
* **deps-dev:** bump black in /testing/integration ([#9310](https://github.com/mdn/yari/issues/9310)) ([5e45251](https://github.com/mdn/yari/commit/5e45251370e7bb1dccf42ff0d72840740001edbc))
* **deps-dev:** bump eslint from 8.44.0 to 8.45.0 ([#9316](https://github.com/mdn/yari/issues/9316)) ([f67677d](https://github.com/mdn/yari/commit/f67677d1ee27c255665437fa2e61f78c456f7831))
* **deps-dev:** bump eslint-plugin-unicorn from 47.0.0 to 48.0.0 ([#9317](https://github.com/mdn/yari/issues/9317)) ([8661a5c](https://github.com/mdn/yari/commit/8661a5c5701a322b4b04e524fa5bbfa65738c07d))
* **deps-dev:** bump html-validate from 7.18.0 to 8.0.5 ([#9089](https://github.com/mdn/yari/issues/9089)) ([c77a3eb](https://github.com/mdn/yari/commit/c77a3ebef8f1382ca2769c3ed3981bb069d05900))
* **deps-dev:** bump postcss-preset-env from 8.5.1 to 9.0.0 ([#9217](https://github.com/mdn/yari/issues/9217)) ([d8b361c](https://github.com/mdn/yari/commit/d8b361c67663ee06f28c5db270d5b5863091bf2e))
* **deps-dev:** bump react-router-dom from 6.14.1 to 6.14.2 ([#9328](https://github.com/mdn/yari/issues/9328)) ([60974a2](https://github.com/mdn/yari/commit/60974a25bf5db00aa770afa8176d0c1304f568be))
* **deps-dev:** bump stylelint-config-recommended from 12.0.0 to 13.0.0 ([#9247](https://github.com/mdn/yari/issues/9247)) ([e6487bc](https://github.com/mdn/yari/commit/e6487bc297d891bffe3721cf328314f02eb3d7c8))
* **deps-dev:** bump typescript from 5.0.4 to 5.1.6 ([#9196](https://github.com/mdn/yari/issues/9196)) ([c41afe5](https://github.com/mdn/yari/commit/c41afe5585f91be7d0d3953368d242e668177c4c))
* **deps-dev:** bump webpack from 5.88.1 to 5.88.2 ([#9333](https://github.com/mdn/yari/issues/9333)) ([5a4ca67](https://github.com/mdn/yari/commit/5a4ca676ba22fe7361e55f3c7d417ae7decdf349))
* **deps-dev:** bump webpack from 5.88.1 to 5.88.2 in /client/pwa ([#9334](https://github.com/mdn/yari/issues/9334)) ([369f103](https://github.com/mdn/yari/commit/369f103eb3ef7df35821d1d5914206162fa7d77a))
* **deps-dev:** bump workbox-webpack-plugin from 6.6.1 to 7.0.0 ([#8990](https://github.com/mdn/yari/issues/8990)) ([b443c6d](https://github.com/mdn/yari/commit/b443c6de256d6d880391840654b756616e175144))
* **deps-dev:** remove @types/hast ([#9335](https://github.com/mdn/yari/issues/9335)) ([933dfc3](https://github.com/mdn/yari/commit/933dfc383ebffdade99e75f51650ace2d1324c05))
* **deps:** bump aws-actions/configure-aws-credentials ([#9091](https://github.com/mdn/yari/issues/9091)) ([5224452](https://github.com/mdn/yari/commit/52244529e364cc8a6d9d2fa23b4a290e12165013))
* **deps:** bump boto3 from 1.28.1 to 1.28.3 in /deployer ([#9311](https://github.com/mdn/yari/issues/9311)) ([914b9ef](https://github.com/mdn/yari/commit/914b9ef4dbd634135a1b91cdba74f6d99a425ebc))
* **deps:** bump click from 8.1.4 to 8.1.5 in /deployer ([#9314](https://github.com/mdn/yari/issues/9314)) ([f1f7cb3](https://github.com/mdn/yari/commit/f1f7cb342331edfdf311f8b25ce7a34cbf5bb55e))
* **deps:** bump cryptography from 39.0.2 to 41.0.0 in /deployer ([#9006](https://github.com/mdn/yari/issues/9006)) ([db086f5](https://github.com/mdn/yari/commit/db086f502d9254dfe390432729e249cdf8e59dc5))
* **deps:** bump got from 12.6.0 to 13.0.0 ([#8959](https://github.com/mdn/yari/issues/8959)) ([d1511c5](https://github.com/mdn/yari/commit/d1511c524a851aa05547f7c4a24497941b019846))
* **deps:** bump inquirer from 9.2.7 to 9.2.8 ([#9297](https://github.com/mdn/yari/issues/9297)) ([102a212](https://github.com/mdn/yari/commit/102a212ab08fb2987b0e917541a6ec71c7aa7d58))
* **deps:** bump lru-cache from 9.1.2 to 10.0.0 ([#9104](https://github.com/mdn/yari/issues/9104)) ([aac219a](https://github.com/mdn/yari/commit/aac219a4c86357900ae7ef292aa5ea73efc1eeb6))
* **deps:** bump mdast-util-from-markdown from 1.3.1 to 2.0.0 ([#9266](https://github.com/mdn/yari/issues/9266)) ([f2c7a3b](https://github.com/mdn/yari/commit/f2c7a3b6ff52b410a95b8730c271b75b18d90489))
* **deps:** bump mdast-util-phrasing from 3.0.1 to 4.0.0 ([#9269](https://github.com/mdn/yari/issues/9269)) ([9e22f54](https://github.com/mdn/yari/commit/9e22f546491c5179fcd6dcd9a2dca237088b2060))
* **deps:** bump pytest-rerunfailures in /testing/integration ([#9265](https://github.com/mdn/yari/issues/9265)) ([a7a26a2](https://github.com/mdn/yari/commit/a7a26a2d70e9dbac10bd6dc3603c21de7a9103bc))
* **deps:** bump unist-builder from 3.0.1 to 4.0.0 ([#9252](https://github.com/mdn/yari/issues/9252)) ([bc63711](https://github.com/mdn/yari/commit/bc63711be98b96de94f272a286232031f8233645))
* **deps:** bump unist-util-visit from 4.1.2 to 5.0.0 ([#9255](https://github.com/mdn/yari/issues/9255)) ([1d23f5b](https://github.com/mdn/yari/commit/1d23f5bcf3fb07e6d796d1d7f745836f04fd4a7f))
* **deps:** bump word-wrap from 1.2.3 to 1.2.4 ([#9337](https://github.com/mdn/yari/issues/9337)) ([5e07bdc](https://github.com/mdn/yari/commit/5e07bdc54bfdc3e7271124203ba3ab543a93c6ec))
* **deps:** remove html-react-parser ([#9336](https://github.com/mdn/yari/issues/9336)) ([acf220c](https://github.com/mdn/yari/commit/acf220c8f978c21132149b0791d22f7eeb6e8b63))
* **macros:** delete {{Interwiki}} macro ([#9264](https://github.com/mdn/yari/issues/9264)) ([74431cf](https://github.com/mdn/yari/commit/74431cf1e67a72e8c4caa87e69bc48540a36bf2e))
* **server:** remove dev middlewares + merge start:{dev-server,server} scripts ([#8950](https://github.com/mdn/yari/issues/8950)) ([2805415](https://github.com/mdn/yari/commit/2805415bbe2543dc72f40d0c220c6c437ab3e95b))
* **sidebar-filter:** remove feedback footer ([#9242](https://github.com/mdn/yari/issues/9242)) ([c8af475](https://github.com/mdn/yari/commit/c8af475e5d1bddc70fd9f3b2340230989e50d27f))

## [2.28.2](https://github.com/mdn/yari/compare/v2.28.1...v2.28.2) (2023-07-14)


### Bug Fixes

* **blog:** ignore hidden code blocks when calculating read time ([#9302](https://github.com/mdn/yari/issues/9302)) ([9f237bd](https://github.com/mdn/yari/commit/9f237bd5b16f4e4655e1ae783e598e0657b2d884))
* **build:** avoid breadcrumbs over-shortening ([#8830](https://github.com/mdn/yari/issues/8830)) ([285d200](https://github.com/mdn/yari/commit/285d20030a6a5808bba6eb8cb72056872dc1c249))
* **macros/cssxref:** use en-US page to fetch front matter key ([#8884](https://github.com/mdn/yari/issues/8884)) ([7330766](https://github.com/mdn/yari/commit/733076609ecf56080e07a0fe9978b147eedeb954))

## [2.28.1](https://github.com/mdn/yari/compare/v2.28.0...v2.28.1) (2023-07-08)


### Bug Fixes

* **ai-help:** add beta disclaimer banner ([#9261](https://github.com/mdn/yari/issues/9261)) ([eb8bde1](https://github.com/mdn/yari/commit/eb8bde1ec8467a48133aad1fa35f6b4d773b7010))
* **ai-help:** enhance issue reporting ([#9262](https://github.com/mdn/yari/issues/9262)) ([2c9e4bb](https://github.com/mdn/yari/commit/2c9e4bb6a9c429659df5f4cbb286510175c90d33))
* **macros/AddonSidebar:** inline "Using_the_JavaScript_APIs" redirect ([#9212](https://github.com/mdn/yari/issues/9212)) ([d29617c](https://github.com/mdn/yari/commit/d29617c103418321184d25dad722af0cfc40698c))
* **playground:** don't extract inline css ([#9203](https://github.com/mdn/yari/issues/9203)) ([5324a5d](https://github.com/mdn/yari/commit/5324a5d9800dd0727cf05ae2adfd5237289b2ef2))

## [2.28.0](https://github.com/mdn/yari/compare/v2.27.0...v2.28.0) (2023-07-05)


### Features

* **ai-explain:** add ai-explain to code blocks ([#9188](https://github.com/mdn/yari/issues/9188)) ([e342081](https://github.com/mdn/yari/commit/e342081cbf92073ca2071e8af8a9a329b05f3d29))
* **ai-help:** add "Report issue with this answer on GitHub" link ([#9238](https://github.com/mdn/yari/issues/9238)) ([9f9cb5a](https://github.com/mdn/yari/commit/9f9cb5ae7cb8818ca8c13dc864537c5684830dff))


### Bug Fixes

* **ai-explain:** feedback copy ([0a80005](https://github.com/mdn/yari/commit/0a8000540cd824bc9d30111e57ec4ae8651e7ed3))
* **ai-explain:** pause ai-explain ([1bf2856](https://github.com/mdn/yari/commit/1bf285612ca2a2741795916fbe7fd2549e6b0013))
* **ai-help:** add short and extended explanatory guidance ([#9215](https://github.com/mdn/yari/issues/9215)) ([1da1d4e](https://github.com/mdn/yari/commit/1da1d4e93f98e44b15ad277deed6129f35a47e1e))

## [2.27.0](https://github.com/mdn/yari/compare/v2.26.0...v2.27.0) (2023-06-27)


### Features

* **plus:** add AI Help frontend ([#9116](https://github.com/mdn/yari/issues/9116)) ([ab93937](https://github.com/mdn/yari/commit/ab9393793d31bc33902049677cec1c968ad3877e))
* **surveys:** add Blog Feedback survey ([#9173](https://github.com/mdn/yari/issues/9173)) ([b4f6115](https://github.com/mdn/yari/commit/b4f61155a1aadca72eab7a7b8f0514820e5ae114))


### Bug Fixes

* **live-sample:** use getElementsByClassName ([#9182](https://github.com/mdn/yari/issues/9182)) ([5615b63](https://github.com/mdn/yari/commit/5615b636a4fcda62b0fec57e577903a62710665c))
* **playground:** only initialize once ([#9176](https://github.com/mdn/yari/issues/9176)) ([005b0f8](https://github.com/mdn/yari/commit/005b0f803ecc48ac0480daaa4dd5d8317fba3b51))

## [2.26.0](https://github.com/mdn/yari/compare/v2.25.0...v2.26.0) (2023-06-26)


### Features

* **blog:** add author avatars ([#9131](https://github.com/mdn/yari/issues/9131)) ([f8d0251](https://github.com/mdn/yari/commit/f8d025145ce8b3ed1dd9b14174c0359ba76a1190))
* **blog:** previous/next links at end of posts ([#8922](https://github.com/mdn/yari/issues/8922)) ([1da298c](https://github.com/mdn/yari/commit/1da298c5246cd449c211a14ff24023251c26788d))
* **blog:** show newsletter form or link below posts ([#8920](https://github.com/mdn/yari/issues/8920)) ([203b298](https://github.com/mdn/yari/commit/203b29811797b9396425bd0e8219bb0e6fb82eae))
* **footer:** add blog feed icon ([#9060](https://github.com/mdn/yari/issues/9060)) ([0f6a075](https://github.com/mdn/yari/commit/0f6a075ed99ba4f997e624e9be04132ebbe5eae8))
* **playground:** Introduce the MDN Playground ([#9117](https://github.com/mdn/yari/issues/9117)) ([b3050a4](https://github.com/mdn/yari/commit/b3050a428e237aeb6a27d0ef2cead1f50912c511))
* **sidebar:** add filter ([#8968](https://github.com/mdn/yari/issues/8968)) ([3a4c28d](https://github.com/mdn/yari/commit/3a4c28dbfaab6a61ca6bee8606f9a5bc5d36400b))


### Bug Fixes

* **gcp:** cache volatile content for 1h ([#9050](https://github.com/mdn/yari/issues/9050)) ([78c6e35](https://github.com/mdn/yari/commit/78c6e357ebd433742ad2486716f777401f54c946))
* **github:** include build/** in search results ([#9030](https://github.com/mdn/yari/issues/9030)) ([16f8fd3](https://github.com/mdn/yari/commit/16f8fd38fbdbd1301198fd5e7f2422fede8d930e))
* **glean:** avoid gleanClick changing between re-renders ([#9108](https://github.com/mdn/yari/issues/9108)) ([db88b56](https://github.com/mdn/yari/commit/db88b56bb86d9900a62b00ca3476a93f169056c4))
* **icons:** use rotated thumbs-up as thumbs-down ([#9107](https://github.com/mdn/yari/issues/9107)) ([f05db31](https://github.com/mdn/yari/commit/f05db31ff1b8e4af385072c55aeec96f6dbe12c4))
* **livesamples:** use correct legacy url ([#9158](https://github.com/mdn/yari/issues/9158)) ([1da46c9](https://github.com/mdn/yari/commit/1da46c950fcb18642e0a5ce0eb74248201361bea))
* **playground:** console scroll to bottom ([#9153](https://github.com/mdn/yari/issues/9153)) ([85871bb](https://github.com/mdn/yari/commit/85871bbdae0d3a7bb6025704d30a3b26c33346b5))
* **playground:** render SVGs ([#9141](https://github.com/mdn/yari/issues/9141)) ([0caebd9](https://github.com/mdn/yari/commit/0caebd91d34b66b13b39530afc10c43cd3211787))
* prevent live-sample render errors killing the whole build ([#9155](https://github.com/mdn/yari/issues/9155)) ([c99d7fe](https://github.com/mdn/yari/commit/c99d7fee024d224f36edfa069d5f0fdd4833a4cd))
* **prod:** set ORIGIN_PLAY for cloud function ([#9136](https://github.com/mdn/yari/issues/9136)) ([e50d50c](https://github.com/mdn/yari/commit/e50d50c70ce55f248b613ff67dda0fabfb240257))

## [2.25.0](https://github.com/mdn/yari/compare/v2.24.0...v2.25.0) (2023-06-06)


### Features

* **client/env:** split CRUD_MODE into WRITER_MODE and DEV_MODE ([#8383](https://github.com/mdn/yari/issues/8383)) ([675a854](https://github.com/mdn/yari/commit/675a854205c05576eb34b85f813577d6bd1106f0))

## [2.24.0](https://github.com/mdn/yari/compare/v2.23.1...v2.24.0) (2023-06-05)


### Features

* **docs:** allow audio (mp3/ogg), video (mp4/webm) and font (woff2) attachments ([#7605](https://github.com/mdn/yari/issues/7605)) ([73f8dbc](https://github.com/mdn/yari/commit/73f8dbc6c8baf66a116225cae29c19e80d5b6b4a))
* **macros:** add GlossarySidebar macro ([#8997](https://github.com/mdn/yari/issues/8997)) ([e704315](https://github.com/mdn/yari/commit/e7043154bf532cb1a81f1857ba9b4b9f80250498))
* **macros:** add XsltSidebar for XSLT pages ([#9021](https://github.com/mdn/yari/issues/9021)) ([bddd9f7](https://github.com/mdn/yari/commit/bddd9f7eb1bb3e545b16eb68b62d644909fb68d4))
* **placement:** hp takeover ([#9022](https://github.com/mdn/yari/issues/9022)) ([2ff4a7b](https://github.com/mdn/yari/commit/2ff4a7b11475d8dac0a072475d5cd08a99d558a4))
* pride month 2023 ([#8979](https://github.com/mdn/yari/issues/8979)) ([776e70a](https://github.com/mdn/yari/commit/776e70a2085252c155596df4a5b79a170e506319))


### Bug Fixes

* **constants:** add Polish to RETIRED_LOCALES ([#8970](https://github.com/mdn/yari/issues/8970)) ([08c15a3](https://github.com/mdn/yari/commit/08c15a3c33ac1eb4801a8b478cb1e99548a9ecab))
* **toolbar:** reduce height if read-only ([#8976](https://github.com/mdn/yari/issues/8976)) ([9e91c72](https://github.com/mdn/yari/commit/9e91c723a088cbfd8ab9bc148aae4a907a80baa5))

## [2.23.1](https://github.com/mdn/yari/compare/v2.23.0...v2.23.1) (2023-05-29)


### Bug Fixes

* **kumascript:** mention path in render error message ([#8936](https://github.com/mdn/yari/issues/8936)) ([27938ad](https://github.com/mdn/yari/commit/27938adc275d599363b09d526395ab7c739d025b))
* **kumascript:** mention path in render error message (v2) ([#8953](https://github.com/mdn/yari/issues/8953)) ([a9d7370](https://github.com/mdn/yari/commit/a9d737026ac159458a18ed261321e14751aff382))

## [2.23.0](https://github.com/mdn/yari/compare/v2.22.0...v2.23.0) (2023-05-25)


### Features

* **newsletter:** add public sign-up page ([#8686](https://github.com/mdn/yari/issues/8686)) ([bf3fbf7](https://github.com/mdn/yari/commit/bf3fbf70d0487fb6cb66026bcf9a9942bb64e63a))


### Bug Fixes

* **cloud-function:** strip X-Forwarded-Host + Forwarded headers ([#8894](https://github.com/mdn/yari/issues/8894)) ([74bab35](https://github.com/mdn/yari/commit/74bab354a076ad044d909b30991784cd163ace1a))
* **csp,fundamental-redirects:** replace media.*.mdn.mozit.cloud with mdn.dev ([#8873](https://github.com/mdn/yari/issues/8873)) ([2c81bf5](https://github.com/mdn/yari/commit/2c81bf58e0ab533960b716f00d6e5b43f4d46dd0))
* **quicksearch:** opened pages don't scroll to top ([#8911](https://github.com/mdn/yari/issues/8911)) ([964251b](https://github.com/mdn/yari/commit/964251b2fa54532eae121f61e57700378e920d25))

## [2.22.0](https://github.com/mdn/yari/compare/v2.21.0...v2.22.0) (2023-05-19)


### Features

* **syntax-highlight:** add apacheconf to Prism.js languages ([#8862](https://github.com/mdn/yari/issues/8862)) ([8b8ae3d](https://github.com/mdn/yari/commit/8b8ae3d1e7e5ec63599946a1ad8a699d93a7ffa0))


### Bug Fixes

* **blog:** hydration error on date ([#8871](https://github.com/mdn/yari/issues/8871)) ([a271858](https://github.com/mdn/yari/commit/a271858662aef8963ca4a5826636d077db5431c8))
* **content:** only collect required translations ([#8806](https://github.com/mdn/yari/issues/8806)) ([5ec562c](https://github.com/mdn/yari/commit/5ec562cd2d59d0fd0e4f5d3cb8ac48e2a4985274))
* **sidebar:** incorrect offset and z-index on mobile ([#8856](https://github.com/mdn/yari/issues/8856)) ([af1cfdc](https://github.com/mdn/yari/commit/af1cfdc4b728a85df9263986809dbd3df1a37f14))
* **top-banner:** adjust width ([#8863](https://github.com/mdn/yari/issues/8863)) ([f5c6dbc](https://github.com/mdn/yari/commit/f5c6dbc5f674a5c4967aa331c88d01abe74c0f94))
* **ui:** gap at top of page in tablet mode ([#8885](https://github.com/mdn/yari/issues/8885)) ([dd98b12](https://github.com/mdn/yari/commit/dd98b127bdc8ce655a38ba4db37343af86345f9d))
* **workflows:** rate limit downloading ripgrep ([#8865](https://github.com/mdn/yari/issues/8865)) ([6187817](https://github.com/mdn/yari/commit/61878177d153cf17c8d968ed4de953bc4a81589e))

## [2.21.0](https://github.com/mdn/yari/compare/v2.20.3...v2.21.0) (2023-05-15)


### Features

* **build:** collect errors + warnings with @sentry/node ([#8571](https://github.com/mdn/yari/issues/8571)) ([f18d609](https://github.com/mdn/yari/commit/f18d609c6ddfda87efca707234f9d4a6c49798df))
* **ci:** add xyz-build ([#8661](https://github.com/mdn/yari/issues/8661)) ([77df4fc](https://github.com/mdn/yari/commit/77df4fc754464e4ba241589d8f5f21d0a9dc8a23))


### Bug Fixes

* avoid leading double slash ([#8846](https://github.com/mdn/yari/issues/8846)) ([0fb0fa9](https://github.com/mdn/yari/commit/0fb0fa9008d8e866367a37288050ca1e40be443a))
* **CSS:** last elements inside blockquotes do not need bottom margin ([#8855](https://github.com/mdn/yari/issues/8855)) ([80094ea](https://github.com/mdn/yari/commit/80094ea5054fec899b15a2d4e2310053eac542eb))
* **macros/PWASidebar:** remove structural overview page ([#8845](https://github.com/mdn/yari/issues/8845)) ([93ac66f](https://github.com/mdn/yari/commit/93ac66fb39b7614c8f33f16a8dd4a84026acaa70))

## [2.20.3](https://github.com/mdn/yari/compare/v2.20.2...v2.20.3) (2023-05-11)


### Bug Fixes

* **lint-staged:** use negative pattern correctly ([#8842](https://github.com/mdn/yari/issues/8842)) ([8e74e5f](https://github.com/mdn/yari/commit/8e74e5fb0518d8b140a41a965e71ab267e11bef5))
* **npm-publish:** setup node with registry url ([#8841](https://github.com/mdn/yari/issues/8841)) ([660a28b](https://github.com/mdn/yari/commit/660a28ba34772eba75a602de01a1fa2aa8865992))

## [2.20.2](https://github.com/mdn/yari/compare/v2.20.1...v2.20.2) (2023-05-11)


### Bug Fixes

* **npm-publish:** restore --access public option ([#8839](https://github.com/mdn/yari/issues/8839)) ([c5f8c48](https://github.com/mdn/yari/commit/c5f8c48ada5b17ef672810e09ca399ea518a46fa))

## [2.20.1](https://github.com/mdn/yari/compare/v2.20.0...v2.20.1) (2023-05-11)


### Bug Fixes

* **dev:** TypeScript errors when running `yarn dev` ([#8835](https://github.com/mdn/yari/issues/8835)) ([039515b](https://github.com/mdn/yari/commit/039515b730f6a636e0791e683604ae7fa8ad5072))
* **npm-publish:** revert renaming of NPM_AUTH_TOKEN ([#8831](https://github.com/mdn/yari/issues/8831)) ([3ccc923](https://github.com/mdn/yari/commit/3ccc923e6690fa81b08435cf6e4ca44812fd06a4))

## [2.20.0](https://github.com/mdn/yari/compare/v2.19.0...v2.20.0) (2023-05-10)


### Features

* **docs:** baseline indicator ([#8772](https://github.com/mdn/yari/issues/8772)) ([35786d8](https://github.com/mdn/yari/commit/35786d80399b225507530931286deaa55b0c9a82))

## [2.19.0](https://github.com/mdn/yari/compare/v2.18.1...v2.19.0) (2023-05-10)


### Features

* **banner:** add blog announcement banner ([#8801](https://github.com/mdn/yari/issues/8801)) ([2e730ae](https://github.com/mdn/yari/commit/2e730ae35c5634e10b3ab2202e605a6e4f09c647))
* **fundamental-redirects:** redirect archived media ([#8785](https://github.com/mdn/yari/issues/8785)) ([784beeb](https://github.com/mdn/yari/commit/784beeb2d7eda26c47528e58164693952d0c30db))


### Bug Fixes

* **blog:** add build step ([e1366c5](https://github.com/mdn/yari/commit/e1366c558cbb254d195a45d5605b632b63e24356))
* **ci:** limit failing CI from running on forks ([877d6fa](https://github.com/mdn/yari/commit/877d6fa3569a306fd8e76f2556cd3d3577f49953))
* **cloud-function:** fix fxa webhooks ([#8706](https://github.com/mdn/yari/issues/8706)) ([d6421a5](https://github.com/mdn/yari/commit/d6421a56c93655047a9c52205cdff1f675877f1f))
* **jest:** reduce memory usage ([#8753](https://github.com/mdn/yari/issues/8753)) ([47910ee](https://github.com/mdn/yari/commit/47910ee04e30ac129459a8c1628ac375518884c3))
* **jest:** use --rootDir option ([#8754](https://github.com/mdn/yari/issues/8754)) ([80f51f4](https://github.com/mdn/yari/commit/80f51f4a15680a0737b776d8ef5b6d630d634677))
* **layout:** consolidate sticky header ([#8781](https://github.com/mdn/yari/issues/8781)) ([496ab9f](https://github.com/mdn/yari/commit/496ab9f36773d86b6d8f7478deaa34e106353b88))
* **ssr:** add hreflang to alternate rss link ([#8756](https://github.com/mdn/yari/issues/8756)) ([f71415e](https://github.com/mdn/yari/commit/f71415ef6d3f22db9a74b33711133dfb440129f5))
* **sync:** don't deploy to static/static ([#8803](https://github.com/mdn/yari/issues/8803)) ([c453e79](https://github.com/mdn/yari/commit/c453e79f2cb922bf429a3caf2d553a2d353bb39b))
* **sync:** skip rsync for static ([#8805](https://github.com/mdn/yari/issues/8805)) ([8951f2a](https://github.com/mdn/yari/commit/8951f2a3af2b6ac19eff2a45aafc1bb7e029cdb2))
* tool `yarn content move` converts double quotes to single quotes in title ([#8623](https://github.com/mdn/yari/issues/8623)) ([7da24a4](https://github.com/mdn/yari/commit/7da24a408ae8ea628feaf7e55b18d6f32b6a39ad))
* Wrap SVG Mandala to reduce CPU usage ([#8622](https://github.com/mdn/yari/issues/8622)) ([35c9ae9](https://github.com/mdn/yari/commit/35c9ae91e548d417c836e437ecda3e8546888180))
