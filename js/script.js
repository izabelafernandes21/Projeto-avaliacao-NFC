let rating = 0;

        const stars = document.querySelectorAll(".star");
        const label = document.getElementById("rating-label");
        const submit = document.getElementById("submit");
        const restart = document.getElementById("restart");

        const formScreen =
            document.getElementById("form-screen");

        const successScreen =
            document.getElementById("success-screen");

        const commentField =
            document.getElementById("comment");

        const successStars =
            document.getElementById("success-stars");

        const successRating =
            document.getElementById("success-rating");

        const labels = [
            "Selecione uma nota",
            "Muito ruim",
            "Ruim",
            "Regular",
            "Bom",
            "Excelente!"
        ];

        // Seleção das estrelas
        stars.forEach(star => {
            star.addEventListener("click", () => {
                rating = Number(star.dataset.value);

                stars.forEach(item => {
                    const value = Number(item.dataset.value);

                    item.classList.toggle(
                        "active", value <= rating
                    );

                    item.setAttribute(
                        "aria-pressed",
                        String(value === rating)
                    );
                });

                label.textContent = labels[rating];
                submit.disabled = false;
            });
        });

        // Enviar avaliação demonstrativa
        submit.addEventListener("click", () => {
            if (rating < 1 || rating > 5) return;

            const comment = commentField.value.trim();

            try {
                PulseStorage.save(rating, comment);
            } catch (error) {
                console.error("Falha ao salvar:", error);
                alert("Nao foi possivel salvar a avaliacao neste navegador. Tente novamente.");
                return;
            }

            // Mostrar a nota escolhida
            successStars.textContent = "★".repeat(rating);

            successRating.textContent =
                "Sua avaliação: " + rating +
                (rating === 1 ? " estrela" : " estrelas");

            // Trocar de tela
            formScreen.classList.add("hidden");
            successScreen.classList.remove("hidden");

            // Direcionar o foco para a confirmação
            successScreen.setAttribute("tabindex", "-1");
            successScreen.focus();
        });

        // Reiniciar formulário
        restart.addEventListener("click", () => {
            rating = 0;

            // Limpar estrelas
            stars.forEach(star => {
                star.classList.remove("active");
                star.setAttribute("aria-pressed", "false");
            });

            // Limpar comentário
            commentField.value = "";

            // Restaurar mensagem inicial
            label.textContent = labels[0];

            // Desativar botão até selecionar nota
            submit.disabled = true;

            // Voltar ao formulário
            successScreen.classList.add("hidden");
            formScreen.classList.remove("hidden");

            // Voltar o foco à primeira estrela
            stars[0].focus();
        });
