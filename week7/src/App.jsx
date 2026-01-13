import { RouterProvider } from "react-router-dom";
import MessageToast from './component/MessageToast';

import { router } from "./router";
function App() {
  return (
    <>
      <MessageToast />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
