const { ChildFrame } = require("../../build/index");



(function() {
    const frameEvents = new ChildFrame();
    
    document.querySelector("button").addEventListener("click", function () {
    frameEvents.run.updateCounter();
    });
})();