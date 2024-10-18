import { Toaster } from "./components/ui/toaster"
import AuthScreen from "./pages/AuthScreen"

function App() {
  return (
    <body className="h-screen w-screen">
      <AuthScreen />
      <Toaster />
    </body>
  )
}

export default App
