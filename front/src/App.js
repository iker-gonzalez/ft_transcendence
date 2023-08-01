Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function App() {
    const onClickButton = () => alert("Button clicked");
    const contentStyle = {
        color: "#00babc",
        fontSize: "20px",
      };
    return (
        <>
            <h1>Hello World!</h1>
            <p style={contentStyle}>42Urduliz : Spain</p>
            <button onClick={onClickButton}>Click here:</button>
        </>
    );
}
export default App;
