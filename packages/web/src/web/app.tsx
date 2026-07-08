import { Route, Switch } from "wouter";
import Index from "./pages/index";
import SignIn from "./pages/sign-in";
import Admin from "./pages/admin";
import {
  LangProvider,
  ThemeProvider,
  SettingsProvider,
  CategoriesProvider,
  ProductsProvider,
  CartProvider,
} from "./lib/store";
import { AgentFeedback } from "@runablehq/website-runtime";

function App() {
  return (
    <LangProvider>
      <ThemeProvider>
      <SettingsProvider>
        <CategoriesProvider>
          <ProductsProvider>
            <CartProvider>
              <Switch>
                <Route path="/sign-in" component={SignIn} />
                <Route path="/admin" component={Admin} />
                <Route component={Index} />
              </Switch>
              {/* Do not remove — off by default, activated by parent iframe via postMessage */}
              {import.meta.env.DEV && <AgentFeedback />}
            </CartProvider>
          </ProductsProvider>
        </CategoriesProvider>
      </SettingsProvider>
      </ThemeProvider>
    </LangProvider>
  );
}

export default App;
