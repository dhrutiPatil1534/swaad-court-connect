import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pb-20 md:pb-0">
      {children}
    </main>
    <BottomNav />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <AppLayout>
                      <Home />
                    </AppLayout>
                  } 
                />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login />} />
                <Route 
                  path="/restaurants" 
                  element={
                    <AppLayout>
                      <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold">Restaurants - Coming Soon</h1>
                      </div>
                    </AppLayout>
                  } 
                />
                <Route 
                  path="/cart" 
                  element={
                    <AppLayout>
                      <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold">Cart - Coming Soon</h1>
                      </div>
                    </AppLayout>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <AppLayout>
                      <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold">Orders - Coming Soon</h1>
                      </div>
                    </AppLayout>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <AppLayout>
                      <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold">Profile - Coming Soon</h1>
                      </div>
                    </AppLayout>
                  } 
                />
                <Route 
                  path="/search" 
                  element={
                    <AppLayout>
                      <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold">Search - Coming Soon</h1>
                      </div>
                    </AppLayout>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
