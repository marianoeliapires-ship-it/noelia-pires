export async function decidirMovimientoIA(estado) {

    try {
        const response = await fetch("http://localhost:3000/ia", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerX: estado.playerX,
                iaX: estado.iaX
            })
        });

        const data = await response.json();

        return data.decision.trim();

    } catch (error) {
        console.error("Error IA:", error);
        return "recto"; // fallback para que no se rompa
    }
}