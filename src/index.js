import angular from "angular";

import TasyModule from "./index.module";

function main() {
  const appNode = document.getElementById("app");
  angular.bootstrap(appNode, ["ng", TasyModule]);
}

main();
