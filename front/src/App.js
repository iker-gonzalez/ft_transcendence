Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var MyFisrtComponent_1 = require("./components/MyFisrtComponent");
var SecondComponent_1 = require("./components/SecondComponent");
function App() {
    var onClickButton = function () { return alert("Button clicked"); };
    return (<>
     <h1>Hello World!</h1>
    <MyFisrtComponent_1.default />
     <button onClick={onClickButton}>Click here</button>
    <SecondComponent_1.default />
   </>);
}
export default App;
