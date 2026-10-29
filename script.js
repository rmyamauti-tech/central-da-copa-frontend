
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario-chat");
  const campoPergunta = document.getElementById("campo-pergunta");
  const mensagens = document.getElementById("mensagens");
  const botaoEnviar = document.getElementById("botao-enviar");

  const ENDERECO_API = "http://127.0.0.1:5000/chat";

  // Confere se os elementos do HTML foram encontrados.
  if (!formulario || !campoPergunta || !mensagens || !botaoEnviar) {
    console.error(
      "Erro: não encontrei todos os elementos do chat. Confira o index.html."
    );
    return;
  }

  function adicionarMensagem(texto, tipo) {
    const mensagem = document.createElement("div");
    mensagem.classList.add("mensagem");

    const ehUsuario = tipo === "usuario";
    mensagem.classList.add(
      ehUsuario ? "mensagem-usuario" : "mensagem-bot"
    );

    const avatar = document.createElement("div");
    avatar.className = "mensagem-avatar";
    avatar.textContent = ehUsuario ? "👤" : "⚽";

    const conteudo = document.createElement("div");
    conteudo.className = "mensagem-conteudo";

    const autor = document.createElement("span");
    autor.className = "mensagem-autor";
    autor.textContent = ehUsuario ? "VOCÊ" : "CENTRAL DA COPA";

    const textoMensagem = document.createElement("div");
    textoMensagem.className = "mensagem-texto";
    textoMensagem.textContent = texto;

    conteudo.append(autor, textoMensagem);
    mensagem.append(avatar, conteudo);
    mensagens.appendChild(mensagem);

    mensagens.scrollTop = mensagens.scrollHeight;
  }

  // Envia a pergunta ao backend.
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const pergunta = campoPergunta.value.trim();

    if (!pergunta) {
      campoPergunta.focus();
      return;
    }

    adicionarMensagem(pergunta, "usuario");
    campoPergunta.value = "";
    botaoEnviar.disabled = true;
    botaoEnviar.querySelector("span").textContent = "Enviando...";

    try {
      const resposta = await fetch(ENDERECO_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pergunta: pergunta })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || dados.resposta || `Erro HTTP ${resposta.status}`
        );
      }

      const textoResposta =
        dados.resposta || dados.resposta_bot || dados.mensagem;

      if (!textoResposta) {
        throw new Error("O backend não retornou o campo 'resposta'.");
      }

      adicionarMensagem(textoResposta, "bot");
    } catch (erro) {
      console.error("Erro ao enviar pergunta:", erro);

      adicionarMensagem(
        "Não consegui obter uma resposta. Confira o terminal do Flask e o Console do navegador para identificar o erro.",
        "bot"
      );
    } finally {
      botaoEnviar.disabled = false;
      botaoEnviar.querySelector("span").textContent = "Enviar";
      campoPergunta.focus();
    }
  });

  // Os cartões preenchem somente o campo do chat.
  document.querySelectorAll(".sugestao").forEach((botao) => {
    botao.addEventListener("click", (evento) => {
      evento.preventDefault();
      campoPergunta.value = botao.dataset.pergunta || "";
      campoPergunta.focus();
    });
  });

  console.log("Central da Copa: JavaScript carregado corretamente.");
});
