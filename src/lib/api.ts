import { toast } from "@/hooks/use-toast";

// A simple wrapper around fetch to automatically add the auth token
// and handle common error scenarios.

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("authToken");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle authentication errors specifically
    if (response.status === 401) {
      // You might want to redirect to login here
      localStorage.removeItem("authToken");
      toast({
        title: "Sessão Expirada",
        description: "Por favor, faça login novamente.",
        variant: "destructive",
      });
      // Optionally, redirect to login page after a delay
      setTimeout(() => window.location.reload(), 2000);
    }
    
    // Try to parse error details from the backend
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || "Ocorreu um erro na requisição.");
  }

  return response;
}
