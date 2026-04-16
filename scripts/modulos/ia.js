export async function comentarCarreraIA(datos) {

  console.log("🚀 Enviando a IA:", datos);  

  try {
    const response = await fetch("http://localhost:3000/ia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const data = await response.json();

    console.log("🎤 IA RESPONDE:", data);

    return data.comentario || "🔥 ¡Acción en pista!";

  } catch (error) {
    console.error("❌ Error IA:", error);
    return "⚠️ Error IA";
  }
}